import asyncio
import logging
import os
import re
import shutil
import tempfile
from pathlib import Path
from threading import Lock

# Audio is only staged here while it is generated. The API persists the final
# MP3 in PostgreSQL, so deployments never depend on a repository-local audio
# directory that disappears when an instance restarts.
AUDIO_DIR = Path(os.getenv("VOX_TEMP_AUDIO_DIR", tempfile.gettempdir())) / "vox-audio"
DEFAULT_VOICE = "en-US-JennyNeural"
EDGE_VOICES = {
    "English Professional Reader": "en-US-JennyNeural",
    "Foreign Country Reader": "en-GB-SoniaNeural",
    "Hindi Reader": "hi-IN-SwaraNeural",
    "Tamil Reader": "ta-IN-PallaviNeural",
    "Telugu Reader": "te-IN-ShrutiNeural",
    "Kannada Reader": "kn-IN-SapnaNeural",
}

# edge_tts already splits any single request into <=4096 byte SSML segments
# internally, but a very long document held open on one websocket connection
# for many minutes is fragile. We additionally split into smaller chunks at
# paragraph/sentence/word boundaries, generate each chunk's audio separately,
# and concatenate the resulting mp3s into one continuous file. This keeps
# each network call short (bounded by CHUNK_TIMEOUT_SECONDS) so a slow or
# dropped connection only risks one chunk, never the whole document.
MAX_CHUNK_CHARS = int(os.getenv("VOX_TTS_CHUNK_CHARS", "3000"))
CHUNK_TIMEOUT_SECONDS = int(os.getenv("VOX_TTS_CHUNK_TIMEOUT", "90"))
MAX_TEXT_CHARS = int(os.getenv("VOX_MAX_TEXT_CHARS", "200000"))
# Chunks are independent network calls to the edge-tts service, so they are
# generated concurrently instead of one after another. Bounded so a long
# document doesn't open dozens of simultaneous connections at once.
MAX_CONCURRENT_CHUNKS = int(os.getenv("VOX_TTS_CONCURRENCY", "4"))
# A single flaky/dropped connection out of dozens of concurrent chunk requests
# should not fail an entire large document. Retry that one chunk before
# giving up on the whole job.
TTS_MAX_RETRIES = int(os.getenv("VOX_TTS_MAX_RETRIES", "2"))
TTS_RETRY_BACKOFF_SECONDS = float(os.getenv("VOX_TTS_RETRY_BACKOFF_SECONDS", "1.5"))

logger = logging.getLogger("vox.tts")


class TextTooLongError(ValueError):
    pass


# In-memory only: best-effort progress for the single process generating the
# audio. If a job is polled from a different process/instance this simply
# reports no progress yet; the authoritative status still comes from the jobs
# table, so nothing depends on this for correctness.
_progress_lock = Lock()
_progress: dict[str, dict[str, int]] = {}


def get_progress(chunk_id: str) -> dict[str, int] | None:
    with _progress_lock:
        state = _progress.get(chunk_id)
        return dict(state) if state else None


def _set_progress(chunk_id: str, total: int) -> None:
    with _progress_lock:
        _progress[chunk_id] = {"total": total, "completed": 0}


def _mark_chunk_done(chunk_id: str) -> None:
    with _progress_lock:
        state = _progress.get(chunk_id)
        if state:
            state["completed"] += 1


def _clear_progress(chunk_id: str) -> None:
    with _progress_lock:
        _progress.pop(chunk_id, None)


def audio_path(chunk_id: str) -> Path:
    AUDIO_DIR.mkdir(exist_ok=True)
    return AUDIO_DIR / f"{chunk_id}.mp3"


def text_stats(text: str) -> dict[str, int]:
    paragraphs = [p for p in re.split(r"\n\s*\n", text) if p.strip()]
    words = text.split()
    return {
        "characters": len(text),
        "words": len(words),
        "paragraphs": max(len(paragraphs), 1 if text.strip() else 0),
    }


def validate_text_length(text: str) -> None:
    if len(text) > MAX_TEXT_CHARS:
        raise TextTooLongError(
            f"Text is too long ({len(text)} characters). "
            f"The maximum supported length is {MAX_TEXT_CHARS} characters per conversion."
        )


def _split_by_words(text: str, max_chars: int) -> list[str]:
    words = text.split(" ")
    chunks: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip() if current else word
        if len(candidate) <= max_chars or not current:
            current = candidate
        else:
            chunks.append(current)
            current = word
    if current:
        chunks.append(current)
    return chunks


def _split_by_sentences(paragraph: str, max_chars: int) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", paragraph)
    chunks: list[str] = []
    current = ""
    for sentence in sentences:
        if len(sentence) > max_chars:
            if current:
                chunks.append(current)
                current = ""
            chunks.extend(_split_by_words(sentence, max_chars))
            continue
        candidate = f"{current} {sentence}".strip() if current else sentence
        if len(candidate) <= max_chars or not current:
            current = candidate
        else:
            chunks.append(current)
            current = sentence
    if current:
        chunks.append(current)
    return chunks


def split_into_chunks(text: str, max_chars: int = MAX_CHUNK_CHARS) -> list[str]:
    """Split text into speakable chunks, preferring paragraph, then sentence,
    then word boundaries. Never drops content."""
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    if not paragraphs:
        return []

    chunks: list[str] = []
    current = ""
    for paragraph in paragraphs:
        if len(paragraph) > max_chars:
            if current:
                chunks.append(current)
                current = ""
            chunks.extend(_split_by_sentences(paragraph, max_chars))
            continue
        candidate = f"{current}\n\n{paragraph}" if current else paragraph
        if len(candidate) <= max_chars or not current:
            current = candidate
        else:
            chunks.append(current)
            current = paragraph
    if current:
        chunks.append(current)
    return chunks


async def _generate_chunk_part(
    chunk_text: str, part_path: Path, voice_id: str, semaphore: asyncio.Semaphore, chunk_id: str
) -> None:
    from edge_tts import Communicate

    last_error: Exception | None = None
    for attempt in range(TTS_MAX_RETRIES + 1):
        try:
            async with semaphore:
                await asyncio.wait_for(
                    Communicate(chunk_text, voice_id).save(str(part_path)),
                    timeout=CHUNK_TIMEOUT_SECONDS,
                )
            if not part_path.exists() or part_path.stat().st_size == 0:
                raise RuntimeError("produced no audio")
            _mark_chunk_done(chunk_id)
            return
        except Exception as error:
            last_error = error
            if attempt < TTS_MAX_RETRIES:
                logger.warning(
                    "tts_chunk_retry chunk_id=%s attempt=%d error=%s",
                    chunk_id, attempt + 1, error,
                )
                await asyncio.sleep(TTS_RETRY_BACKOFF_SECONDS * (attempt + 1))
    raise last_error


async def generate_audio_file(text: str, chunk_id: str, voice: str) -> str:
    normalized = text.strip()
    if not normalized:
        raise ValueError("No text was provided to convert to audio.")
    validate_text_length(normalized)

    chunks = split_into_chunks(normalized)
    if not chunks:
        raise ValueError("No readable text was found to convert to audio.")

    stats = text_stats(normalized)
    logger.info(
        "tts_start chunk_id=%s characters=%d words=%d paragraphs=%d chunks=%d voice=%s",
        chunk_id, stats["characters"], stats["words"], stats["paragraphs"], len(chunks), voice,
    )

    voice_id = EDGE_VOICES.get(voice, DEFAULT_VOICE)
    final_path = audio_path(chunk_id)
    work_dir = Path(tempfile.mkdtemp(prefix=f"vox-{chunk_id}-"))
    # Parts are written to files named by index, then combined in that order,
    # so concurrent completion order never affects the final audio.
    part_paths = [work_dir / f"part-{index:04d}.mp3" for index in range(len(chunks))]
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_CHUNKS)
    _set_progress(chunk_id, len(chunks))
    try:
        results = await asyncio.gather(
            *(
                _generate_chunk_part(chunk_text, part_path, voice_id, semaphore, chunk_id)
                for chunk_text, part_path in zip(chunks, part_paths)
            ),
            return_exceptions=True,
        )
        failures = [(index, error) for index, error in enumerate(results) if isinstance(error, Exception)]
        if failures:
            first_index, first_error = failures[0]
            succeeded = len(chunks) - len(failures)
            raise RuntimeError(
                f"Audio generation failed on part {first_index + 1} of {len(chunks)}. "
                f"{succeeded} of {len(chunks)} parts completed successfully."
            ) from first_error

        with open(final_path, "wb") as combined:
            for part_path in part_paths:
                combined.write(part_path.read_bytes())

        if not final_path.exists() or final_path.stat().st_size == 0:
            raise RuntimeError("Combined audio file was not created.")

        logger.info(
            "tts_complete chunk_id=%s chunks_generated=%d chunks_combined=%d",
            chunk_id, len(chunks), len(part_paths),
        )
        return str(final_path)
    except Exception:
        # Never leave a partial/incomplete file behind as if it were the final result.
        if final_path.exists():
            final_path.unlink()
        logger.warning(
            "tts_failed chunk_id=%s total_parts=%d",
            chunk_id, len(chunks),
        )
        raise
    finally:
        _clear_progress(chunk_id)
        shutil.rmtree(work_dir, ignore_errors=True)


def generate_audio_file_sync(text: str, chunk_id: str, voice: str) -> str:
    return asyncio.run(generate_audio_file(text, chunk_id, voice))
