# ── Multi-stage Dockerfile for AuleLiberePoliMi Bot ─────────────────
# Build stage: install dependencies
FROM python:3.13-slim AS builder

RUN pip install --no-cache-dir --upgrade pip
COPY pyproject.toml .
RUN pip install --no-cache-dir --prefix=/install \
    "python-telegram-bot>=22.8" \
    "python-dotenv>=1.0" \
    "pytz>=2024.0" \
    "requests>=2.31" \
    "beautifulsoup4>=4.12" \
    "lxml>=5.0"

# ── Runtime stage ────────────────────────────────────────────────
FROM python:3.13-slim AS runtime

# Create non-root user
RUN groupadd -r bot && useradd -r -g bot -d /app -s /sbin/nologin bot

WORKDIR /app

# Copy installed packages
COPY --from=builder /install /usr/local

# Copy application code
COPY bot.py .
COPY functions/ functions/
COPY search/ search/
COPY json/ json/
COPY webapp/ webapp/

# Fix ownership
RUN chown -R bot:bot /app

USER bot

# Healthcheck (optional — polling bot, no HTTP endpoint)
# HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
#   CMD python -c "import os; os.kill(1, 0)" || exit 1

CMD ["python", "bot.py"]
