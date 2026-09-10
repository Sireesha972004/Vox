import asyncio
import logging
import os
import re
import shutil
import tempfile
from pathlib import Path

AUDIO_DIR = Path(__file__).resolve().parent.parent / "audio"
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

logger = logging.getLogger("vox.tts")


class TextTooLongError(ValueError):
    pass


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


async def generate_audio_file(text: str, chunk_id: str, voice: str) -> str:
    from edge_tts import Communicate

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
    succeeded = 0
    try:
        part_paths: list[Path] = []
        for index, chunk_text in enumerate(chunks):
            part_path = work_dir / f"part-{index:04d}.mp3"
            try:
                await asyncio.wait_for(
                    Communicate(chunk_text, voice_id).save(str(part_path)),
                    timeout=CHUNK_TIMEOUT_SECONDS,
                )
            except Exception as error:
                raise RuntimeError(
                    f"Audio generation failed on part {index + 1} of {len(chunks)}. "
                    f"{succeeded} of {len(chunks)} parts completed before the failure."
                ) from error
            if not part_path.exists() or part_path.stat().st_size == 0:
                raise RuntimeError(
                    f"Audio part {index + 1} of {len(chunks)} produced no audio."
                )
            part_paths.append(part_path)
            succeeded += 1

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
            "tts_failed chunk_id=%s completed_parts=%d total_parts=%d",
            chunk_id, succeeded, len(chunks),
        )
        raise
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)


def generate_audio_file_sync(text: str, chunk_id: str, voice: str) -> str:
    return asyncio.run(generate_audio_file(text, chunk_id, voice))
