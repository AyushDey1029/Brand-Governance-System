"""Health check endpoint."""
from fastapi import APIRouter
from app.config import get_settings
from app.models.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Returns the operational status and active capabilities of Inkloom API."""
    settings = get_settings()
    has_gemini = bool(settings.gemini_api_key and settings.gemini_api_key != "your_gemini_api_key_here")
    
    return HealthResponse(
        status="healthy",
        app=settings.app_name,
        version=settings.app_version,
        gemini_configured=has_gemini,
        environment=settings.environment
    )
