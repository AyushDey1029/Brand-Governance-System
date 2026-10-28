"""Application Configuration Settings."""
import os
from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

try:
    import certifi
    if not os.environ.get("SSL_CERT_FILE"):
        os.environ["SSL_CERT_FILE"] = certifi.where()
    if not os.environ.get("REQUESTS_CA_BUNDLE"):
        os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()
except ImportError:
    pass


class Settings(BaseSettings):
    app_name: str = "Inkloom AI - Brand Governance API"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = True
    
    # Server Binding
    host: str = "127.0.0.1"
    port: int = 8000
    
    # Gemini AI
    gemini_api_key: str = ""
    gemini_model_text: str = "gemini-2.5-flash"
    gemini_embedding_model: str = "gemini-embedding-001"
    
    # Vector Database & RAG Configuration
    vector_db_provider: str = "in_memory"  # Options: "in_memory", "qdrant", "pinecone"
    qdrant_url: Optional[str] = None
    qdrant_api_key: Optional[str] = None
    qdrant_collection: str = "inkloom_golden_facts"
    pinecone_api_key: Optional[str] = None
    pinecone_index_name: str = "inkloom-golden-facts"
    rag_top_k: int = 3
    
    # Supabase Database (Optional - falls back to local memory if unset)
    supabase_url: str = ""
    supabase_key: str = ""
    database_url: str = ""
    
    # Brand Rules (Default "Golden" Brand Palette)
    brand_primary_hex: str = "#4F46E5"  # Inkloom Indigo
    brand_secondary_hex: str = "#06B6D4" # Cyan Accent
    brand_neutral_dark: str = "#0F172A"  # Slate 900
    color_tolerance: float = 38.0        # Euclidean color distance threshold
    
    # CORS Origins (Allow Chrome Extension and local dashboard)
    cors_origins: List[str] = [
        "*",
        "chrome-extension://*",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
