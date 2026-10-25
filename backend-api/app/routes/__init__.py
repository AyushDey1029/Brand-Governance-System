from fastapi import APIRouter
from app.routes.health import router as health_router
from app.routes.content import router as content_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(content_router, tags=["Brand Compliance"])
