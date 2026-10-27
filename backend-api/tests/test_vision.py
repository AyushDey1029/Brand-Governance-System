"""Comprehensive unit tests for Inkloom AI Vision Engine and color algorithms."""
import base64
import cv2
import numpy as np
import pytest

from app.services.vision_check import (
    hex_to_rgb,
    rgb_to_hex,
    rgb_to_lab,
    hex_to_lab,
    delta_e_cie2000,
    color_distance_rgb,
    color_distance_ciede2000,
    extract_dominant_color_from_bytes,
    evaluate_single_image,
    eval_visual_compliance,
    evaluate_images_compliance
)
from app.services.asset_parser import parse_assets_from_csv, BrandAssetProfile
from app.models.schemas import VisionCheckResult


def create_test_image_bytes(color_rgb=(79, 70, 229), width=100, height=100, has_alpha=False) -> bytes:
    """Helper to generate encoded image bytes with given color."""
    if has_alpha:
        img = np.zeros((height, width, 4), dtype=np.uint8)
        img[:, :] = (color_rgb[2], color_rgb[1], color_rgb[0], 255)  # BGR + Alpha
    else:
        img = np.zeros((height, width, 3), dtype=np.uint8)
        img[:, :] = (color_rgb[2], color_rgb[1], color_rgb[0])  # BGR
    
    success, buffer = cv2.imencode(".png", img)
    assert success
    return buffer.tobytes()


def test_color_conversions():
    """Verify bidirectional color conversions."""
    r, g, b = hex_to_rgb("#4F46E5")
    assert (r, g, b) == (79, 70, 229)
    assert rgb_to_hex(r, g, b).upper() == "#4F46E5"

    # Hex with 3 characters
    assert hex_to_rgb("#FFF") == (255, 255, 255)
    assert hex_to_rgb("000") == (0, 0, 0)


def test_ciede2000_accuracy():
    """Test standard perceptual color difference properties."""
    lab_base = hex_to_lab("#4F46E5")
    
    # Distance to itself is 0
    assert delta_e_cie2000(lab_base, lab_base) == 0.0
    
    # Subtle shift: #5048E6 should be perceptually imperceptible (Delta E < 1.0)
    lab_subtle = hex_to_lab("#5048E6")
    dist_subtle = delta_e_cie2000(lab_base, lab_subtle)
    assert 0.0 < dist_subtle < 1.0

    # Off-brand color: #E54F46 (Coral Red) should be a massive violation (Delta E > 30.0)
    lab_off = hex_to_lab("#E54F46")
    dist_off = delta_e_cie2000(lab_base, lab_off)
    assert dist_off > 30.0


def test_extract_dominant_color_transparent_png():
    """Test that alpha transparent pixels are excluded from dominant color detection."""
    # Create image with transparent background and an Indigo square
    img = np.zeros((100, 100, 4), dtype=np.uint8)  # fully transparent
    img[20:80, 20:80] = (229, 70, 79, 255)         # Indigo square (BGR+A)

    _, buffer = cv2.imencode(".png", img)
    dom_hex, dom_rgb = extract_dominant_color_from_bytes(buffer.tobytes())
    assert dom_hex.upper() == "#4F46E5"
    assert dom_rgb == (79, 70, 229)


@pytest.mark.anyio
async def test_evaluate_single_image_base64():
    """Test in-memory image evaluation via data URI."""
    # Test compliant image
    bytes_indigo = create_test_image_bytes((79, 70, 229))
    b64_indigo = "data:image/png;base64," + base64.b64encode(bytes_indigo).decode("utf-8")

    res_comp = await evaluate_single_image(b64_indigo, target_brand_hex="#4F46E5", tolerance=3.5)
    assert isinstance(res_comp, VisionCheckResult)
    assert res_comp.match is True
    assert res_comp.status == "compliant"
    assert res_comp.color_distance <= 3.5

    # Test violation image (red)
    bytes_red = create_test_image_bytes((229, 50, 50))
    b64_red = "data:image/png;base64," + base64.b64encode(bytes_red).decode("utf-8")

    res_viol = await evaluate_single_image(b64_red, target_brand_hex="#4F46E5", tolerance=3.5)
    assert res_viol.match is False
    assert res_viol.status == "violation"
    assert res_viol.color_distance > 10.0


@pytest.mark.anyio
async def test_eval_visual_compliance_contract():
    """Verify that eval_visual_compliance satisfies the exact contract from AGENTS.md."""
    bytes_indigo = create_test_image_bytes((79, 70, 229))
    b64_indigo = "data:image/png;base64," + base64.b64encode(bytes_indigo).decode("utf-8")

    results = await eval_visual_compliance(
        image_urls=[b64_indigo],
        target_brand_hex="#4F46E5",
        tolerance=3.5
    )
    assert len(results) == 1
    r = results[0]
    assert r.image_url == b64_indigo
    assert r.dominant_hex.upper() == "#4F46E5"
    assert r.target_brand_hex == "#4F46E5"
    assert r.match is True
    assert r.status == "compliant"


def test_asset_parser(tmp_path):
    """Verify parsing brand asset specifications."""
    csv_file = tmp_path / "test_assets.csv"
    csv_content = """asset_type,asset_id,name,hex_code,role,tolerance_de00
color,primary_test,Test Primary,#4F46E5,primary,3.5
color,secondary_test,Test Secondary,#06B6D4,secondary,4.0
logo,main_logo,Test Logo,,,24
"""
    csv_file.write_text(csv_content, encoding="utf-8")
    profile = parse_assets_from_csv(str(csv_file))
    assert isinstance(profile, BrandAssetProfile)
    assert profile.primary_color.hex_code.upper() == "#4F46E5"
    assert len(profile.palettes) == 1
    assert profile.palettes[0].hex_code.upper() == "#06B6D4"
    assert len(profile.logos) == 1

from fastapi.testclient import TestClient
from app.main import app

api_client = TestClient(app)


def test_brand_assets_endpoint():
    """Verify /api/brand-assets returns the configured brand guidelines."""
    res = api_client.get("/api/brand-assets")
    assert res.status_code == 200
    data = res.json()
    assert "brand_name" in data
    assert data["primary_color"]["hex_code"].upper() == "#4F46E5"


def test_extract_palette_endpoint():
    """Verify /api/extract-palette endpoint extracts color clusters."""
    bytes_img = create_test_image_bytes((79, 70, 229))
    b64_img = "data:image/png;base64," + base64.b64encode(bytes_img).decode("utf-8")
    
    res = api_client.post("/api/extract-palette", json={"image_url": b64_img, "k": 3})
    assert res.status_code == 200
    data = res.json()
    assert data["dominant_hex"].upper() == "#4F46E5"
    assert len(data["palette"]) >= 1
    assert data["palette"][0]["hex"].upper() == "#4F46E5"


def test_check_logo_endpoint():
    """Verify /api/check-logo endpoint detects logo and checks clear space."""
    # Create canvas with canonical Inkloom circle logo
    canvas = np.full((300, 300, 3), 255, dtype=np.uint8)
    cv2.circle(canvas, (100, 100), 24, (229, 70, 79), -1)  # #4F46E5 BGR
    cv2.circle(canvas, (100, 100), 14, (255, 255, 255), -1)
    cv2.circle(canvas, (100, 100), 7, (212, 182, 6), -1)   # #06B6D4 BGR

    _, buffer = cv2.imencode(".png", canvas)
    b64_canvas = "data:image/png;base64," + base64.b64encode(buffer.tobytes()).decode("utf-8")

    res = api_client.post("/api/check-logo", json={
        "image_url": b64_canvas,
        "detection_threshold": 0.55
    })
    assert res.status_code == 200
    data = res.json()
    assert data["detected"] is True
    assert data["aspect_ratio_ok"] is True
    assert data["clear_space_ok"] is True
    assert data["status"] == "compliant"
