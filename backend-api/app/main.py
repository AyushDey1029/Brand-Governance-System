"""FastAPI Application Entry Point for Inkloom AI Brand Governance Platform."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Register routes
app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "message": "Inkloom AI Brand Governance API is online",
        "docs": "/docs",
        "health": "/health",
        "check_endpoint": "/api/check-content"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
