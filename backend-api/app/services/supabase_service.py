"""Supabase Database Bridge for Inkloom AI.

Provides seamless connectivity to Supabase PostgreSQL:
- Golden Facts & pgvector embeddings for Anshul's RAG pipeline
- Review Queue persistence for escalated CMS drafts
- Brand Tone Policies & OpenCV visual assets
Includes graceful in-memory fallbacks when credentials are not yet configured.
"""
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.config import get_settings

logger = logging.getLogger(__name__)

# In-memory fallbacks when Supabase credentials are not provided
_FALLBACK_REVIEWS = [
    {
        "id": "REV-101",
        "cms": "WordPress Blog",
        "author": "Marcus Vance",
        "submitted_at": "Today at 10:15 AM",
        "excerpt": "Upgrade to our starter tier for only $29/mo to unlock unlimited workflow automation.",
        "violation": "Outdated pricing claim ($29/mo cited instead of $49/mo)",
        "citation": "Golden Facts: Pricing Matrix v2.4, Item 1",
        "status": "pending"
    },
    {
        "id": "REV-102",
        "cms": "LinkedIn Campaign",
        "author": "Elena Rostova",
        "submitted_at": "Today at 09:30 AM",
        "excerpt": "Guaranteed 100% bug free brand governance with zero human overhead.",
        "violation": "High-risk absolute guarantee (\"100% bug free\")",
        "citation": "Brand Style Guide: Banned Terminology 2026",
        "status": "pending"
    },
    {
        "id": "REV-103",
        "cms": "Webflow Landing Page",
        "author": "David Zhao",
        "submitted_at": "Yesterday at 4:45 PM",
        "excerpt": "Powered by magic AI that writes flawless marketing copy every time.",
        "violation": "Disallowed superlative (\"magic AI\")",
        "citation": "Brand Guidelines: Voice & Tone Section 4",
        "status": "pending"
    }
]

_supabase_client = None


def get_supabase_client():
    """Lazily initialize and return the Supabase client if credentials exist."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    settings = get_settings()
    if settings.supabase_url and settings.supabase_key:
        try:
            from supabase import create_client, ClientOptions
            _supabase_client = create_client(
                settings.supabase_url,
                settings.supabase_key
            )
            logger.info("Connected to Supabase PostgreSQL database successfully.")
            return _supabase_client
        except Exception as e:
            logger.warning("Could not initialize Supabase client: %s. Using in-memory fallback.", e)
            return None
    return None


def get_postgres_connection():
    """Returns a direct psycopg2 connection if database_url is configured."""
    settings = get_settings()
    if settings.database_url:
        try:
            import psycopg2
            conn = psycopg2.connect(settings.database_url, connect_timeout=5)
            conn.autocommit = True
            return conn
        except Exception as e:
            logger.warning("Could not connect via database_url (%s).", e)
    return None


def is_supabase_enabled() -> bool:
    """Check if Supabase is active and reachable via REST or Direct Postgres."""
    settings = get_settings()
    return bool(settings.database_url or (settings.supabase_url and settings.supabase_key))


# ============================================================================
# REVIEW QUEUE OPERATIONS
# ============================================================================

def fetch_review_queue() -> List[Dict[str, Any]]:
    """Fetch all pending tickets from Supabase or fallback memory."""
    # 1. Try Direct PostgreSQL Connection
    pg_conn = get_postgres_connection()
    if pg_conn:
        try:
            with pg_conn.cursor() as cur:
                cur.execute(
                    "SELECT id, cms, author, submitted_at, excerpt, violation, citation, status, page_url "
                    "FROM public.review_queue WHERE status = 'pending' ORDER BY created_at DESC;"
                )
                rows = cur.fetchall()
                results = []
                for r in rows:
                    results.append({
                        "id": r[0],
                        "cms": r[1],
                        "author": r[2],
                        "submitted_at": r[3],
                        "submittedAt": r[3],
                        "excerpt": r[4],
                        "violation": r[5],
                        "citation": r[6],
                        "status": r[7],
                        "page_url": r[8] or ""
                    })
                pg_conn.close()
                return results
        except Exception as e:
            logger.warning("Postgres fetch_review_queue error: %s", e)
            try:
                pg_conn.close()
            except Exception:
                pass

    # 2. Try Supabase REST Client
    client = get_supabase_client()
    if client:
        try:
            response = client.table("review_queue").select("*").eq("status", "pending").order("created_at", desc=True).execute()
            if response.data:
                return response.data
        except Exception as e:
            logger.warning("Supabase REST fetch_review_queue failed (%s).", e)

    return [r for r in _FALLBACK_REVIEWS if r.get("status") == "pending"]


def insert_review_ticket(ticket: Dict[str, Any]) -> Dict[str, Any]:
    """Insert an escalated draft into the review queue."""
    # 1. Try Direct PostgreSQL Connection
    pg_conn = get_postgres_connection()
    if pg_conn:
        try:
            with pg_conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO public.review_queue (id, cms, author, submitted_at, excerpt, violation, citation, status, page_url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
                    """,
                    (
                        ticket.get("id"),
                        ticket.get("cms", "Web CMS"),
                        ticket.get("author", "Content Creator"),
                        ticket.get("submitted_at") or ticket.get("submittedAt", datetime.now().strftime("Today at %I:%M %p")),
                        ticket.get("excerpt", ""),
                        ticket.get("violation", ""),
                        ticket.get("citation", ""),
                        ticket.get("status", "pending"),
                        ticket.get("page_url", "")
                    )
                )
            pg_conn.close()
            return ticket
        except Exception as e:
            logger.warning("Postgres insert_review_ticket error: %s", e)
            try:
                pg_conn.close()
            except Exception:
                pass

    # 2. Try Supabase REST Client
    client = get_supabase_client()
    if client:
        try:
            payload = {
                "id": ticket.get("id"),
                "cms": ticket.get("cms", "Web CMS"),
                "author": ticket.get("author", "Content Creator"),
                "submitted_at": ticket.get("submitted_at") or ticket.get("submittedAt", datetime.now().strftime("Today at %I:%M %p")),
                "excerpt": ticket.get("excerpt", ""),
                "violation": ticket.get("violation", ""),
                "citation": ticket.get("citation", ""),
                "status": ticket.get("status", "pending"),
                "page_url": ticket.get("page_url", "")
            }
            res = client.table("review_queue").insert(payload).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warning("Supabase REST insert_review_ticket failed (%s).", e)

    # In-memory fallback
    _FALLBACK_REVIEWS.insert(0, ticket)
    return ticket


def update_review_ticket_status(ticket_id: str, new_status: str) -> bool:
    """Update status of a review ticket (e.g. 'approved' or 'rejected') in Supabase."""
    # 1. Try Direct PostgreSQL Connection
    pg_conn = get_postgres_connection()
    if pg_conn:
        try:
            with pg_conn.cursor() as cur:
                cur.execute(
                    "UPDATE public.review_queue SET status = %s WHERE id = %s;",
                    (new_status, ticket_id)
                )
            pg_conn.close()
            return True
        except Exception as e:
            logger.warning("Postgres update_review_ticket_status error: %s", e)
            try:
                pg_conn.close()
            except Exception:
                pass

    # 2. Try Supabase REST Client
    client = get_supabase_client()
    if client:
        try:
            res = client.table("review_queue").update({"status": new_status}).eq("id", ticket_id).execute()
            return bool(res.data)
        except Exception as e:
            logger.warning("Supabase update_review_ticket_status failed (%s), updating in memory.", e)

    # In-memory fallback
    for item in _FALLBACK_REVIEWS:
        if item.get("id") == ticket_id:
            item["status"] = new_status
            return True
    return False


# ============================================================================
# GOLDEN FACTS & RAG OPERATIONS (For Anshul's Pipeline)
# ============================================================================

def fetch_golden_facts() -> List[Dict[str, Any]]:
    """Fetch ground truth facts from Supabase."""
    client = get_supabase_client()
    if client:
        try:
            res = client.table("golden_facts").select("*").eq("is_active", True).execute()
            if res.data:
                return res.data
        except Exception as e:
            logger.warning("Supabase fetch_golden_facts failed (%s).", e)
    return []


def match_golden_facts_vector(embedding: List[float], threshold: float = 0.65, count: int = 4) -> List[Dict[str, Any]]:
    """Execute pgvector semantic similarity search using the RPC function."""
    client = get_supabase_client()
    if client:
        try:
            params = {
                "query_embedding": embedding,
                "match_threshold": threshold,
                "match_count": count
            }
            res = client.rpc("match_golden_facts", params).execute()
            if res.data:
                return res.data
        except Exception as e:
            logger.warning("Supabase match_golden_facts RPC failed: %s", e)
    return []
