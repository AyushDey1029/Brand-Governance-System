"""Inkloom AI - Standalone Batch Marketing Assets Auditor CLI.

Recursively scans a directory of campaign images, audits each asset against
the brand Golden Assets palette and logo guidelines, and exports an interactive HTML report.

Usage:
    python batch_audit.py --dir ./marketing_assets --brand "#4F46E5" --output audit_report.html
"""
import argparse
import base64
import os
import sys
from datetime import datetime
from typing import Dict, List, Optional
import cv2
import numpy as np

try:
    from ciede2000 import (
        delta_e_cie2000,
        hex_to_rgb,
        rgb_to_hex,
        rgb_to_lab,
        hex_to_lab,
        calculate_color_distance,
    )
    from color_extractor import extract_palette, verify_brand_color
    from logo_detector import verify_logo_compliance
    from asset_parser import parse_assets_from_csv, BrandAssetProfile
except ImportError:
    from .ciede2000 import (
        delta_e_cie2000,
        hex_to_rgb,
        rgb_to_hex,
        rgb_to_lab,
        hex_to_lab,
        calculate_color_distance,
    )
    from .color_extractor import extract_palette, verify_brand_color
    from .logo_detector import verify_logo_compliance
    from .asset_parser import parse_assets_from_csv, BrandAssetProfile


SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}


def audit_single_asset(
    image_path: str,
    brand_profile: BrandAssetProfile,
    check_logo: bool = True
) -> Dict[str, any]:
    """Runs dominant color, CIEDE2000 delta, and logo checks on a single local image."""
    filename = os.path.basename(image_path)
    primary_hex = brand_profile.primary_color.hex_code
    tolerance = brand_profile.primary_color.tolerance_de00
    sec_palettes = [c.hex_code for c in brand_profile.palettes]

    color_res = verify_brand_color(
        image_path,
        brand_hex=primary_hex,
        tolerance_de00=tolerance,
        secondary_palette=sec_palettes
    )

    logo_res = None
    if check_logo and brand_profile.logos:
        for logo_spec in brand_profile.logos:
            if logo_spec.template_path and os.path.isfile(logo_spec.template_path):
                logo_res = verify_logo_compliance(
                    image_path,
                    logo_spec.template_path,
                    min_height=logo_spec.min_height_px,
                    clear_space_ratio=logo_spec.clear_space_ratio
                ).to_dict()
                break

    # Read base64 thumbnail for self-contained HTML report
    thumb_b64 = ""
    try:
        img = cv2.imread(image_path)
        if img is not None:
            h, w = img.shape[:2]
            max_thumb = 200
            scale = max_thumb / float(max(h, w))
            resized = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
            _, buf = cv2.imencode(".png", resized)
            thumb_b64 = f"data:image/png;base64,{base64.b64encode(buf.tobytes()).decode('utf-8')}"
    except Exception:
        thumb_b64 = ""

    return {
        "filename": filename,
        "path": image_path,
        "thumbnail": thumb_b64,
        "color_check": color_res,
        "logo_check": logo_res,
        "status": color_res["status"],
        "dominant_hex": color_res["dominant_hex"],
        "distance_de00": color_res["color_distance_de00"],
        "message": color_res["message"]
    }


def generate_html_report(
    results: List[Dict[str, any]],
    brand_profile: BrandAssetProfile,
    output_html_path: str
):
    """Generates a self-contained, modern dark-mode HTML audit report."""
    total = len(results)
    compliant = sum(1 for r in results if r["status"] == "compliant")
    warnings = sum(1 for r in results if r["status"] == "warning")
    violations = sum(1 for r in results if r["status"] == "violation")
    avg_de = round(sum(r["distance_de00"] for r in results) / total, 2) if total > 0 else 0.0

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cards_html = []
    for r in results:
        status = r["status"]
        status_color = "#10B981" if status == "compliant" else ("#F59E0B" if status == "warning" else "#EF4444")
        bg_badge = "rgba(16, 185, 129, 0.15)" if status == "compliant" else ("rgba(245, 158, 11, 0.15)" if status == "warning" else "rgba(239, 68, 68, 0.15)")
        
        palette_swatches = []
        for p in r["color_check"].get("palette", [])[:4]:
            palette_swatches.append(
                f'<div style="display:inline-block; margin-right:8px; text-align:center;">'
                f'<div style="width:28px; height:28px; border-radius:6px; background:{p["hex"]}; border:1px solid rgba(255,255,255,0.2);"></div>'
                f'<span style="font-size:10px; color:#94A3B8;">{p["coverage"]}%</span>'
                f'</div>'
            )
        swatches_markup = "".join(palette_swatches)

        thumb_markup = f'<img src="{r["thumbnail"]}" style="max-width:140px; max-height:100px; border-radius:8px; object-fit:contain; background:#0F172A;" />' if r["thumbnail"] else '<div style="width:100px; height:80px; background:#1E293B; border-radius:8px;"></div>'

        cards_html.append(f"""
        <div style="background:#1E293B; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px; margin-bottom:16px; display:flex; gap:20px; align-items:center;">
            <div>{thumb_markup}</div>
            <div style="flex:1;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <h3 style="margin:0; font-size:16px; font-weight:600; color:#F8FAFC;">{r["filename"]}</h3>
                    <span style="font-size:12px; font-weight:600; text-transform:uppercase; padding:3px 10px; border-radius:20px; background:{bg_badge}; color:{status_color}; border:1px solid {status_color};">{status}</span>
                </div>
                <p style="margin:4px 0 10px 0; font-size:13px; color:#94A3B8;">{r["message"]}</p>
                <div style="display:flex; align-items:center; gap:20px; font-size:12px;">
                    <div><span style="color:#64748B;">Dominant:</span> <strong style="color:#F8FAFC;">{r["dominant_hex"]}</strong></div>
                    <div><span style="color:#64748B;">CIEDE2000 &Delta;E:</span> <strong style="color:{status_color};">{r["distance_de00"]}</strong></div>
                    <div style="display:flex; align-items:center;">{swatches_markup}</div>
                </div>
            </div>
        </div>
        """)

    cards_markup = "\n".join(cards_html)

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Inkloom AI - Creative Brand Assets Audit Report</title>
    <style>
        body {{
            background-color: #0F172A;
            color: #F8FAFC;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 30px;
        }}
        .container {{
            max-width: 960px;
            margin: 0 auto;
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 30px;
        }}
        .stat-card {{
            background: #1E293B;
            border-radius: 12px;
            padding: 18px;
            border: 1px solid rgba(255,255,255,0.06);
            text-align: center;
        }}
        .stat-num {{
            font-size: 28px;
            font-weight: 700;
            margin-top: 4px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1 style="margin:0; font-size:24px; color:#F8FAFC;">Inkloom AI ?" Visual Brand Assets Audit</h1>
                <p style="margin:4px 0 0 0; color:#64748B; font-size:13px;">Generated on {timestamp} &bull; Target Brand: {brand_profile.primary_color.name} ({brand_profile.primary_color.hex_code})</p>
            </div>
            <div style="text-align:right;">
                <span style="background:rgba(79, 70, 229, 0.2); color:#818CF8; border:1px solid #4F46E5; padding:6px 14px; border-radius:20px; font-size:12px; font-weight:600;">CIEDE2000 Certified</span>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div style="font-size:12px; color:#94A3B8; text-transform:uppercase;">Total Assets</div>
                <div class="stat-num" style="color:#F8FAFC;">{total}</div>
            </div>
            <div class="stat-card">
                <div style="font-size:12px; color:#94A3B8; text-transform:uppercase;">Compliant</div>
                <div class="stat-num" style="color:#10B981;">{compliant}</div>
            </div>
            <div class="stat-card">
                <div style="font-size:12px; color:#94A3B8; text-transform:uppercase;">Warnings</div>
                <div class="stat-num" style="color:#F59E0B;">{warnings}</div>
            </div>
            <div class="stat-card">
                <div style="font-size:12px; color:#94A3B8; text-transform:uppercase;">Violations</div>
                <div class="stat-num" style="color:#EF4444;">{violations}</div>
            </div>
        </div>

        <h2 style="font-size:18px; font-weight:600; margin-bottom:16px;">Audited Assets ({total})</h2>
        {cards_markup}
    </div>
</body>
</html>
"""
    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(html_content)


def main():
    parser = argparse.ArgumentParser(description="Inkloom AI Batch Asset Auditor")
    parser.add_argument("--dir", required=True, help="Path to directory containing images")
    parser.add_argument("--assets-csv", default=None, help="Path to golden_assets.csv")
    parser.add_argument("--output", default="audit_report.html", help="Output HTML report path")
    parser.add_argument("--brand", default="#4F46E5", help="Primary brand hex code override")

    args = parser.parse_args()

    if not os.path.isdir(args.dir):
        print(f"Error: Directory not found: {args.dir}", file=sys.stderr)
        sys.exit(1)

    # Load brand assets
    csv_path = args.assets_csv or os.path.join(os.path.dirname(__file__), "golden_assets.csv")
    if os.path.isfile(csv_path):
        profile = parse_assets_from_csv(csv_path)
    else:
        profile = BrandAssetProfile()
        profile.primary_color.hex_code = args.brand

    # Collect image files
    image_paths = []
    for root, _, files in os.walk(args.dir):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in SUPPORTED_EXTENSIONS:
                image_paths.append(os.path.join(root, f))

    if not image_paths:
        print(f"No supported images found in {args.dir}")
        sys.exit(0)

    print(f"Auditing {len(image_paths)} images against {profile.brand_name} ({profile.primary_color.hex_code})...")
    results = []
    for img_path in image_paths:
        print(f" -> Auditing {os.path.basename(img_path)}...")
        res = audit_single_asset(img_path, profile)
        results.append(res)

    generate_html_report(results, profile, args.output)
    print(f"\n[DONE] Audit complete! Interactive HTML report saved to: {args.output}")


if __name__ == "__main__":
    main()
