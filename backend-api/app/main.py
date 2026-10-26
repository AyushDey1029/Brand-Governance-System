"""FastAPI Application Entry Point for Inkloom AI Brand Governance Platform.

Unified server: hosts the asynchronous evaluation microservice (OpenCV + RAG)
and serves the React Admin Dashboard SPA seamlessly from a single process.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import get_settings
from app.routes import api_router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Asynchronous brand compliance microservice executing dual-engine evaluations: "
        "deterministic OpenCV color checks and RAG-driven factual claims verification."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware for Chrome Extension & Admin UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^chrome-extension://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes FIRST so they take precedence over static files
app.include_router(api_router)

# Locate compiled React Admin Dashboard
DIST_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "admin-dashboard", "dist")
)

if os.path.exists(DIST_DIR) and os.path.isfile(os.path.join(DIST_DIR, "index.html")):
    # Serve assets directory
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/dashboard")
    async def serve_dashboard():
        """Serve the React Admin Dashboard."""
        return FileResponse(os.path.join(DIST_DIR, "index.html"))

    @app.get("/test-draft")
    @app.get("/test-cms-draft.html")
    async def serve_test_draft():
        """Serve in-context test CMS draft for Chrome extension testing."""
        cms_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "test-cms-draft.html"))
        if os.path.isfile(cms_path):
            return FileResponse(cms_path)
        return {"error": "test-cms-draft.html not found"}

    @app.get("/")
    async def root():
        """Serve the React Admin Dashboard at the root URL."""
        return FileResponse(os.path.join(DIST_DIR, "index.html"))

    @app.get("/api-status")
    async def api_info():
        return {
            "message": "Inkloom AI Unified Server is online",
            "docs": "/docs",
            "health": "/health",
            "dashboard": "/",
            "check_endpoint": "/api/check-content"
        }
else:
    @app.get("/")
    async def root_fallback():
        return {
            "message": "Inkloom AI Brand Governance API is online",
            "docs": "/docs",
            "health": "/health",
            "check_endpoint": "/api/check-content",
            "note": "React Admin Dashboard not built. Run 'npm run build' inside admin-dashboard/"
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
