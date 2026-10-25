"""Stubbed RAG & Text Verification Service for Inkloom AI.

Evaluates draft text against enterprise Golden Facts and brand tone guidelines.
Integrates with Google Gemini LLM when configured, with a robust deterministic
fallback engine for offline/local development.
"""
import re
import json
import logging
from typing import List, Optional
from app.config import get_settings
from app.models.schemas import TextCheckResult

logger = logging.getLogger(__name__)

# Enterprise "Golden Facts" Knowledge Base (Mocked for Phase 1 MVP)
GOLDEN_FACTS_KB = """
[SOURCE: Golden Facts - Product & Pricing Matrix v2.4 (Effective 2026)]
1. Pricing Tiers:
   - Free Community Edition: Up to 3 editors, basic OpenCV color checks.
   - Professional Starter Tier: $49/month billed monthly, or $39/month billed annually. 
     (CRITICAL: The legacy $29/mo tier was discontinued in Q3 2024. Any reference to $29/month is strictly outdated).
   - Enterprise Tier: Custom pricing starting at $499/mo, includes SOC2 Type II compliance, VPC isolation, and dedicated SLA.
2. Official Slogans & Taglines:
   - Primary: "Velocity with Precision"
   - Secondary: "Explainable Brand Governance for Modern Creators"
3. Banned Terminology & Risk Policy:
   - Never describe our product as "magic AI", "flawless", or "cheapest".
   - Avoid unsubstantiated absolutes like "100% bug free" or "zero risk guaranteed".
   - Preferred phrasing: "high-confidence governance", "enterprise-grade accuracy", "streamlined workflow".
4. Security & Privacy Facts:
   - Inkloom AI processes DOM text transiently and enforces zero model-training on customer data.
   - Hosted on enterprise Google Cloud infrastructure.
"""


def _mock_rule_engine(text: str) -> List[TextCheckResult]:
    """Deterministic fallback check when Gemini API key is not configured."""
    results: List[TextCheckResult] = []
    text_lower = text.lower()

    # Rule 1: Outdated Starter Pricing ($29 / $29/mo)
    outdated_pricing_pattern = re.compile(r"(\$29(\/mo|\/month)?|29\s?dollars?)", re.IGNORECASE)
    if match := outdated_pricing_pattern.search(text):
        results.append(
            TextCheckResult(
                claim=match.group(0),
                issue="Outdated pricing claim. Starter tier was updated from $29/mo to $49/mo in Q3.",
                citation="Golden Facts: Pricing Matrix v2.4, Item 1",
                suggested_rewrite="$49/month (or $39/mo billed annually)",
                severity="high"
            )
        )

    # Rule 2: Legacy or Incorrect Tier Mention ($19)
    if "$19" in text:
        results.append(
            TextCheckResult(
                claim="$19",
                issue="Non-existent pricing plan cited. Community edition is Free, Starter is $49/mo.",
                citation="Golden Facts: Pricing Matrix v2.4",
                suggested_rewrite="free Community tier or $49/mo Starter tier",
                severity="high"
            )
        )

    # Rule 3: Banned Superlatives ("magic ai", "cheapest", "flawless")
    banned_words = [
        ("magic ai", "high-confidence AI assistance", "Banned term 'magic AI'. Inkloom relies on deterministic rules and explainable LLMs."),
        ("cheapest", "most cost-effective enterprise solution", "Disallowed superlative 'cheapest'. Violates brand voice standards."),
        ("flawless", "rigorous and consistent", "Disallowed claim 'flawless'. Avoid absolute quality guarantees."),
        ("100% bug free", "extensively tested and highly reliable", "Disallowed compliance guarantee '100% bug free'.")
    ]
    for banned, rewrite, reason in banned_words:
        if banned in text_lower:
            # find original casing
            start = text_lower.find(banned)
            original_claim = text[start:start + len(banned)]
            results.append(
                TextCheckResult(
                    claim=original_claim,
                    issue=reason,
                    citation="Brand Style Guide: Banned Terminology & Risk Policy 2026",
                    suggested_rewrite=rewrite,
                    severity="warning"
                )
            )

    # Rule 4: Slogan verification
    if "velocity without" in text_lower and "risk" not in text_lower and "precision" not in text_lower:
        results.append(
            TextCheckResult(
                claim="velocity without ...",
                issue="Distorted brand slogan. Approved tagline is 'Velocity with Precision'.",
                citation="Brand Style Guide: Official Taglines v2.4",
                suggested_rewrite="Velocity with Precision",
                severity="info"
            )
        )

    return results


async def evaluate_text_compliance(text: Optional[str]) -> List[TextCheckResult]:
    """Evaluates draft text using Gemini LLM if key is present, otherwise fallback rules."""
    if not text or not text.strip():
        return []

    settings = get_settings()

    # Attempt Gemini API call if key is present
    if settings.gemini_api_key and settings.gemini_api_key != "your_gemini_api_key_here":
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.gemini_api_key)
            prompt = f"""
You are the Inkloom AI Brand Governance Auditor.
You must evaluate the following DRAFT TEXT against the official GOLDEN FACTS & GUIDELINES.

GOLDEN FACTS:
{GOLDEN_FACTS_KB}

DRAFT TEXT:
"{text}"

Identify any factual discrepancies, outdated claims, or tone policy violations.
Respond ONLY with a JSON array of objects conforming to this schema:
[
  {{
    "claim": "<exact snippet flagged>",
    "issue": "<concise explanation of violation>",
    "citation": "<reference from Golden Facts>",
    "suggested_rewrite": "<prescriptive on-brand rewrite>",
    "severity": "high" | "warning" | "info"
  }}
]
If there are no issues, respond with [].
"""
            response = client.models.generate_content(
                model=settings.gemini_model_text,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )

            if response.text:
                parsed = json.loads(response.text)
                return [TextCheckResult(**item) for item in parsed]

        except Exception as e:
            logger.warning("Gemini API call failed, falling back to rule engine: %s", e)

    # Use deterministic rule engine fallback
    return _mock_rule_engine(text)
