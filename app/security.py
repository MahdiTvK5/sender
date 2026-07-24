"""Security helpers: validation, rate limiting, HTML escaping, QR generation."""
from __future__ import annotations

import base64
import html
import re
import threading
import time
from io import BytesIO
from typing import Optional, Tuple

import qrcode
import qrcode.image.svg

from . import config

_CODE_RE = re.compile(rf"^\d{{{config.CODE_LENGTH}}}$")


def is_valid_code(code: object) -> bool:
    return isinstance(code, str) and bool(_CODE_RE.match(code))


def escape_html(text: str) -> str:
    """Escape HTML-sensitive characters to prevent stored XSS."""
    return html.escape(text, quote=True)


def validate_config(raw: object) -> Tuple[bool, Optional[str], Optional[str]]:
    """Validate an incoming config payload.

    Returns (ok, value, error).
    """
    if not isinstance(raw, str):
        return False, None, "کانفیگ نامعتبر است."
    value = raw.strip()
    if not value:
        return False, None, "کانفیگ نمی‌تواند خالی باشد."
    if len(value) > config.MAX_CONFIG_LENGTH:
        return False, None, "کانفیگ بیش از حد بزرگ است."
    return True, value, None


# --------------------------------------------------------------------------- #
# Rate limiting (in-memory fixed window, keyed by client IP + bucket name)
# --------------------------------------------------------------------------- #
_lock = threading.Lock()
_buckets: dict[str, Tuple[int, float]] = {}


def rate_limit(key: str) -> Tuple[bool, int]:
    """Return (allowed, retry_after_seconds)."""
    now = time.time()
    window = config.RATE_LIMIT_WINDOW_SECONDS
    with _lock:
        entry = _buckets.get(key)
        if entry is None or now > entry[1]:
            _buckets[key] = (1, now + window)
            return True, 0
        count, reset_at = entry
        if count >= config.RATE_LIMIT_MAX:
            return False, int(reset_at - now) + 1
        _buckets[key] = (count + 1, reset_at)
        return True, 0


def get_client_ip(headers, fallback: str = "unknown") -> str:
    forwarded = headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return headers.get("x-real-ip") or fallback


# --------------------------------------------------------------------------- #
# QR code
# --------------------------------------------------------------------------- #
def make_qr_svg(data: str) -> str:
    """Return an inline SVG string encoding *data* as a QR code."""
    factory = qrcode.image.svg.SvgPathImage
    img = qrcode.make(data, image_factory=factory, box_size=10, border=1)
    buffer = BytesIO()
    img.save(buffer)
    return buffer.getvalue().decode("utf-8")


def make_qr_data_url(data: str) -> str:
    """Return a base64 `data:` URL (SVG) encoding *data* as a QR code."""
    svg = make_qr_svg(data)
    encoded = base64.b64encode(svg.encode("utf-8")).decode("ascii")
    return f"data:image/svg+xml;base64,{encoded}"
