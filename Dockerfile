# =============================================================================
# Inkloom AI — Unified Production Multi-Stage Dockerfile
# Serves React Admin Dashboard + FastAPI Microservice + Chrome Extension Assets
# Port: 8000
# =============================================================================

# --- Stage 1: Build React Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/admin-dashboard

ARG VITE_SUPABASE_URL=https://aucxwdwiubevbmsprlhy.supabase.co
ARG VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1Y3h3ZHdpdWJldmJtc3BybGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMDkxNDIsImV4cCI6MjEwODU4NTE0Mn0.wOkcT_aMpDldU0K0JLuYzGvy4McuvwCgJ2ihVo4tXbA
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Cache package dependencies layer
COPY admin-dashboard/package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy frontend source and compile static distribution
COPY admin-dashboard/ ./
RUN npm run build

# --- Stage 2: Python Backend & Unified Server Runtime ---
FROM python:3.11-slim AS production

# Install essential system dependencies (curl for healthcheck, glib for opencv)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libglib2.0-0 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cache Python dependencies
COPY backend-api/requirements.txt ./backend-api/requirements.txt
RUN pip install --no-cache-dir -r ./backend-api/requirements.txt

# Copy application source & assets
COPY backend-api/ ./backend-api/
COPY extension/ ./extension/
COPY test-cms-draft.html ./test-cms-draft.html
COPY run.py ./run.py

# Copy compiled frontend from Stage 1 into the unified server directory
COPY --from=frontend-builder /app/admin-dashboard/dist ./admin-dashboard/dist
COPY --from=frontend-builder /app/admin-dashboard/public ./admin-dashboard/public

# Default environment configuration
ENV PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=8000 \
    PYTHONPATH=/app/backend-api \
    ENVIRONMENT=production

EXPOSE 8000

# Docker Healthcheck
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Launch the unified server
CMD ["python", "run.py"]
