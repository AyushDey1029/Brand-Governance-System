# =============================================================================
# Stage 1: Build React Frontend
# =============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/admin-dashboard

COPY admin-dashboard/package*.json ./
RUN npm ci --prefer-offline --no-audit

COPY admin-dashboard/ ./
RUN npm run build

# =============================================================================
# Stage 2: Python Backend & Unified Server
# =============================================================================
FROM python:3.11-slim AS production

# Install system dependencies for OpenCV and networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libglib2.0-0 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend requirements and install
COPY backend-api/requirements.txt ./backend-api/requirements.txt
RUN pip install --no-cache-dir -r ./backend-api/requirements.txt

# Copy backend source & assets
COPY backend-api/ ./backend-api/
COPY extension/ ./extension/
COPY test-cms-draft.html ./test-cms-draft.html
COPY run.py ./run.py

# Copy pre-compiled frontend from Stage 1
COPY --from=frontend-builder /app/admin-dashboard/dist ./admin-dashboard/dist
COPY --from=frontend-builder /app/admin-dashboard/public ./admin-dashboard/public

# Default environment variables
ENV PYTHONUNBUFFERED=1
ENV HOST=0.0.0.0
ENV PORT=8000
ENV PYTHONPATH=/app/backend-api

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

CMD ["python", "run.py"]
