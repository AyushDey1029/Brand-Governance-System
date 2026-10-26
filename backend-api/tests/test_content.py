"""Automated tests for FastAPI endpoints and compliance services."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.vision_check import rgb_to_hex, hex_to_rgb, color_distance_rgb

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Inkloom" in data["app"]


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "Inkloom" in response.text or "Inkloom" in response.json().get("message", "")


def test_api_status_endpoint():
    response = client.get("/api-status")
    assert response.status_code == 200
    assert "Inkloom AI" in response.json()["message"]


def test_content_check_outdated_pricing():
    payload = {
        "text": "Try Inkloom AI today with our $29/mo starter tier for unlimited growth.",
        "image_urls": [],
        "channel": "blog"
    }
    response = client.post("/api/check-content", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] in ("flagged", "warning")
    assert data["total_text_issues"] >= 1
    # Check that $29 was flagged with $49 rewrite
    found_issue = any("$29" in item["claim"] for item in data["text_evaluations"])
    assert found_issue, "Expected $29 outdated pricing to be flagged"
    assert "$49" in data["text_evaluations"][0]["suggested_rewrite"]


def test_content_check_compliant_text():
    payload = {
        "text": "Inkloom AI empowers enterprise creators with high-confidence governance and Velocity with Precision.",
        "image_urls": [],
        "channel": "blog"
    }
    response = client.post("/api/check-content", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "compliant"
    assert data["compliance_score"] == 100
    assert data["total_text_issues"] == 0


def test_vision_color_math():
    rgb = hex_to_rgb("#4F46E5")
    assert rgb == (79, 70, 229)
    assert rgb_to_hex(79, 70, 229).upper() == "#4F46E5"
    
    # Distance between same color is 0
    assert color_distance_rgb(rgb, rgb) == 0.0
    
    # Black to white is sqrt(3 * 255^2) approx 441.67
    dist_bw = color_distance_rgb((0, 0, 0), (255, 255, 255))
    assert 441.0 < dist_bw < 442.0
