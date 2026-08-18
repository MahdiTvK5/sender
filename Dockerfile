FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DATABASE_PATH=/app/data/configs.db \
    HOST=0.0.0.0 \
    PORT=8000

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Persist the SQLite database across container restarts.
RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host ${HOST} --port ${PORT}"]
