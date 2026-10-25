"""Content check route for Chrome Extension and CMS integration."""
import asyncio
from fastapi import APIRouter
from app.models.schemas import ContentCheckRequest, ContentCheckResponse
from app.services.text_rag import evaluate_text_compliance
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
