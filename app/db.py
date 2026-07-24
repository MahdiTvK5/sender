"""SQLite connection management and schema initialisation."""
from __future__ import annotations

import sqlite3
import threading
from pathlib import Path

from . import config

_local = threading.local()


def _connect() -> sqlite3.Connection:
    Path(config.DATABASE_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(config.DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def get_db() -> sqlite3.Connection:
    """Return a thread-local SQLite connection."""
    conn = getattr(_local, "conn", None)
    if conn is None:
        conn = _connect()
        _local.conn = conn
    return conn


def init_db() -> None:
    """Create the `configs` table and indexes if they do not exist."""
    conn = get_db()
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS configs (
            id         TEXT    PRIMARY KEY,
            code       TEXT    NOT NULL,
            config     TEXT    NOT NULL,
            shareLink  TEXT    NOT NULL,
            createdAt  INTEGER NOT NULL,
            expiresAt  INTEGER NOT NULL,
            status     TEXT    NOT NULL DEFAULT 'active'
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_configs_code ON configs(code);
        CREATE INDEX IF NOT EXISTS idx_configs_expiresAt ON configs(expiresAt);
        """
    )
    conn.commit()
