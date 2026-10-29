"""Authentication and Supabase Client Configuration Routes."""
from fastapi import APIRouter
from pydantic import BaseModel
try:
    import psycopg2
except ImportError:
    psycopg2 = None
from app.config import get_settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class ConfirmEmailRequest(BaseModel):
    email: str

@router.get("/config")
async def get_auth_config():
    """Returns safe client-side Supabase configuration for frontend initialization."""
    settings = get_settings()
    has_key = bool(settings.supabase_key and len(settings.supabase_key.strip()) > 10)
    return {
        "supabase_url": settings.supabase_url or "https://aucxwdwiubevbmsprlhy.supabase.co",
        "supabase_anon_key": settings.supabase_key if has_key else "",
        "is_configured": has_key,
        "default_role": "creator",
        "allowed_roles": ["creator", "reviewer", "admin"]
    }

@router.post("/confirm-email")
async def auto_confirm_email(req: ConfirmEmailRequest):
    """Auto-confirms a user email in auth.users so creators are never blocked by unconfirmed emails."""
    settings = get_settings()
    if not psycopg2 or not settings.database_url:
        return {"status": "skipped", "message": "No database URL configured or psycopg2 not installed"}
    
    try:
        conn = psycopg2.connect(settings.database_url)
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(
            "UPDATE auth.users SET email_confirmed_at = NOW() WHERE LOWER(email) = LOWER(%s) AND email_confirmed_at IS NULL;",
            (req.email.strip(),)
        )
        updated = cur.rowcount
        cur.close()
        conn.close()
        return {"status": "ok", "updated": updated}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/demo-creator")
async def get_demo_creator():
    """Returns demo content creator credentials for 1-click hackathon evaluation."""
    return {
        "id": "creator-demo-marcus",
        "email": "marcus.vance@inkloom.internal",
        "full_name": "Marcus Vance",
        "role": "creator",
        "workspace": "Acme Brand v2",
        "is_demo": True
    }

@router.get("/demo-admin")
async def get_demo_admin():
    """Returns demo brand director / company admin credentials for 1-click hackathon evaluation."""
    return {
        "id": "admin-demo-sarah",
        "email": "sarah.chen@inkloom.internal",
        "full_name": "Sarah Chen",
        "role": "admin",
        "workspace": "Acme Brand v2",
        "is_demo": True
    }
