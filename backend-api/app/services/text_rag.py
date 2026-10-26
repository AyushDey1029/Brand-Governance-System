"""RAG & Text Governance Verification Service for Inkloom AI.

Evaluates draft content against enterprise Golden Facts and brand tone guidelines.
Combines semantic vector retrieval (In-Memory, Qdrant, Pinecone) with fine-tuned
Gemini prompt engineering, supported by a deterministic fallback engine for
offline/local development.
"""
import re
import json
import logging
from typing import List, Optional, Tuple, Dict, Any
from app.config import get_settings
from app.models.schemas import TextCheckResult
from app.services.vector_store import get_vector_store, VectorDocument

logger = logging.getLogger(__name__)

# Legacy KB string kept for backward compatibility
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

# Few-shot prompt exemplars for Gemini
FEW_SHOT_SYSTEM_PROMPT = """You are the Inkloom AI Brand Governance Auditor.
Your job is to audit draft copy against retrieved enterprise GOLDEN FACTS.

Evaluate the draft text and identify:
1. Outdated or inaccurate pricing and subscription claims.
2. Disallowed superlatives, black-box AI hype ("magic AI"), and unprovable absolutes ("100% bug free", "flawless").
3. Distorted brand slogans or taglines.
4. Misleading security or privacy claims.

Rules:
- Flag ONLY explicit violations based strictly on the provided Golden Facts.
- For each violation, specify the exact snippet flagged, a concise explanation, the exact Golden Fact citation, a prescriptive on-brand replacement, and the severity ("high", "warning", or "info").
- If the content is fully compliant, return an empty JSON array: [].
- Never hallucinate non-existent rules.

Example 1 (Pricing Drift):
Input: "Sign up for our starter plan at only $29/mo to unlock full velocity."
Output: [
  {
    "claim": "$29/mo",
    "issue": "Outdated pricing claim. Starter tier was updated from legacy $29/mo to $49/mo in Q3 2024.",
    "citation": "Golden Facts: Pricing Matrix v2.4 (Effective 2026), Section 1",
    "suggested_rewrite": "$49/month (or $39/mo billed annually)",
    "severity": "high"
  }
]

Example 2 (Banned Superlative & Absolute):
Input: "Our magic AI delivers 100% bug free brand governance."
Output: [
  {
    "claim": "magic AI",
    "issue": "Banned term 'magic AI'. Inkloom relies on deterministic rules and explainable LLMs.",
    "citation": "Brand Style Guide: Banned Terminology & Risk Policy 2026, Section 3",
    "suggested_rewrite": "high-confidence AI assistance",
    "severity": "warning"
  },
  {
    "claim": "100% bug free",
    "issue": "Disallowed compliance guarantee '100% bug free'. Legal risk for unprovable absolutes.",
    "citation": "Brand Style Guide: Banned Terminology & Risk Policy 2026, Section 3",
    "suggested_rewrite": "extensively tested and highly reliable",
    "severity": "high"
  }
]

Example 3 (Compliant Text):
Input: "Inkloom AI empowers enterprise creators with high-confidence governance and Velocity with Precision."
Output: []
"""


def _deterministic_rule_engine(
    text: str,
    relevant_docs: Optional[List[Tuple[VectorDocument, float]]] = None
) -> List[TextCheckResult]:
    """
    Deterministic rule engine for offline evaluation or fallback when Gemini is offline.
    Evaluates dynamic rules from retrieved Golden Facts plus core brand invariants.
    """
    results: List[TextCheckResult] = []
    text_lower = text.lower()
    flagged_spans: List[Tuple[int, int]] = []

    def _is_overlapping(start: int, end: int) -> bool:
        return any(s <= start < e or s < end <= e for s, e in flagged_spans)

    # 1. Evaluate key_rules defined in retrieved Golden Facts
    if relevant_docs:
        for doc, _ in relevant_docs:
            for rule in doc.key_rules:
                pattern_str = rule.get("pattern")
                if not pattern_str:
                    continue
                try:
                    pattern = re.compile(pattern_str, re.IGNORECASE)
                    for match in pattern.finditer(text):
                        start, end = match.span()
                        if _is_overlapping(start, end):
                            continue
                        flagged_spans.append((start, end))
                        results.append(
                            TextCheckResult(
                                claim=match.group(0),
                                issue=rule.get("issue", "Brand compliance policy violation."),
                                citation=doc.citation,
                                suggested_rewrite=rule.get("rewrite", ""),
                                severity=rule.get("severity", "warning")
                            )
                        )
                except re.error as e:
                    logger.debug("Regex compilation error in rule %s: %s", pattern_str, e)

    # 2. Universal Rule: Outdated $29 Pricing
    outdated_pricing = re.compile(r"(\$29(\/mo|\/month)?|29\s?dollars?)", re.IGNORECASE)
    if match := outdated_pricing.search(text):
        start, end = match.span()
        if not _is_overlapping(start, end):
            flagged_spans.append((start, end))
            results.append(
                TextCheckResult(
                    claim=match.group(0),
                    issue="Outdated pricing claim. Starter tier was updated from legacy $29/mo to $49/mo in Q3.",
                    citation="Golden Facts: Pricing Matrix v2.4 (Effective 2026), Section 1",
                    suggested_rewrite="$49/month (or $39/mo billed annually)",
                    severity="high"
                )
            )

    # 3. Universal Rule: Non-existent $19 Pricing
    tier_19 = re.compile(r"(\$19(\/mo|\/month)?|19\s?dollars?)", re.IGNORECASE)
    if match := tier_19.search(text):
        start, end = match.span()
        if not _is_overlapping(start, end):
            flagged_spans.append((start, end))
            results.append(
                TextCheckResult(
                    claim=match.group(0),
                    issue="Non-existent pricing plan cited. Community edition is Free, Starter is $49/mo.",
                    citation="Golden Facts: Pricing Matrix v2.4 (Effective 2026), Section 1",
                    suggested_rewrite="free Community tier or $49/mo Starter tier",
                    severity="high"
                )
            )

    # 4. Universal Rule: Banned Terminology & Superlatives
    banned_words = [
        ("magic ai", "high-confidence AI assistance", "Banned term 'magic AI'. Inkloom relies on deterministic rules and explainable LLMs.", "warning"),
        ("cheapest", "most cost-effective enterprise solution", "Disallowed superlative 'cheapest'. Violates brand voice standards.", "warning"),
        ("flawless", "rigorous and consistent", "Disallowed claim 'flawless'. Avoid absolute quality guarantees.", "warning"),
        ("100% bug free", "extensively tested and highly reliable", "Disallowed compliance guarantee '100% bug free'.", "high"),
        ("zero risk", "comprehensive risk mitigation", "Disallowed absolute 'zero risk'. Avoid absolute risk-free guarantees.", "warning")
    ]
    for banned, rewrite, reason, severity in banned_words:
        if banned in text_lower:
            start = text_lower.find(banned)
            end = start + len(banned)
            if not _is_overlapping(start, end):
                flagged_spans.append((start, end))
                original_claim = text[start:end]
                results.append(
                    TextCheckResult(
                        claim=original_claim,
                        issue=reason,
                        citation="Brand Style Guide: Banned Terminology & Risk Policy 2026, Section 3",
                        suggested_rewrite=rewrite,
                        severity=severity
                    )
                )

    # 5. Universal Rule: Slogan Verification
    if "velocity without" in text_lower and "precision" not in text_lower:
        start = text_lower.find("velocity without")
        end = start + len("velocity without")
        if not _is_overlapping(start, end):
            flagged_spans.append((start, end))
            results.append(
                TextCheckResult(
                    claim=text[start:end],
                    issue="Distorted brand slogan. Approved tagline is 'Velocity with Precision'.",
                    citation="Brand Style Guide: Official Taglines v2.4, Section 2",
                    suggested_rewrite="Velocity with Precision",
                    severity="info"
                )
            )

    return results


def retrieve_relevant_facts(query: str, top_k: int = 3) -> List[Tuple[VectorDocument, float]]:
    """Retrieves top-k relevant Golden Facts from the configured Vector Store."""
    vector_store = get_vector_store()
    return vector_store.search(query, top_k=top_k)


def get_all_golden_facts() -> List[VectorDocument]:
    """Retrieves all indexed Golden Facts."""
    vector_store = get_vector_store()
    return vector_store.get_all_documents()


async def evaluate_text_compliance(text: Optional[str]) -> List[TextCheckResult]:
    """
    Evaluates draft text using semantic vector RAG retrieval and Gemini LLM.
    Falls back gracefully to the deterministic rule engine if API key is not configured or offline.
    """
    if not text or not text.strip():
        return []

    settings = get_settings()

    # Step 1: Semantic Vector Retrieval (RAG)
    try:
        relevant_docs = retrieve_relevant_facts(text, top_k=settings.rag_top_k)
    except Exception as e:
        logger.warning("Vector retrieval encountered an issue: %s", e)
        relevant_docs = []

    # Step 2: Attempt Gemini LLM Evaluation if API key is valid
    if settings.gemini_api_key and settings.gemini_api_key != "your_gemini_api_key_here":
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.gemini_api_key)

            # Format retrieved Golden Facts context
            if relevant_docs:
                facts_context = "\n\n".join([
                    f"[{doc.id}] {doc.title}\nCitation: {doc.citation}\n{doc.content}"
                    for doc, _ in relevant_docs
                ])
            else:
                facts_context = GOLDEN_FACTS_KB

            user_prompt = f"""
RETRIEVED GOLDEN FACTS:
{facts_context}

DRAFT TEXT TO AUDIT:
\"\"\"{text}\"\"\"

Audit the draft text strictly against the retrieved Golden Facts.
Respond ONLY with a JSON array conforming to this schema:
[
  {{
    "claim": "<exact substring flagged from draft text>",
    "issue": "<concise explanation of policy or factual discrepancy>",
    "citation": "<exact reference citation from retrieved Golden Facts>",
    "suggested_rewrite": "<prescriptive on-brand replacement>",
    "severity": "high" | "warning" | "info"
  }}
]
If there are no violations, respond with [].
"""
            response = client.models.generate_content(
                model=settings.gemini_model_text,
                contents=[
                    FEW_SHOT_SYSTEM_PROMPT,
                    user_prompt
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )

            if response.text:
                parsed = json.loads(response.text)
                if isinstance(parsed, list):
                    return [TextCheckResult(**item) for item in parsed]

        except Exception as e:
            logger.warning("Gemini API call failed (%s), falling back to deterministic RAG engine.", e)

    # Step 3: Deterministic Rule Engine fallback
    return _deterministic_rule_engine(text, relevant_docs)
