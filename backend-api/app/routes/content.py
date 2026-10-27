"""Content check route for Chrome Extension and CMS integration."""
import asyncio
from typing import Optional
from fastapi import APIRouter, Query
from app.models.schemas import (
    ContentCheckRequest,
    ContentCheckResponse,
    GoldenFactsListResponse,
    GoldenFactItem,
    GoldenFactSearchRequest,
    GoldenFactSearchResponse,
    GoldenFactSearchResult
)
from app.services.text_rag import (
    evaluate_text_compliance,
    retrieve_relevant_facts,
    get_all_golden_facts
)
from app.services.vector_store import get_vector_store
from app.services.vision_check import evaluate_images_compliance

router = APIRouter(prefix="/api")


@router.post("/check-content", response_model=ContentCheckResponse)
async def check_content(payload: ContentCheckRequest):
    """
    Main evaluation pipeline endpoint.
    Performs dual-engine evaluation:
    1. Text Pipeline: Checks factual accuracy, tone, and outdated claims against Golden Facts.
    2. Vision Pipeline: Extracts dominant image hex colors via OpenCV and validates brand palette.
    """
    # Run text evaluation and vision evaluation concurrently
    text_results, vision_results = await asyncio.gather(
        evaluate_text_compliance(payload.text),
        evaluate_images_compliance(payload.image_urls)
    )

    # Calculate compliance score
    score = 100
    for issue in text_results:
        if issue.severity == "high":
            score -= 25
        elif issue.severity == "warning":
            score -= 10
        elif issue.severity == "info":
            score -= 5

    for img in vision_results:
        if img.status == "violation":
            score -= 20
        elif img.status == "warning":
            score -= 10

    score = max(0, min(100, score))

    # Overall status classification
    if score >= 90 and not any(i.severity == "high" for i in text_results):
        overall_status = "compliant"
    elif score >= 65:
        overall_status = "warning"
    else:
        overall_status = "flagged"

    # Formulate executive summary
    total_text = len(text_results)
    total_vision = sum(1 for img in vision_results if not img.match)

    if total_text == 0 and total_vision == 0:
        summary = "Content and visual assets strictly adhere to Inkloom brand standards."
    else:
        parts = []
        if total_text > 0:
            parts.append(f"{total_text} copy issue{'s' if total_text > 1 else ''} flagged")
        if total_vision > 0:
            parts.append(f"{total_vision} off-brand visual asset{'s' if total_vision > 1 else ''} detected")
        summary = f"Audit flagged: {', '.join(parts)}. Actionable fixes are provided below."

    return ContentCheckResponse(
        status=overall_status,
        compliance_score=score,
        summary=summary,
        total_text_issues=total_text,
        total_visual_issues=total_vision,
        text_evaluations=text_results,
        visual_evaluations=vision_results
    )


# In-memory review queue storage (persists during server uptime)
ESCALATED_REVIEWS = [
    {
        "id": "REV-104",
        "cms": "WordPress Blog",
        "author": "Marcus Vance",
        "submittedAt": "Today at 10:15 AM",
        "excerpt": "Upgrade to our starter edition today for only $29/mo and enjoy effortless content velocity with magic AI.",
        "violation": "Outdated legacy pricing ($29) + Disallowed superlative ('magic AI')",
        "citation": "Golden Facts: Pricing Matrix v2.4, Item 1",
        "page_url": "https://example.com/wp-admin/post.php?id=12"
    },
    {
        "id": "REV-105",
        "cms": "LinkedIn Campaign",
        "author": "Elena Rostova",
        "submittedAt": "Today at 09:30 AM",
        "excerpt": "Guaranteed 100% bug free brand governance with zero human overhead.",
        "violation": "High-risk absolute guarantee ('100% bug free')",
        "citation": "Brand Style Guide: Banned Terminology 2026",
        "page_url": "https://linkedin.com/campaign"
    }
]


from app.services.supabase_service import fetch_review_queue, insert_review_ticket, update_review_ticket_status


@router.post("/reviews/escalate")
async def escalate_review(payload: dict):
    """Escalates a flagged CMS draft claim to the Admin Dashboard Review Queue (Supabase or memory)."""
    import random
    ticket_id = payload.get("id") or f"REV-{random.randint(110, 999)}"
    review_item = {
        "id": ticket_id,
        "cms": payload.get("cms", "Web CMS Post"),
        "author": payload.get("author", "In-Context CMS Creator"),
        "submitted_at": "Just now",
        "submittedAt": "Just now",
        "excerpt": payload.get("excerpt", ""),
        "violation": payload.get("violation", "High-risk brand policy flag"),
        "citation": payload.get("citation", "Brand Guidelines 2026"),
        "page_url": payload.get("page_url", "")
    }
    saved_item = insert_review_ticket(review_item)
    return {"status": "success", "message": "Draft escalated to review queue", "review": saved_item}


@router.get("/reviews")
async def get_reviews():
    """Returns all pending escalated drafts for the Admin Dashboard."""
    reviews = fetch_review_queue()
    # Ensure both camelCase and snake_case for frontend compatibility
    formatted = []
    for r in reviews:
        item = dict(r)
        if "submitted_at" in item and "submittedAt" not in item:
            item["submittedAt"] = item["submitted_at"]
        formatted.append(item)
    return {"reviews": formatted}


@router.post("/reviews/{ticket_id}/action")
async def review_action(ticket_id: str, payload: dict):
    """Updates the status of an escalated draft (e.g. approved or rejected) in Supabase."""
    action = payload.get("action", "approved")
    success = update_review_ticket_status(ticket_id, action)
    return {
        "status": "success" if success else "error",
        "ticket_id": ticket_id,
        "action": action
    }


@router.get("/golden-facts", response_model=GoldenFactsListResponse)
async def list_golden_facts(category: Optional[str] = Query(default=None, description="Filter by category")):
    """Returns all indexed Golden Facts in the knowledge base."""
    docs = get_all_golden_facts()
    if category:
        docs = [d for d in docs if d.category.lower() == category.lower()]

    categories = sorted(list({d.category for d in docs}))
    facts = [
        GoldenFactItem(
            id=d.id,
            category=d.category,
            title=d.title,
            citation=d.citation,
            content=d.content,
            metadata=d.metadata
        )
        for d in docs
    ]
    return GoldenFactsListResponse(
        total=len(facts),
        categories=categories,
        facts=facts
    )


@router.post("/golden-facts/search", response_model=GoldenFactSearchResponse)
async def search_golden_facts(payload: GoldenFactSearchRequest):
    """
    Semantic vector search across indexed Golden Facts.
    Retrieves the top-k most relevant facts using cosine similarity.
    """
    store = get_vector_store()
    results = store.search(payload.query, top_k=payload.top_k)

    search_items = [
        GoldenFactSearchResult(
            id=doc.id,
            category=doc.category,
            title=doc.title,
            citation=doc.citation,
            content=doc.content,
            similarity_score=round(score, 4)
        )
        for doc, score in results
    ]

    return GoldenFactSearchResponse(
        query=payload.query,
        provider=store.provider_name,
        results_count=len(search_items),
        results=search_items
    )

from app.models.schemas import LogoCheckRequest, LogoCheckResponse, PaletteExtractionRequest, PaletteExtractionResponse
from app.services.vision_check import evaluate_image_palette, evaluate_logo_boundary
from app.services.asset_parser import parse_assets_from_csv
import os


@router.post("/check-logo", response_model=LogoCheckResponse)
async def check_logo(payload: LogoCheckRequest):
    """
    Evaluates brand logo presence, distortion/aspect-ratio, and clear-space exclusion zones.
    """
    return await evaluate_logo_boundary(payload)


@router.post("/extract-palette", response_model=PaletteExtractionResponse)
async def extract_palette_endpoint(payload: PaletteExtractionRequest):
    """
    Extracts dominant color and full multi-cluster color palette with coverage percentages.
    """
    return await evaluate_image_palette(payload.image_url, k=payload.k)


@router.get("/brand-assets")
async def get_brand_assets():
    """
    Retrieves currently loaded brand assets (approved palettes and logo guidelines).
    """
    csv_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "vision-engine", "golden_assets.csv")
    )
    if os.path.isfile(csv_path):
        profile = parse_assets_from_csv(csv_path)
        return profile.model_dump()
    return {
        "brand_id": "inkloom",
        "brand_name": "Inkloom AI",
        "primary_color": {"hex_code": "#4F46E5", "name": "Inkloom Indigo", "tolerance_de00": 3.5},
        "palettes": [],
        "logos": []
    }
