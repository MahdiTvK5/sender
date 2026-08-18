"""FastAPI application: pages + JSON API for anonymous config sharing."""
from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from . import config, store
from .db import init_db
from .security import (
    escape_html,
    get_client_ip,
    is_valid_code,
    make_qr_data_url,
    rate_limit,
    validate_config,
)

BASE_DIR = Path(__file__).resolve().parent


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="پلتفرم ارسال کانفیگ", docs_url=None, redoc_url=None, lifespan=lifespan)
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


def base_url_from_request(request: Request) -> str:
    if config.BASE_URL:
        return config.BASE_URL
    host = request.headers.get("x-forwarded-host") or request.headers.get("host")
    if not host:
        return ""
    proto = request.headers.get("x-forwarded-proto") or request.url.scheme or "http"
    return f"{proto}://{host}"


def _rate_or_429(request: Request, bucket: str):
    ip = get_client_ip(request.headers, request.client.host if request.client else "unknown")
    allowed, retry_after = rate_limit(f"{bucket}:{ip}")
    if not allowed:
        return JSONResponse(
            {"error": "درخواست‌های بیش از حد. لطفاً کمی بعد تلاش کنید."},
            status_code=429,
            headers={"Retry-After": str(retry_after)},
        )
    return None


# --------------------------------------------------------------------------- #
# Pages
# --------------------------------------------------------------------------- #
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/s/{code}", response_class=HTMLResponse)
async def share_page(request: Request, code: str):
    if not is_valid_code(code):
        return templates.TemplateResponse(
            "state.html",
            {"request": request, "kind": "not_found", "message": "کانفیگی پیدا نشد."},
            status_code=404,
        )

    record = store.get_config_by_code(code)
    if record is None:
        return templates.TemplateResponse(
            "state.html",
            {"request": request, "kind": "not_found", "message": "کانفیگی پیدا نشد."},
            status_code=404,
        )

    if record.status == "expired":
        return templates.TemplateResponse(
            "state.html",
            {"request": request, "kind": "expired", "message": "این لینک منقضی شده است."},
            status_code=410,
        )

    return templates.TemplateResponse(
        "share.html",
        {
            "request": request,
            "code": record.code,
            "config": record.config,
            "config_safe": escape_html(record.config),
            "share_link": record.shareLink,
            "created_at": record.createdAt,
            "expires_at": record.expiresAt,
            "qr": make_qr_data_url(record.shareLink),
        },
    )


# --------------------------------------------------------------------------- #
# API
# --------------------------------------------------------------------------- #
@app.post("/api/create")
async def api_create(request: Request):
    limited = _rate_or_429(request, "create")
    if limited is not None:
        return limited

    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "بدنه درخواست نامعتبر است."}, status_code=400)

    ok, value, error = validate_config((body or {}).get("config"))
    if not ok or value is None:
        return JSONResponse({"error": error}, status_code=400)

    try:
        record = store.create_config(value, base_url_from_request(request))
    except Exception as exc:  # noqa: BLE001
        return JSONResponse({"error": str(exc)}, status_code=500)

    return JSONResponse(
        {
            "code": record.code,
            "shareLink": record.shareLink,
            "expiresAt": record.expiresAt,
            "createdAt": record.createdAt,
            "qr": make_qr_data_url(record.shareLink),
        },
        status_code=201,
    )


@app.get("/api/config/{code}")
async def api_get(request: Request, code: str):
    limited = _rate_or_429(request, "read")
    if limited is not None:
        return limited

    if not is_valid_code(code):
        return JSONResponse({"error": "کد نامعتبر است."}, status_code=400)

    record = store.get_config_by_code(code)
    if record is None:
        return JSONResponse({"error": "کانفیگی پیدا نشد."}, status_code=404)
    if record.status == "expired":
        return JSONResponse({"error": "این لینک منقضی شده است."}, status_code=410)

    return JSONResponse(
        {
            "config": record.config,
            "code": record.code,
            "createdAt": record.createdAt,
            "expiresAt": record.expiresAt,
            "status": record.status,
        }
    )


@app.delete("/api/config/{code}")
async def api_delete(request: Request, code: str):
    limited = _rate_or_429(request, "delete")
    if limited is not None:
        return limited

    if not is_valid_code(code):
        return JSONResponse({"error": "کد نامعتبر است."}, status_code=400)

    if not store.delete_config_by_code(code):
        return JSONResponse({"error": "کانفیگی پیدا نشد."}, status_code=404)

    return JSONResponse({"success": True})
