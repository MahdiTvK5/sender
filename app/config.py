"""Application settings, loaded from environment variables / .env."""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Public base URL used to build share links. If empty, it is derived from the
# incoming request (host + scheme).
BASE_URL: str = os.getenv("BASE_URL", "").rstrip("/")

# SQLite database path.
DATABASE_PATH: str = os.getenv("DATABASE_PATH", str(BASE_DIR / "data" / "configs.db"))

# Link time-to-live.
TTL_HOURS: int = int(os.getenv("TTL_HOURS", "24"))
TTL_SECONDS: int = TTL_HOURS * 3600

# Length of the generated numeric code.
CODE_LENGTH: int = 5

# Maximum allowed config payload size (characters).
MAX_CONFIG_LENGTH: int = 20_000

# Rate limiting (per client IP, fixed window).
RATE_LIMIT_WINDOW_SECONDS: int = 60
RATE_LIMIT_MAX: int = 30

HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))
