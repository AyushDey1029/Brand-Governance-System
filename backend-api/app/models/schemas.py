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


class GoldenFactItem(BaseModel):
    """Structured Golden Fact entry from knowledge base."""
    id: str
    category: str
    title: str
    citation: str
    content: str
    metadata: Optional[dict] = Field(default_factory=dict)


class GoldenFactsListResponse(BaseModel):
    """Response containing all loaded Golden Facts."""
    total: int
    categories: List[str]
    facts: List[GoldenFactItem]


class GoldenFactSearchRequest(BaseModel):
    """Request payload to query the Vector Knowledge Base."""
    query: str = Field(description="Search text or claim to retrieve Golden Facts for.")
    top_k: int = Field(default=3, ge=1, le=10, description="Number of relevant documents to retrieve.")


class GoldenFactSearchResult(BaseModel):
    """Individual vector search match with similarity score."""
    id: str
    category: str
    title: str
    citation: str
    content: str
    similarity_score: float = Field(description="Cosine similarity score (0.0 to 1.0).")


class GoldenFactSearchResponse(BaseModel):
    """Response payload for semantic vector search."""
    query: str
    provider: str
    results_count: int
    results: List[GoldenFactSearchResult]

class LogoCheckRequest(BaseModel):
    """Payload to evaluate brand logo presence and boundary rules."""
    image_url: str = Field(description="URL or base64 data URI of the image to audit.")
    template_url: Optional[str] = Field(
        default=None,
        description="Optional reference logo template URL. Defaults to official Inkloom logo mark."
    )
    min_height: int = Field(default=20, ge=10, description="Minimum logo height in pixels.")
    clear_space_ratio: float = Field(default=0.35, ge=0.1, le=1.0, description="Exclusion margin ratio.")
    detection_threshold: float = Field(default=0.65, ge=0.3, le=0.99, description="Confidence threshold.")


class LogoCheckResponse(BaseModel):
    """Result of multi-scale logo presence, aspect ratio, and clear space checks."""
    detected: bool
    confidence: float
    bounding_box: Optional[dict] = None
    scale: float = 1.0
    aspect_ratio_ok: bool = True
    aspect_ratio_error_pct: float = 0.0
    min_size_ok: bool = True
    clear_space_ok: bool = True
    clear_space_clutter: float = 0.0
    status: Literal["compliant", "warning", "violation", "error"]
    message: str


class PaletteItem(BaseModel):
    hex: str
    rgb: List[int]
    coverage: float


class PaletteExtractionRequest(BaseModel):
    """Payload to extract full color palette from an image."""
    image_url: str
    k: int = Field(default=5, ge=1, le=10)


class PaletteExtractionResponse(BaseModel):
    """Full palette breakdown with coverage percentages."""
    image_url: str
    dominant_hex: str
    palette: List[PaletteItem]
