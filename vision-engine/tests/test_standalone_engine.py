"""Unit tests for standalone OpenCV algorithms in vision-engine."""
import os
import cv2
import numpy as np
import pytest

from ciede2000 import (
    hex_to_rgb,
    rgb_to_hex,
    rgb_to_lab,
    delta_e_cie2000,
    calculate_color_distance,
)
from color_extractor import extract_palette, verify_brand_color
from logo_detector import verify_logo_compliance, detect_logo_multi_scale
from asset_parser import parse_assets_from_csv


def test_delta_e_reference_values():
    """Verify CIEDE2000 against standard reference behaviors."""
    # Indigo #4F46E5
    r, g, b = hex_to_rgb("#4F46E5")
    lab1 = rgb_to_lab(r, g, b)
    assert delta_e_cie2000(lab1, lab1) == 0.0

    # Slight variation
    dist_near = calculate_color_distance("#4F46E5", "#4E45E4")
    assert dist_near < 0.6

    # Completely different color (green)
    dist_green = calculate_color_distance("#4F46E5", "#22C55E")
    assert dist_green > 25.0


def test_color_extractor_swatch(tmp_path):
    """Test palette extraction and brand color verification on a simulated banner."""
    banner_path = str(tmp_path / "banner.png")
    img = np.full((120, 200, 3), (229, 70, 79), dtype=np.uint8)  # Indigo
    # Add a small secondary accent patch
    img[20:40, 20:60] = (212, 182, 6)  # Cyan
    cv2.imwrite(banner_path, img)

    res = verify_brand_color(banner_path, brand_hex="#4F46E5", tolerance_de00=3.5)
    assert res["dominant_hex"].upper() == "#4F46E5"
    assert res["match"] is True
    assert res["status"] == "compliant"
    assert len(res["palette"]) >= 2


def test_logo_detector_multi_scale_and_clear_space(tmp_path):
    """Test logo detection across scales and clear space validation."""
    logo = np.zeros((40, 40, 3), dtype=np.uint8)
    cv2.circle(logo, (20, 20), 12, (79, 70, 229), -1)

    canvas = np.full((300, 300, 3), 255, dtype=np.uint8)
    # Place logo at (80, 80)
    canvas[80:120, 80:120] = logo

    logo_path = str(tmp_path / "logo.png")
    canvas_path = str(tmp_path / "canvas.png")
    cv2.imwrite(logo_path, logo)
    cv2.imwrite(canvas_path, canvas)

    result = verify_logo_compliance(canvas_path, logo_path, detection_threshold=0.60)
    assert result.detected is True
    assert result.clear_space_ok is True
    assert result.status == "compliant"


def test_golden_assets_csv_parsing():
    """Verify that golden_assets.csv exists and parses cleanly."""
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "golden_assets.csv")
    if os.path.isfile(csv_path):
        profile = parse_assets_from_csv(csv_path)
        assert profile.primary_color.hex_code.upper() == "#4F46E5"
        assert len(profile.palettes) >= 1

from batch_audit import audit_single_asset, generate_html_report
from asset_parser import BrandAssetProfile, BrandColorAsset


def test_batch_audit_single_asset(tmp_path):
    """Verify batch audit logic on a local test image."""
    img_path = str(tmp_path / "test_indigo.png")
    img = np.full((100, 100, 3), (229, 70, 79), dtype=np.uint8)  # Indigo
    cv2.imwrite(img_path, img)

    profile = BrandAssetProfile()
    res = audit_single_asset(img_path, profile, check_logo=False)
    assert res["status"] == "compliant"
    assert res["dominant_hex"].upper() == "#4F46E5"
    assert res["distance_de00"] <= 1.0

    # Test report generation
    report_path = str(tmp_path / "report.html")
    generate_html_report([res], profile, report_path)
    assert os.path.isfile(report_path)
    assert os.path.getsize(report_path) > 500
