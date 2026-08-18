"""Data-access layer for config records."""
from __future__ import annotations

import secrets
import sqlite3
import time
import uuid
from dataclasses import dataclass
from typing import Optional

from . import config
from .db import get_db


@dataclass
class ConfigRecord:
    id: str
    code: str
    config: str
    shareLink: str
    createdAt: int
    expiresAt: int
    status: str

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "ConfigRecord":
        return cls(
            id=row["id"],
            code=row["code"],
            config=row["config"],
            shareLink=row["shareLink"],
            createdAt=row["createdAt"],
            expiresAt=row["expiresAt"],
            status=row["status"],
        )


def _now_ms() -> int:
    return int(time.time() * 1000)


def generate_code() -> str:
    """Cryptographically-random N-digit numeric code, e.g. '69168'."""
    upper = 10 ** config.CODE_LENGTH
    return str(secrets.randbelow(upper)).zfill(config.CODE_LENGTH)


def _resolve_status(record: ConfigRecord, now: Optional[int] = None) -> str:
    now = now if now is not None else _now_ms()
    if now >= record.expiresAt or record.status == "expired":
        return "expired"
    return "active"


def build_share_link(code: str, base_url: str = "") -> str:
    base = (base_url or config.BASE_URL).rstrip("/")
    return f"{base}/s/{code}" if base else f"/s/{code}"


def create_config(config_text: str, base_url: str = "") -> ConfigRecord:
    """Persist a new config with a guaranteed-unique 5-digit code."""
    conn = get_db()
    now = _now_ms()
    expires_at = now + config.TTL_SECONDS * 1000

    for _ in range(25):
        code = generate_code()
        record = ConfigRecord(
            id=str(uuid.uuid4()),
            code=code,
            config=config_text,
            shareLink=build_share_link(code, base_url),
            createdAt=now,
            expiresAt=expires_at,
            status="active",
        )
        try:
            conn.execute(
                """
                INSERT INTO configs (id, code, config, shareLink, createdAt, expiresAt, status)
                VALUES (:id, :code, :config, :shareLink, :createdAt, :expiresAt, :status)
                """,
                record.__dict__,
            )
            conn.commit()
            return record
        except sqlite3.IntegrityError:
            # Duplicate code (UNIQUE index) -> retry with a new one.
            continue

    raise RuntimeError("عدم امکان تولید کد یکتا. لطفاً دوباره تلاش کنید.")


def get_config_by_code(code: str) -> Optional[ConfigRecord]:
    """Fetch a record and refresh its status if it has expired."""
    conn = get_db()
    row = conn.execute("SELECT * FROM configs WHERE code = ?", (code,)).fetchone()
    if row is None:
        return None

    record = ConfigRecord.from_row(row)
    status = _resolve_status(record)
    if status != record.status:
        conn.execute("UPDATE configs SET status = ? WHERE code = ?", (status, code))
        conn.commit()
        record.status = status
    return record


def delete_config_by_code(code: str) -> bool:
    """Delete a record. Returns True when a row was removed."""
    conn = get_db()
    cur = conn.execute("DELETE FROM configs WHERE code = ?", (code,))
    conn.commit()
    return cur.rowcount > 0
