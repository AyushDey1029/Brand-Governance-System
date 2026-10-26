"""Unit and integration tests for RAG Text Evaluation Pipeline & Vector Knowledge Base."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.vector_store import (
    InMemoryVectorStore,
    VectorDocument,
    load_golden_facts_dataset,
    get_vector_store
)
from app.services.text_rag import (
    evaluate_text_compliance,
    retrieve_relevant_facts,
    get_all_golden_facts
)

client = TestClient(app)


def test_golden_facts_dataset_loading():
    """Verify that the enterprise Golden Facts dataset is properly loaded and formatted."""
    docs = load_golden_facts_dataset()
    assert len(docs) >= 5, "Expected at least 5 enterprise Golden Fact documents"
    
    categories = {doc.category for doc in docs}
    assert "pricing_matrix" in categories
    assert "brand_voice_and_tone" in categories
    assert "taglines_and_slogans" in categories
    assert "security_and_privacy" in categories
    assert "product_capabilities" in categories

    for doc in docs:
        assert doc.id.startswith("GF-")
        assert doc.citation
        assert doc.content
        assert doc.title


def test_vector_store_indexing_and_search():
    """Test indexing custom documents and retrieving via cosine similarity."""
    store = InMemoryVectorStore()
    docs = [
        VectorDocument(
            id="DOC-1",
            category="pricing",
            title="Enterprise Pricing",
            citation="Pricing Doc 2026",
            content="Our enterprise plan starts at $499/mo with SOC2 certification."
        ),
        VectorDocument(
            id="DOC-2",
            category="branding",
            title="Brand Colors",
            citation="Brand Doc 2026",
            content="Inkloom Indigo hex code is #4F46E5 and Cyan is #06B6D4."
        )
    ]
    store.add_documents(docs)
    assert len(store.get_all_documents()) == 2

    # Query matching DOC-1
    res1 = store.search("how much does enterprise plan cost?", top_k=1)
    assert len(res1) == 1
    assert res1[0][0].id == "DOC-1"
    assert res1[0][1] > 0.0

    # Query matching DOC-2
    res2 = store.search("indigo and cyan hex palette", top_k=1)
    assert len(res2) == 1
    assert res2[0][0].id == "DOC-2"
    assert res2[0][1] > 0.0


def test_vector_search_pricing_query():
    """Verify semantic retrieval ranks pricing facts highest for pricing-related query."""
    results = retrieve_relevant_facts("We offer starter tier for $29 per month", top_k=2)
    assert len(results) >= 1
    top_doc, score = results[0]
    assert top_doc.id == "GF-PRICE-001"
    assert score > 0.0


def test_vector_search_tone_query():
    """Verify semantic retrieval ranks tone facts highest for superlative queries."""
    results = retrieve_relevant_facts("magic AI that makes everything flawless", top_k=2)
    assert len(results) >= 1
    top_doc, score = results[0]
    assert top_doc.id == "GF-TONE-001"
    assert score > 0.0


def test_vector_search_slogan_query():
    """Verify semantic retrieval identifies brand slogan documents."""
    results = retrieve_relevant_facts("Velocity with Precision", top_k=2)
    assert len(results) >= 1
    matching_ids = [doc.id for doc, _ in results]
    assert "GF-SLOGAN-001" in matching_ids


@pytest.mark.asyncio
async def test_evaluate_text_compliance_pricing_drift():
    """Verify outdated pricing ($29) is flagged with high severity and prescriptive rewrite."""
    draft = "Get started with our lightweight starter edition for $29/mo today."
    results = await evaluate_text_compliance(draft)
    assert len(results) >= 1
    
    pricing_issues = [r for r in results if "$29" in r.claim]
    assert len(pricing_issues) == 1
    issue = pricing_issues[0]
    assert issue.severity == "high"
    assert "$49" in issue.suggested_rewrite
    assert "Pricing Matrix" in issue.citation


@pytest.mark.asyncio
async def test_evaluate_text_compliance_banned_superlatives():
    """Verify banned superlatives ('magic AI', '100% bug free') are flagged."""
    draft = "Experience the power of magic AI with our 100% bug free governance engine."
    results = await evaluate_text_compliance(draft)
    assert len(results) >= 2

    claims = {r.claim.lower(): r for r in results}
    assert any("magic ai" in c for c in claims)
    assert any("100% bug free" in c for c in claims)

    bug_free_issue = next(r for c, r in claims.items() if "100% bug free" in c)
    assert bug_free_issue.severity == "high"
    assert "reliab" in bug_free_issue.suggested_rewrite.lower()


@pytest.mark.asyncio
async def test_evaluate_text_compliance_slogan_distortion():
    """Verify distorted slogans are flagged with 'Velocity with Precision'."""
    draft = "Our platform offers velocity without precision for fast publishing."
    results = await evaluate_text_compliance(draft)
    assert len(results) >= 1

    slogan_issue = results[0]
    assert "Velocity with Precision" in slogan_issue.suggested_rewrite


@pytest.mark.asyncio
async def test_evaluate_text_compliance_compliant_text():
    """Verify compliant text produces zero violations."""
    draft = "Inkloom AI empowers enterprise creators with high-confidence governance and Velocity with Precision."
    results = await evaluate_text_compliance(draft)
    assert len(results) == 0


def test_api_get_golden_facts():
    """Test GET /api/golden-facts returns all indexed documents."""
    response = client.get("/api/golden-facts")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 5
    assert len(data["categories"]) >= 4
    assert len(data["facts"]) == data["total"]


def test_api_get_golden_facts_filter_category():
    """Test filtering GET /api/golden-facts by category."""
    response = client.get("/api/golden-facts?category=pricing_matrix")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for fact in data["facts"]:
        assert fact["category"] == "pricing_matrix"


def test_api_search_golden_facts():
    """Test POST /api/golden-facts/search semantic vector endpoint."""
    payload = {
        "query": "outdated $29 starter subscription pricing",
        "top_k": 2
    }
    response = client.post("/api/golden-facts/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["results_count"] == 2
    assert "in_memory" in data["provider"]
    assert data["results"][0]["id"] == "GF-PRICE-001"
    assert data["results"][0]["similarity_score"] > 0.0
