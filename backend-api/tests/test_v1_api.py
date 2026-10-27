"""
Automated Integration Tests for Inkloom AI API v1 Endpoints & Database Persistence
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_v1_auth_login_and_me():
    # Login as Brand Owner
    res = client.post("/api/v1/auth/login", json={
        "email": "demo.owner@inkloom.io",
        "password": "Password123!"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo.owner@inkloom.io"
    assert any(m["role"] == "OWNER" for m in data["user"]["memberships"])

    token = data["access_token"]
    # Get Profile
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "demo.owner@inkloom.io"


def test_v1_auth_creator_login():
    res = client.post("/api/v1/auth/login", json={
        "email": "demo.creator@inkloom.io",
        "password": "Password123!"
    })
    assert res.status_code == 200
    data = res.json()
    assert any(m["role"] == "CONTENT_CREATOR" for m in data["user"]["memberships"])


def test_v1_brands_endpoints():
    res = client.get("/api/v1/brands")
    assert res.status_code == 200
    brands = res.json()
    assert len(brands) >= 3
    nexus = next((b for b in brands if b["id"] == "brand-nexus"), None)
    assert nexus is not None

    # Get single brand
    brand_res = client.get("/api/v1/brands/brand-nexus")
    assert brand_res.status_code == 200
    b_data = brand_res.json()
    assert b_data["name"] == "Nexus Cloud"
    assert "review_thresholds" in b_data
    assert "preferred_terminology" in b_data
    assert "prohibited_terminology" in b_data

    # Members
    members_res = client.get("/api/v1/brands/brand-nexus/members")
    assert members_res.status_code == 200
    assert len(members_res.json()) >= 1


def test_v1_golden_facts_lifecycle():
    # List facts
    list_res = client.get("/api/v1/brands/brand-nexus/facts")
    assert list_res.status_code == 200
    facts = list_res.json()
    assert len(facts) >= 4

    # Create new fact
    new_fact = {
        "title": "Quantum Compute SLA",
        "category": "SLA & Performance",
        "claim_statement": "Quantum instance availability is 99.95% under Section 7.1.",
        "value": "99.95",
        "unit": "%",
        "source_document": "Quantum Addendum 2026",
        "effective_date": "2026-01-01",
        "expiry_date": "2026-12-31",
        "approval_status": "APPROVED"
    }
    create_res = client.post("/api/v1/brands/brand-nexus/facts", json=new_fact)
    assert create_res.status_code == 200
    created = create_res.json()
    fact_id = created["id"]
    assert created["title"] == "Quantum Compute SLA"

    # Mark outdated
    outdated_res = client.post(f"/api/v1/brands/brand-nexus/facts/{fact_id}/mark-outdated")
    assert outdated_res.status_code == 200
    assert outdated_res.json()["approval_status"] == "OUTDATED"

    # Delete fact
    del_res = client.delete(f"/api/v1/brands/brand-nexus/facts/{fact_id}")
    assert del_res.status_code == 200


def test_v1_brand_rules_lifecycle():
    # List rules
    rules_res = client.get("/api/v1/brands/brand-nexus/rules")
    assert rules_res.status_code == 200
    rules = rules_res.json()
    assert len(rules) >= 4

    # Create rule as draft
    draft_rule = {
        "rule_type": "PROHIBITED_CLAIM",
        "name": "No AI Magic Claims",
        "description": "Never describe our system as magic",
        "pattern_or_instruction": "magic AI|miracle",
        "severity": "CRITICAL",
        "enforcement_mode": "BLOCK",
        "explanation": "Describing systems as magic causes regulatory skepticism.",
        "channels": ["all"],
        "save_as_draft": True
    }
    create_res = client.post("/api/v1/brands/brand-nexus/rules", json=draft_rule)
    assert create_res.status_code == 200
    rule = create_res.json()
    rule_id = rule["id"]

    # Publish draft
    pub_res = client.post(f"/api/v1/brands/brand-nexus/rules/{rule_id}/publish")
    assert pub_res.status_code == 200

    # Rule history
    hist_res = client.get(f"/api/v1/brands/brand-nexus/rules/{rule_id}/history")
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1


def test_v1_audit_text_engine():
    # Audit text with violation
    payload = {
        "draft_text": "Nexus Cloud delivers guaranteed 100% uptime with our unbeatable 30% discount this quarter. It is the cheapest cloud infrastructure available anywhere!",
        "channel": "linkedin"
    }
    audit_res = client.post("/api/v1/brands/brand-nexus/audit/text", json=payload)
    assert audit_res.status_code == 200
    data = audit_res.json()
    assert data["status"] in ("NEEDS_REVIEW", "WARNINGS_RESOLVABLE")
    assert data["overall_score"] < 70
    assert len(data["findings"]) >= 2
    
    # Check that findings include explanations, citations, and suggested fixes
    uptime_finding = next((f for f in data["findings"] if "100%" in f["original_snippet"]), None)
    assert uptime_finding is not None
    assert "99.99%" in uptime_finding["suggested_fix"]
    assert "SLA" in uptime_finding["citation_reference"]


def test_v1_review_queue_escalation_and_action():
    # 1. First audit text
    audit_res = client.post("/api/v1/brands/brand-nexus/audit/text", json={
        "draft_text": "Special 30% discount available this week only!",
        "channel": "linkedin"
    })
    audit_id = audit_res.json()["audit_id"]

    # 2. Escalate to Review Queue
    esc_res = client.post(f"/api/v1/brands/brand-nexus/audit/{audit_id}/escalate", json={
        "creator_notes": "Urgent promotional exception requested for summit"
    })
    assert esc_res.status_code == 200
    esc_data = esc_res.json()
    review_id = esc_data["review_id"]
    assert esc_data["status"] == "AWAITING_REVIEW"

    # 3. List Reviews
    reviews_res = client.get("/api/v1/brands/brand-nexus/reviews?status_filter=AWAITING_REVIEW")
    assert reviews_res.status_code == 200
    reviews = reviews_res.json()
    assert any(r["id"] == review_id for r in reviews)

    # 4. Review Action (Approve with condition)
    action_res = client.post(f"/api/v1/brands/brand-nexus/reviews/{review_id}/action", json={
        "action": "APPROVE",
        "comments": "Approved for 48 hours summit promotion."
    })
    assert action_res.status_code == 200
    assert action_res.json()["status"] == "APPROVED"


def test_v1_analytics_and_audit_events():
    analytics_res = client.get("/api/v1/brands/brand-nexus/analytics")
    assert analytics_res.status_code == 200
    data = analytics_res.json()
    assert "first_time_pass_rate" in data
    assert "violation_categories" in data
    assert "severity_distribution" in data
    assert "channel_performance" in data

    events_res = client.get("/api/v1/brands/brand-nexus/audit-events")
    assert events_res.status_code == 200
    events = events_res.json()
    assert len(events) >= 1
