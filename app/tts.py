import subprocess
import sys
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


def audio_path(chunk_id: str) -> Path:
    AUDIO_DIR.mkdir(exist_ok=True)
    return AUDIO_DIR / f"{chunk_id}.mp3"


def generate_audio_file_sync(text: str, chunk_id: str, voice: str) -> str:
    path = audio_path(chunk_id)
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "edge_tts",
            "--voice",
            EDGE_VOICES.get(voice, DEFAULT_VOICE),
            "--text",
            text,
            "--write-media",
            str(path),
        ],
        capture_output=True,
        text=True,
        timeout=45,
        check=False,
    )
    if result.returncode != 0 or not path.exists() or path.stat().st_size == 0:
        detail = (result.stderr or result.stdout or "Audio file was not created.").strip()
        raise RuntimeError(detail)
    return str(path)


async def generate_audio_file(text: str, chunk_id: str, voice: str) -> str:
    import asyncio

    return await asyncio.to_thread(generate_audio_file_sync, text, chunk_id, voice)
