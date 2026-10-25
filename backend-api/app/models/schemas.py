"""Pydantic schemas for Inkloom AI Brand Governance requests and responses."""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class ContentCheckRequest(BaseModel):
    """Payload sent by Chrome Extension or CMS containing extracted content."""
    text: Optional[str] = Field(
        default=None,
        description="Draft textual content extracted from the web editor or CMS."
    )
    image_urls: List[str] = Field(
        default_factory=list,
        description="List of image URLs extracted from the current page/post."
    )
    page_url: Optional[str] = Field(
        default=None,
        description="Source page URL where the content was extracted."
    )
    channel: Optional[str] = Field(
        default="web",
        description="Publishing channel (e.g. blog, social, email, webflow)."
    )
    brand_id: Optional[str] = Field(
        default="default",
        description="Identifier for the active brand workspace."
    )


class TextCheckResult(BaseModel):
    """Individual flagged claim or tone inconsistency found in the text."""
    claim: str = Field(description="The exact snippet or claim flagged.")
    issue: str = Field(description="Explanation of why this violates brand rules or factual truth.")
    citation: str = Field(description="Source citation from Golden Facts or Brand Style Guide.")
    suggested_rewrite: str = Field(description="Actionable, on-brand replacement text.")
    severity: Literal["info", "warning", "high"] = Field(
        default="warning",
        description="Severity level of the compliance violation."
    )


class VisionCheckResult(BaseModel):
    """Compliance evaluation for a specific image asset."""
    image_url: str = Field(description="The source image URL that was inspected.")
    dominant_hex: str = Field(description="Dominant hex color extracted via OpenCV.")
    target_brand_hex: str = Field(description="Approved brand palette hex code compared against.")
    match: bool = Field(description="True if the extracted color is within palette tolerance.")
    color_distance: float = Field(description="Mathematical color distance from brand palette.")
    status: Literal["compliant", "warning", "violation", "error"] = Field(
        description="Visual compliance status."
    )
    message: str = Field(description="Human-readable explanation of visual check.")


class ContentCheckResponse(BaseModel):
    """Comprehensive compliance evaluation response."""
    status: Literal["compliant", "warning", "flagged"] = Field(
        description="Overall compliance summary status."
    )
    compliance_score: int = Field(
        ge=0,
        le=100,
        description="Overall brand health score (0 = total violation, 100 = fully compliant)."
    )
    summary: str = Field(description="Executive summary of findings for the creator.")
    total_text_issues: int = Field(default=0)
    total_visual_issues: int = Field(default=0)
    text_evaluations: List[TextCheckResult] = Field(default_factory=list)
    visual_evaluations: List[VisionCheckResult] = Field(default_factory=list)


class HealthResponse(BaseModel):
    """Server health and runtime capabilities status."""
    status: str
    app: str
    version: str
    gemini_configured: bool
    environment: str
