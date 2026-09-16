from io import BytesIO
from pathlib import Path
import base64
import logging
import os
import shutil
import subprocess
import tempfile
import time
from threading import Lock, Thread
from uuid import uuid4
import zipfile
from html.parser import HTMLParser
from urllib.parse import urlparse
from xml.etree import ElementTree

import bcrypt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
import psycopg2
import requests
from psycopg2 import pool as psycopg2_pool
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel, Field

from app.tts import (
    TextTooLongError,
    generate_audio_file_sync,
    get_progress,
    text_stats,
    validate_text_length,
)


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("vox.main")
app = FastAPI(title="Voice Output Experience API")
FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend"
# Kept only as a one-time import source for installations created before
# audio was persisted in PostgreSQL. New audio is never written here.
LEGACY_AUDIO_DIR = Path(__file__).resolve().parent.parent / "audio"
DATABASE_URL = "postgresql://postgres:pr8THefr2jUPhubraDAQ@20.84.90.11:5432/Vox"
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
password_hasher = PasswordHasher()
users_lock = Lock()
jobs_lock = Lock()
tokens: dict[str, str] = {}


class ChunkRequest(BaseModel):
    text: str = Field(min_length=1)
    title: str = ""
    voice: str = "Hindi Reader"
    source_url: str = Field(default="", alias="sourceUrl")
    chunk_id: str | None = Field(default=None, alias="chunkId")


class ChunkReady(BaseModel):
    chunk_id: str = Field(alias="chunkId")


class LoginRequest(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=1)


class RegisterRequest(BaseModel):
    username: str = Field(min_length=1)
    email: str = Field(min_length=3)
    password: str = Field(min_length=12)


class ResetPasswordRequest(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=12)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=12)


class UrlRequest(BaseModel):
    url: str = Field(min_length=8)


# DATABASE_URL points at a remote server, where opening a fresh TCP+auth
# connection for every single query previously cost ~1.5-2s per query (measured)
# -- on top of the query itself. Nearly every request opens 2+ connections
# (the current_email auth check, then the route's own query), so this alone
# was the dominant cost behind a slow page refresh, not chunking or TTS.
# A pool amortizes that cost across requests instead of paying it every time.
DB_POOL_MIN = int(os.getenv("VOX_DB_POOL_MIN", "1"))
DB_POOL_MAX = int(os.getenv("VOX_DB_POOL_MAX", "20"))
# This remote link has been observed to silently drop connections mid-transfer
# (no RST/FIN, no exception -- the socket just goes quiet). Without TCP
# keepalives, a query on a connection like that hangs forever: nothing ever
# times out, so the pool slot and its thread are lost until the process is
# restarted. Keepalives only probe once a connection has gone idle, so they
# never interrupt a large transfer that is still actively receiving data --
# they only detect the case where the peer is already gone.
_db_pool = psycopg2_pool.ThreadedConnectionPool(
    DB_POOL_MIN,
    DB_POOL_MAX,
    DATABASE_URL,
    keepalives=1,
    keepalives_idle=20,
    keepalives_interval=10,
    keepalives_count=3,
)

# getconn() does not wait -- it raises PoolError immediately once every pooled
# connection is checked out. A request that streams an unusually large audio
# row (measured: 90MB took 12+ minutes over this link) can hold a connection
# for that entire time, and every other in-flight request that needed one in
# the meantime used to fail with an unhandled 500. A short retry lets a brief
# burst clear on its own instead of failing every caller outright.
DB_POOL_GETCONN_RETRIES = int(os.getenv("VOX_DB_POOL_GETCONN_RETRIES", "3"))
DB_POOL_GETCONN_RETRY_DELAY_SECONDS = float(os.getenv("VOX_DB_POOL_GETCONN_RETRY_DELAY_SECONDS", "0.25"))


def _acquire_pooled_connection():
    last_error: Exception | None = None
    for attempt in range(DB_POOL_GETCONN_RETRIES):
        try:
            return _db_pool.getconn()
        except psycopg2_pool.PoolError as error:
            last_error = error
            if attempt < DB_POOL_GETCONN_RETRIES - 1:
                time.sleep(DB_POOL_GETCONN_RETRY_DELAY_SECONDS)
    raise last_error


class _PooledConnection:
    """Drop-in stand-in for psycopg2.connect(): every existing call site uses
    it as `with connect_db() as connection`, which only ever relied on the
    connection's own commit/rollback-on-exit behavior (psycopg2 connections
    don't close themselves on `with` exit). This preserves that exact behavior
    while returning the connection to the pool instead of leaving it to be
    garbage-collected and reopened from scratch next time."""

    def __enter__(self):
        self._connection = _acquire_pooled_connection()
        return self._connection.__enter__()

    def __exit__(self, exc_type, exc, tb):
        try:
            return self._connection.__exit__(exc_type, exc, tb)
        finally:
            broken = self._connection.closed != 0 or isinstance(exc, psycopg2.OperationalError)
            _db_pool.putconn(self._connection, close=broken)


def connect_db():
    return _PooledConnection()


def init_database() -> None:
    with connect_db() as connection, connection.cursor() as cursor:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                email TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS id UUID")
        cursor.execute("UPDATE users SET id = gen_random_uuid() WHERE id IS NULL")
        cursor.execute("ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid()")
        cursor.execute("ALTER TABLE users ALTER COLUMN id SET NOT NULL")
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image BYTEA")
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_type TEXT")
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS auth_tokens (
                token TEXT PRIMARY KEY,
                email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS jobs (
                chunk_id TEXT PRIMARY KEY,
                email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
                title TEXT NOT NULL DEFAULT '',
                voice TEXT NOT NULL,
                text TEXT NOT NULL,
                status TEXT NOT NULL,
                error TEXT,
                audio_url TEXT NOT NULL,
                source_url TEXT NOT NULL DEFAULT '',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )
        # Local files are lost on a production restart while job metadata is
        # retained in PostgreSQL. Store the final MP3 with its job instead.
        cursor.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS audio_data BYTEA")
        cursor.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS audio_content_type TEXT")
        cursor.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source_url TEXT NOT NULL DEFAULT ''")
        # Read once from the generated MP3 when a job completes, so the frontend never
        # has to guess a playable length from a file the browser can't reliably probe.
        cursor.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS duration_seconds INTEGER")


def import_legacy_audio() -> None:
    """Persist MP3s left by pre-production releases before their directory is removed."""
    if not LEGACY_AUDIO_DIR.is_dir():
        return
    imported = 0
    with connect_db() as connection, connection.cursor() as cursor:
        for path in LEGACY_AUDIO_DIR.glob("*.mp3"):
            data = path.read_bytes()
            if not data:
                continue
            cursor.execute(
                """
                UPDATE jobs
                SET audio_data = %s, audio_content_type = 'audio/mpeg'
                WHERE chunk_id = %s AND audio_data IS NULL
                """,
                (data, path.stem),
            )
            imported += cursor.rowcount
    if imported:
        logger.info("Imported %d legacy audio file(s) into PostgreSQL.", imported)


def get_user(email: str) -> dict[str, str] | None:
    with connect_db() as connection, connection.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            "SELECT id, email, name AS username, password_hash, profile_image, profile_image_type FROM users WHERE email = %s",
            (email,),
        )
        record = cursor.fetchone()
    return dict(record) if record else None


def ensure_user(email: str, password: str, username: str = "") -> dict[str, str]:
    record = get_user(email)
    if record and not username:
        username = record["username"].strip()
    user = {
        "email": email,
        "username": username or email.split("@")[0],
        "password_hash": password_hasher.hash(password),
    }
    with connect_db() as connection, connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO users (email, name, password_hash)
            VALUES (%s, %s, %s)
            ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                password_hash = EXCLUDED.password_hash
            """,
            (email, user["username"], user["password_hash"]),
        )
    return user


def upsert_job(chunk_id: str, **fields: object) -> dict[str, object]:
    with jobs_lock:
        with connect_db() as connection, connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM jobs WHERE chunk_id = %s", (chunk_id,))
            existing = cursor.fetchone()
            job = {**(dict(existing) if existing else {}), **fields, "chunk_id": chunk_id}
            job["audio_url"] = f"/audio/{chunk_id}.mp3"
            cursor.execute(
                """
                INSERT INTO jobs (
                    chunk_id, email, title, voice, text, status, error, audio_url, source_url,
                    audio_data, audio_content_type, duration_seconds
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (chunk_id) DO UPDATE SET
                    email = EXCLUDED.email,
                    title = EXCLUDED.title,
                    voice = EXCLUDED.voice,
                    text = EXCLUDED.text,
                    status = EXCLUDED.status,
                    error = EXCLUDED.error,
                    audio_url = EXCLUDED.audio_url,
                    source_url = EXCLUDED.source_url,
                    audio_data = EXCLUDED.audio_data,
                    audio_content_type = EXCLUDED.audio_content_type,
                    duration_seconds = EXCLUDED.duration_seconds
                """,
                (
                    chunk_id,
                    job.get("email", ""),
                    job.get("title", ""),
                    job.get("voice", ""),
                    job.get("text", ""),
                    job.get("status", "queued"),
                    job.get("error"),
                    job["audio_url"],
                    job.get("source_url", ""),
                    job.get("audio_data"),
                    job.get("audio_content_type"),
                    job.get("duration_seconds"),
                ),
            )
        return serialize_job(job)


def serialize_job(job: dict[str, object]) -> dict[str, object]:
    has_audio = bool(job.get("audio_data"))
    status = str(job.get("status", "queued"))
    error = str(job.get("error") or "")
    # Jobs created before persistent storage have no MP3 after a deployment.
    # Do not render a player that can only return a confusing 404.
    if status == "ready" and not has_audio:
        status = "failed"
        error = "The audio file is no longer available. Please convert the content again."
    result = {
        "chunkId": job["chunk_id"],
        "email": job.get("email", ""),
        "title": job.get("title", ""),
        "voice": job.get("voice", ""),
        "text": job.get("text", ""),
        "sourceUrl": job.get("source_url", ""),
        "status": status,
        "error": error,
        "audioUrl": job.get("audio_url", f"/audio/{job['chunk_id']}.mp3"),
    }
    # Additive field; only present once known. Jobs created before this was
    # tracked simply omit it and the frontend falls back to its prior behavior.
    if job.get("duration_seconds") is not None:
        result["durationSeconds"] = job["duration_seconds"]
    # Best-effort only: reflects this process's in-memory chunk counter, so a
    # request served by a different instance simply sees no progress yet.
    # Additive field; existing clients that don't read it are unaffected.
    if status == "queued":
        progress = get_progress(str(job["chunk_id"]))
        if progress and progress["total"]:
            result["progress"] = round(100 * progress["completed"] / progress["total"])
    return result


def normalize_email(email: str) -> str:
    value = email.strip().lower()
    if "@" not in value or "." not in value.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Enter a valid email address.")
    return value


def current_email(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Sign in required.")
    token = authorization.split(" ", 1)[1]
    # Tokens must be shared by local and production instances. Keeping them
    # only in a process dictionary signs users out after a deploy or when a
    # load balancer routes the request to another instance.
    with connect_db() as connection, connection.cursor() as cursor:
        cursor.execute("SELECT email FROM auth_tokens WHERE token = %s", (token,))
        record = cursor.fetchone()
    if not record:
        raise HTTPException(status_code=401, detail="Sign in required.")
    return record[0]


def issue_token(email: str) -> dict[str, str]:
    token = str(uuid4())
    tokens[token] = email
    with connect_db() as connection, connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO auth_tokens (token, email) VALUES (%s, %s)",
            (token, email),
        )
    record = get_user(email)
    username = record["username"].strip() if record else ""
    return {"token": token, "email": email, "username": username}


def audio_duration_seconds(path: Path) -> int | None:
    # The final file is several independently-encoded TTS chunks concatenated
    # together, so it has no single accurate duration header for a browser to
    # read -- measure the actual generated audio once, here, while the file
    # still exists on disk, instead of asking every client to guess.
    try:
        from mutagen.mp3 import MP3

        return round(MP3(path).info.length)
    except Exception as error:
        logger.warning("Could not read audio duration for %s: %s", path, error)
        return None


def backfill_missing_durations() -> None:
    # Rows created before the duration_seconds column existed have it stored
    # as NULL even though their audio is complete and playable -- there was
    # never a computation failure, the code that computes it simply didn't
    # exist yet when they were generated. Left alone, the Library shows a
    # permanent, incorrect "0:00" for these regardless of how many times the
    # page is refreshed. Runs once at startup in a background thread (not the
    # request path) since an old row can be a large file that takes a long
    # time to fetch over this connection, and that must never block server
    # startup or compete with live request traffic for the connection pool.
    try:
        with connect_db() as connection, connection.cursor() as cursor:
            cursor.execute(
                "SELECT chunk_id FROM jobs "
                "WHERE status = 'ready' AND audio_data IS NOT NULL AND duration_seconds IS NULL"
            )
            chunk_ids = [row[0] for row in cursor.fetchall()]
    except Exception:
        logger.exception("duration_backfill_query_failed")
        return

    if not chunk_ids:
        return

    # This link has been observed to stall completely on a fetch mid-transfer
    # (no error, no data, indefinitely) rather than just being slow. Without a
    # bound, one bad row wedges this thread forever and every row queued
    # behind it never gets backfilled. A server-side statement_timeout forces
    # Postgres to cancel and error out if a single row's fetch runs past a
    # generous ceiling, so the loop can log it and move on to the next row
    # instead of hanging permanently. 20 minutes comfortably covers the
    # slowest real fetch measured against this link (~12 minutes for 90MB).
    BACKFILL_ROW_TIMEOUT_MS = int(os.getenv("VOX_DURATION_BACKFILL_ROW_TIMEOUT_MS", "1200000"))

    logger.info("duration_backfill_start count=%d", len(chunk_ids))
    for chunk_id in chunk_ids:
        temp_path: Path | None = None
        try:
            with connect_db() as connection, connection.cursor() as cursor:
                cursor.execute(f"SET statement_timeout = {BACKFILL_ROW_TIMEOUT_MS}")
                cursor.execute("SELECT audio_data FROM jobs WHERE chunk_id = %s", (chunk_id,))
                row = cursor.fetchone()
            if not row or not row[0]:
                continue
            fd, temp_name = tempfile.mkstemp(suffix=".mp3")
            temp_path = Path(temp_name)
            with os.fdopen(fd, "wb") as handle:
                handle.write(bytes(row[0]))
            duration = audio_duration_seconds(temp_path)
            if duration is None:
                logger.warning("duration_backfill_skip chunk_id=%s reason=unreadable", chunk_id)
                continue
            with connect_db() as connection, connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE jobs SET duration_seconds = %s WHERE chunk_id = %s",
                    (duration, chunk_id),
                )
            logger.info("duration_backfill_done chunk_id=%s duration_seconds=%d", chunk_id, duration)
        except Exception:
            logger.exception("duration_backfill_failed chunk_id=%s", chunk_id)
        finally:
            if temp_path is not None:
                temp_path.unlink(missing_ok=True)
    logger.info("duration_backfill_complete")


def process_chunk(chunk_id: str, text: str, voice: str) -> None:
    generated_path = None
    try:
        generated_path = Path(generate_audio_file_sync(text, chunk_id, voice))
        audio_data = generated_path.read_bytes()
        if not audio_data:
            raise RuntimeError("Audio generation produced an empty file.")
        upsert_job(
            chunk_id,
            status="ready",
            error=None,
            audio_data=audio_data,
            audio_content_type="audio/mpeg",
            duration_seconds=audio_duration_seconds(generated_path),
        )
    except (RuntimeError, ValueError) as error:
        upsert_job(chunk_id, status="failed", error=str(error) or "Could not generate audio.")
        logger.warning("Audio generation failed for %s: %s", chunk_id, error)
    except Exception as error:
        upsert_job(chunk_id, status="failed", error="Could not generate audio. Please try again.")
        logger.exception("Unexpected audio generation failure for %s", chunk_id)
    finally:
        if generated_path and generated_path.exists():
            generated_path.unlink()


def start_chunk_job(chunk_id: str, text: str, voice: str) -> None:
    Thread(target=process_chunk, args=(chunk_id, text, voice), daemon=True).start()


init_database()
import_legacy_audio()
Thread(target=backfill_missing_durations, daemon=True).start()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/favicon.ico")
def favicon() -> Response:
    return Response(status_code=204)


@app.post("/api/register")
def register(body: RegisterRequest) -> dict[str, str]:
    email = normalize_email(body.email)
    username = body.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username is required.")
    with users_lock:
        if get_user(email):
            raise HTTPException(status_code=409, detail="An account with this email already exists.")
        ensure_user(email, body.password, username)
    return issue_token(email)


@app.post("/api/login")
def login(body: LoginRequest) -> dict[str, str]:
    email = normalize_email(body.email)
    record = get_user(email)
    password_hash = record["password_hash"] if record else None
    if not password_hash:
        if len(body.password) < 12:
            raise HTTPException(
                status_code=401,
                detail="No account found. Please register with a password of at least 12 characters.",
            )
        with users_lock:
            if not get_user(email):
                ensure_user(email, body.password)
        return issue_token(email)
    try:
        if password_hash.startswith(("$2a$", "$2b$", "$2y$")):
            valid_password = bcrypt.checkpw(body.password.encode(), password_hash.encode())
        else:
            valid_password = password_hasher.verify(password_hash, body.password)
    except (InvalidHashError, VerifyMismatchError, ValueError) as error:
        raise HTTPException(status_code=401, detail="Invalid email or password.") from error
    if not valid_password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return issue_token(email)


@app.post("/api/forgot-password")
def forgot_password(body: ResetPasswordRequest) -> dict[str, str]:
    email = normalize_email(body.email)
    with users_lock:
        record = get_user(email)
        username = record["username"].strip() if record else ""
        ensure_user(email, body.password, username)
    return {"message": "Password updated. You can sign in now.", "email": email}


@app.put("/api/password")
def change_password(body: ChangePasswordRequest, email: str = Depends(current_email)) -> dict[str, str]:
    record = get_user(email)
    if not record:
        raise HTTPException(status_code=404, detail="Account not found.")
    try:
        valid_password = password_hasher.verify(record["password_hash"], body.current_password)
    except (InvalidHashError, VerifyMismatchError, ValueError) as error:
        raise HTTPException(status_code=400, detail="Current password is incorrect.") from error
    if not valid_password:
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    with connect_db() as connection, connection.cursor() as cursor:
        cursor.execute(
            "UPDATE users SET password_hash = %s WHERE email = %s",
            (password_hasher.hash(body.new_password), email),
        )
    return {"message": "Password updated successfully."}


@app.get("/api/me")
def me(email: str = Depends(current_email)) -> dict[str, str]:
    record = get_user(email)
    username = record["username"].strip() if record else ""
    image = ""
    if record and record.get("profile_image") and record.get("profile_image_type"):
        encoded = base64.b64encode(record["profile_image"]).decode("ascii")
        image = f"data:{record['profile_image_type']};base64,{encoded}"
    return {"id": str(record["id"]) if record else "", "email": email, "username": username, "profileImage": image}


@app.put("/api/profile")
async def update_profile(
    name: str = Form(..., min_length=1),
    image: UploadFile | None = File(default=None),
    remove_image: bool = Form(default=False),
    email: str = Depends(current_email),
) -> dict[str, str]:
    clean_name = name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Name is required.")
    image_data = None
    image_type = None
    if image and image.filename and not remove_image:
        if image.content_type not in {"image/jpeg", "image/png", "image/webp", "image/gif"}:
            raise HTTPException(status_code=400, detail="Use a JPG, PNG, WEBP, or GIF image.")
        image_data = await image.read()
        if len(image_data) > 2 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Profile images must be under 2 MB.")
        image_type = image.content_type
    with connect_db() as connection, connection.cursor() as cursor:
        if remove_image:
            cursor.execute(
                "UPDATE users SET name = %s, profile_image = NULL, profile_image_type = NULL WHERE email = %s",
                (clean_name, email),
            )
        elif image_data is None:
            cursor.execute("UPDATE users SET name = %s WHERE email = %s", (clean_name, email))
        else:
            cursor.execute(
                "UPDATE users SET name = %s, profile_image = %s, profile_image_type = %s WHERE email = %s",
                (clean_name, image_data, image_type, email),
            )
    return me(email)


@app.get("/api/library")
def library(email: str = Depends(current_email)) -> list[dict[str, object]]:
    with connect_db() as connection, connection.cursor(cursor_factory=RealDictCursor) as cursor:
        # audio_data holds the full MP3 (often several MB per job). The list view
        # only needs to know whether audio exists, never the bytes themselves.
        cursor.execute(
            """
            SELECT chunk_id, email, title, voice, text, status, error, audio_url, source_url,
                   duration_seconds, created_at, (audio_data IS NOT NULL) AS audio_data
            FROM jobs WHERE email = %s ORDER BY created_at DESC
            """,
            (email,),
        )
        jobs = [dict(job) for job in cursor.fetchall()]

    # Older deployments stored only job metadata. If the source text is still
    # available, regenerate the missing MP3 automatically rather than showing
    # a permanent, broken player.
    for job in jobs:
        if job["status"] != "ready" or job.get("audio_data") or not job.get("text"):
            continue
        with jobs_lock:
            with connect_db() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE jobs
                    SET status = 'queued', error = NULL
                    WHERE chunk_id = %s AND email = %s
                      AND status = 'ready' AND audio_data IS NULL
                    """,
                    (job["chunk_id"], email),
                )
                restored = cursor.rowcount == 1
        if restored:
            job["status"] = "queued"
            start_chunk_job(job["chunk_id"], job["text"], job["voice"])
    return [serialize_job(job) for job in jobs]


NON_CONTENT_TAGS = {
    "script", "style", "noscript", "template", "svg",
    "nav", "header", "footer", "aside", "form", "button",
    "iframe", "select", "option", "figcaption", "dialog",
}


class PageTextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self.skip_depth = 0
        self.page_title = ""
        self.in_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in NON_CONTENT_TAGS:
            self.skip_depth += 1
        elif tag == "title":
            self.in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag in NON_CONTENT_TAGS and self.skip_depth:
            self.skip_depth -= 1
        elif tag == "title":
            self.in_title = False

    def handle_data(self, data: str) -> None:
        value = " ".join(data.split())
        if not value or self.skip_depth:
            return
        if self.in_title:
            self.page_title += f" {value}"
        self.parts.append(value)

    def text(self) -> str:
        return "\n".join(self.parts).strip()


def extract_docx_text(data: bytes) -> str:
    with zipfile.ZipFile(BytesIO(data)) as archive:
        xml_data = archive.read("word/document.xml")
    root = ElementTree.fromstring(xml_data)
    paragraphs: list[str] = []
    for paragraph in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
        text = "".join(node.text or "" for node in paragraph.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t"))
        if text.strip():
            paragraphs.append(text.strip())
    return "\n\n".join(paragraphs)


def extract_doc_text(data: bytes, filename: str) -> str:
    antiword = shutil.which("antiword")
    if not antiword:
        raise HTTPException(status_code=400, detail="Legacy .doc files require Antiword. Please use .docx or install Antiword.")
    with tempfile.TemporaryDirectory() as directory:
        source = Path(directory) / filename
        source.write_bytes(data)
        result = subprocess.run([antiword, str(source)], capture_output=True, text=True, timeout=20, check=False)
    if result.returncode != 0:
        raise HTTPException(status_code=400, detail="Could not read this Word document.")
    return result.stdout.strip()


def extract_uploaded_text(filename: str, data: bytes) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix == ".pdf":
        from pypdf import PdfReader

        try:
            reader = PdfReader(BytesIO(data))
            return "\n".join((page.extract_text() or "") for page in reader.pages).strip()
        except Exception as error:
            raise HTTPException(status_code=400, detail="Could not read this PDF.") from error
    if suffix == ".docx":
        try:
            return extract_docx_text(data)
        except (KeyError, ValueError, zipfile.BadZipFile) as error:
            raise HTTPException(status_code=400, detail="Could not read this DOCX file.") from error
    if suffix == ".doc":
        return extract_doc_text(data, filename)
    return data.decode("utf-8", errors="ignore").strip()


# A non-trivial source producing near-empty text usually means extraction only
# grabbed a title/preview rather than the full content. Never blocks the request
# (a source can legitimately be mostly images/markup) -- it's a signal for
# operators so a bug like that doesn't silently ship partial audio.
def warn_if_extraction_looks_incomplete(source: str, extracted_chars: int, source_bytes: int) -> None:
    if source_bytes > 5000 and extracted_chars < max(200, source_bytes * 0.01):
        logger.warning(
            "extraction_looks_incomplete source=%s source_bytes=%d extracted_characters=%d",
            source, source_bytes, extracted_chars,
        )


@app.post("/api/extract-text")
async def extract_text(
    file: UploadFile = File(...),
    _email: str = Depends(current_email),
) -> dict[str, str]:
    filename = file.filename or "upload"
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File is too large. Use a file under 5 MB.")
    if not data:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    text = extract_uploaded_text(filename, data)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from this file.")
    try:
        validate_text_length(text)
    except TextTooLongError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    stats = text_stats(text)
    logger.info(
        "extract_text filename=%s bytes=%d characters=%d words=%d paragraphs=%d",
        filename, len(data), stats["characters"], stats["words"], stats["paragraphs"],
    )
    warn_if_extraction_looks_incomplete(filename, stats["characters"], len(data))

    return {"title": Path(filename).stem, "text": text}


@app.post("/api/extract-url")
def extract_url(body: UrlRequest, _email: str = Depends(current_email)) -> dict[str, str]:
    parsed = urlparse(body.url.strip())
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise HTTPException(status_code=400, detail="Enter a valid http or https URL.")
    try:
        response = requests.get(body.url.strip(), timeout=15, headers={"User-Agent": "Voice Output Experience/1.0"})
        response.raise_for_status()
    except requests.RequestException as error:
        raise HTTPException(status_code=400, detail="Could not fetch this URL.") from error
    if len(response.content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="The URL content is too large.")
    parser = PageTextParser()
    parser.feed(response.text)
    text = parser.text()
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract readable text from this URL.")
    try:
        validate_text_length(text)
    except TextTooLongError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    stats = text_stats(text)
    logger.info(
        "extract_url url=%s characters=%d words=%d paragraphs=%d",
        parsed.netloc, stats["characters"], stats["words"], stats["paragraphs"],
    )
    warn_if_extraction_looks_incomplete(parsed.netloc, stats["characters"], len(response.content))

    title = parser.page_title.strip() or parsed.netloc
    return {"title": title[:120], "text": text}


@app.post("/api/chunks", status_code=202)
def create_chunk(
    chunk: ChunkRequest,
    email: str = Depends(current_email),
) -> dict[str, object]:
    try:
        validate_text_length(chunk.text)
    except TextTooLongError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    stats = text_stats(chunk.text)
    chunk_id = chunk.chunk_id or str(uuid4())
    logger.info(
        "create_chunk chunk_id=%s characters=%d words=%d paragraphs=%d voice=%s",
        chunk_id, stats["characters"], stats["words"], stats["paragraphs"], chunk.voice,
    )
    job = upsert_job(
        chunk_id,
        email=email,
        title=chunk.title or chunk.text[:48],
        voice=chunk.voice,
        text=chunk.text,
        source_url=chunk.source_url,
        status="queued",
    )
    start_chunk_job(chunk_id, chunk.text, chunk.voice)
    return job


@app.post("/api/chunk-ready")
def chunk_ready(chunk: ChunkReady) -> dict[str, str]:
    return upsert_job(chunk.chunk_id, status="ready")


@app.get("/api/chunks/{chunk_id}")
def get_chunk(chunk_id: str, email: str = Depends(current_email)) -> dict[str, object]:
    with connect_db() as connection, connection.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            """
            SELECT chunk_id, email, title, voice, text, status, error, audio_url, source_url,
                   duration_seconds, (audio_data IS NOT NULL) AS audio_data
            FROM jobs WHERE chunk_id = %s AND email = %s
            """,
            (chunk_id, email),
        )
        record = cursor.fetchone()
    if not record:
        return {"chunkId": chunk_id, "status": "unknown"}
    return serialize_job(dict(record))


@app.delete("/api/chunks/{chunk_id}")
def delete_chunk(chunk_id: str, email: str = Depends(current_email)) -> dict[str, str]:
    with connect_db() as connection, connection.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute("SELECT chunk_id FROM jobs WHERE chunk_id = %s AND email = %s", (chunk_id, email))
        record = cursor.fetchone()
    if not record:
        raise HTTPException(status_code=404, detail="Audio not found.")
    with jobs_lock:
        with connect_db() as connection, connection.cursor() as cursor:
            cursor.execute("DELETE FROM jobs WHERE chunk_id = %s AND email = %s", (chunk_id, email))
    return {"chunkId": chunk_id, "status": "deleted"}


@app.get("/audio/{chunk_id}.mp3")
def get_audio(chunk_id: str, range_header: str | None = Header(default=None, alias="Range")) -> Response:
    # Only length + content type up front -- one of these rows measured 90MB
    # and took 12+ minutes to fetch in full over this connection. Pulling the
    # whole blob just to answer a HEAD-ish metadata check (or a Range request
    # for a few KB, which is what browsers send first) made every request for
    # a large file that slow, and held a pooled connection the whole time.
    try:
        with connect_db() as connection, connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "SELECT length(audio_data) AS total, audio_content_type FROM jobs WHERE chunk_id = %s",
                (chunk_id,),
            )
            record = cursor.fetchone()
    except (psycopg2.OperationalError, psycopg2_pool.PoolError) as error:
        logger.error("audio_fetch_db_error chunk_id=%s error=%s: %s", chunk_id, type(error).__name__, error)
        raise HTTPException(
            status_code=503,
            detail="Audio is temporarily unavailable. Please try again in a moment.",
        ) from error

    if not record or record["total"] is None:
        logger.info("audio_fetch_not_found chunk_id=%s", chunk_id)
        raise HTTPException(status_code=404, detail="Audio file not found.")

    content_type = record["audio_content_type"] or "audio/mpeg"
    total = record["total"]
    headers = {"Cache-Control": "private, max-age=3600", "Accept-Ranges": "bytes"}

    # Without Range support the browser must download the entire file before it
    # can start playing or seek, which made a large document's audio slow to
    # become playable (and, in turn, made a second impatient click land while
    # play() was still pending -- see the frontend player fix). Supporting
    # partial content lets playback and seeking start from just the requested
    # byte range instead.
    try:
        if range_header:
            unit, _, range_spec = range_header.partition("=")
            start_str, _, end_str = range_spec.partition("-")
            try:
                if unit != "bytes":
                    raise ValueError
                start = int(start_str) if start_str else 0
                end = int(end_str) if end_str else total - 1
                end = min(end, total - 1)
                if start < 0 or start > end:
                    raise ValueError
            except ValueError:
                return Response(status_code=416, headers={"Content-Range": f"bytes */{total}"})
            with connect_db() as connection, connection.cursor() as cursor:
                cursor.execute(
                    "SELECT substring(audio_data FROM %s FOR %s) FROM jobs WHERE chunk_id = %s",
                    (start + 1, end - start + 1, chunk_id),
                )
                chunk = cursor.fetchone()[0]
            headers["Content-Range"] = f"bytes {start}-{end}/{total}"
            return Response(content=bytes(chunk), status_code=206, media_type=content_type, headers=headers)

        with connect_db() as connection, connection.cursor() as cursor:
            cursor.execute("SELECT audio_data FROM jobs WHERE chunk_id = %s", (chunk_id,))
            data = cursor.fetchone()[0]
        return Response(content=bytes(data), media_type=content_type, headers=headers)
    except (psycopg2.OperationalError, psycopg2_pool.PoolError) as error:
        logger.error("audio_fetch_db_error chunk_id=%s error=%s: %s", chunk_id, type(error).__name__, error)
        raise HTTPException(
            status_code=503,
            detail="Audio is temporarily unavailable. Please try again in a moment.",
        ) from error


app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
