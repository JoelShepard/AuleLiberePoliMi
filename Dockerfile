# ── Multi-stage Dockerfile for AuleLiberePoliMi Bot ─────────────────
# Uses uv for fast, reproducible dependency installation.
#
# Build:   docker build -t aule-libere-bot .
# Run:     docker run --rm -e TOKEN=xxx aule-libere-bot

# ══════════════════════════════════════════════════════════════════
# BUILDER — install dependencies via uv
# ══════════════════════════════════════════════════════════════════
FROM python:3.13-slim AS builder

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy dependency metadata first for layer caching
COPY pyproject.toml uv.lock ./

# Sync exact dependencies from lockfile (no dev deps for production)
RUN uv sync --frozen --no-dev --no-editable

# ══════════════════════════════════════════════════════════════════
# RUNTIME — minimal image with only what's needed
# ══════════════════════════════════════════════════════════════════
FROM python:3.13-slim AS runtime

# Create non-root user
RUN groupadd -r bot && useradd -r -g bot -d /app -s /sbin/nologin bot

WORKDIR /app

# Copy the uv-managed virtual environment from builder
COPY --from=builder /app/.venv /app/.venv

# Ensure scripts in the venv are on PATH
ENV PATH="/app/.venv/bin:$PATH"

# Copy application code
COPY bot.py .
COPY functions/ functions/
COPY search/ search/
COPY json/ json/
COPY webapp/ webapp/
COPY photos/ photos/

# Fix ownership
RUN chown -R bot:bot /app

USER bot

# Healthcheck: verify the process is alive (polling bot, no HTTP endpoint)
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD python -c "import os; os.kill(1, 0)" || exit 1

CMD ["python", "bot.py"]
