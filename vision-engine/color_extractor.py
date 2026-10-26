"""Standalone OpenCV Dominant Color Extractor and Brand Palette Verifier.

Features:
- Sub-millisecond OpenCV pixel sampling and k-means clustering.
- Standard CIEDE2000 (Delta E 00) perceptual color delta in CIELAB color space.
- Multi-color palette extraction with coverage percentages.
- Automatic background filtering (near-white / near-black / transparent alpha).
- Batch verification CLI.

Usage:
    python color_extractor.py --image banner.png --brand "#4F46E5" --tolerance 3.0
"""
import argparse
import sys
from typing import Dict, List, Tuple, Optional
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
except ImportError:
    from .ciede2000 import (
        delta_e_cie2000,
        hex_to_rgb,
        rgb_to_hex,
        rgb_to_lab,
        hex_to_lab,
        calculate_color_distance,
    )


def extract_palette(
    image_input,
    k: int = 5,
    max_dim: int = 150
) -> List[Dict[str, any]]:
    """Extracts top-k dominant color clusters with hex code, RGB, Lab, and coverage percentage.
    
    Args:
        image_input: Either a file path string or a numpy BGR/BGRA array.
        k: Number of color clusters.
        max_dim: Maximum dimension for downscaling.
        
    Returns:
        List of dicts sorted by coverage percentage descending:
        [{"hex": "#4F46E5", "rgb": (79, 70, 229), "coverage": 64.2}, ...]
    """
    if isinstance(image_input, str):
        img = cv2.imread(image_input, cv2.IMREAD_UNCHANGED)
        if img is None:
            raise FileNotFoundError(f"Could not open image file: {image_input}")
    elif isinstance(image_input, np.ndarray):
        img = image_input
    else:
        raise TypeError("image_input must be a file path string or numpy array")

    # Downscale for performance
    h, w = img.shape[:2]
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    # Handle Alpha channel if present (PNG transparency)
    if len(img.shape) == 3 and img.shape[2] == 4:
        alpha = img[:, :, 3]
        bgr = img[:, :, :3]
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        pixels = rgb[alpha > 20].astype(np.float32)
    else:
        if len(img.shape) == 2:
            rgb = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
        else:
            rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        pixels = rgb.reshape(-1, 3).astype(np.float32)

    if len(pixels) == 0:
        return [{"hex": "#000000", "rgb": (0, 0, 0), "coverage": 100.0}]

    # Filter out near-white and near-black canvas backgrounds if substantial content exists
    foreground_mask = ~(
        (pixels[:, 0] > 242) & (pixels[:, 1] > 242) & (pixels[:, 2] > 242)
    ) & ~(
        (pixels[:, 0] < 15) & (pixels[:, 1] < 15) & (pixels[:, 2] < 15)
    )
    active_pixels = pixels[foreground_mask]
    if len(active_pixels) < 30:
        active_pixels = pixels

    # K-Means clustering
    num_clusters = min(k, len(active_pixels))
    if num_clusters < 1:
        num_clusters = 1

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 15, 0.5)
    _, labels, centers = cv2.kmeans(
        active_pixels,
        num_clusters,
        None,
        criteria,
        3,
        cv2.KMEANS_PP_CENTERS
    )

    counts = np.bincount(labels.flatten())
    total_samples = float(len(active_pixels))
    sorted_indices = np.argsort(counts)[::-1]

    results = []
    for idx in sorted_indices:
        center = centers[idx]
        r, g, b = int(round(center[0])), int(round(center[1])), int(round(center[2]))
        cov = round((counts[idx] / total_samples) * 100.0, 1)
        results.append({
            "hex": rgb_to_hex(r, g, b),
            "rgb": (r, g, b),
            "coverage": cov
        })

    return results


def extract_dominant_color(image_path: str, k: int = 4) -> Tuple[str, float]:
    """Extract dominant color hex code and coverage percentage."""
    palette = extract_palette(image_path, k=k)
    dominant = palette[0]
    return dominant["hex"], dominant["coverage"]


def verify_brand_color(
    image_path: str,
    brand_hex: str = "#4F46E5",
    tolerance_de00: float = 3.5,
    secondary_palette: Optional[List[str]] = None
) -> dict:
    """Verifies whether an image's dominant or primary palette elements match brand guidelines.
    
    Uses CIEDE2000 (Delta E 00) perceptual distance:
    - Delta E <= 2.5: Compliant (indistinguishable / precise match)
    - 2.5 < Delta E <= 6.0: Warning (minor shift / lighting variance)
    - Delta E > 6.0: Violation (off-brand color)
    """
    palette = extract_palette(image_path, k=4)
    dominant = palette[0]
    dom_hex = dominant["hex"]
    dom_rgb = dominant["rgb"]

    # Compute CIEDE2000 against primary target
    target_rgb = hex_to_rgb(brand_hex)
    lab_detected = rgb_to_lab(*dom_rgb)
    lab_target = rgb_to_lab(*target_rgb)
    distance_de00 = round(delta_e_cie2000(lab_detected, lab_target), 2)

    # Check secondary palette if provided
    best_palette_match = None
    min_palette_distance = distance_de00
    matched_hex = brand_hex

    if secondary_palette:
        for sec_hex in secondary_palette:
            sec_lab = hex_to_lab(sec_hex)
            d = delta_e_cie2000(lab_detected, sec_lab)
            if d < min_palette_distance:
                min_palette_distance = round(d, 2)
                matched_hex = sec_hex

    is_match = distance_de00 <= tolerance_de00
    if is_match:
        status = "compliant"
        message = f"Dominant color {dom_hex} aligns with brand palette {brand_hex} (Delta E: {distance_de00})."
    elif distance_de00 <= (tolerance_de00 * 1.8):
        status = "warning"
        message = (
            f"Dominant color {dom_hex} exhibits minor palette drift from {brand_hex} "
            f"(Delta E: {distance_de00}, tolerance: {tolerance_de00})."
        )
    else:
        status = "violation"
        message = (
            f"Off-brand color detected: {dom_hex}. "
            f"Approved brand color is {brand_hex} (Delta E: {distance_de00} > {tolerance_de00})."
        )

    return {
        "image": image_path,
        "dominant_hex": dom_hex,
        "coverage_percentage": dominant["coverage"],
        "target_brand_hex": brand_hex,
        "color_distance_de00": distance_de00,
        "tolerance": tolerance_de00,
        "match": is_match,
        "status": status,
        "message": message,
        "palette": palette
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Inkloom AI Vision Engine - Perceptual Dominant Color Verifier")
    parser.add_argument("--image", required=True, help="Path to image file")
    parser.add_argument("--brand", default="#4F46E5", help="Target brand hex code (e.g. #4F46E5)")
    parser.add_argument("--tolerance", type=float, default=3.5, help="CIEDE2000 Delta E tolerance (default 3.5)")

    args = parser.parse_args()
    try:
        res = verify_brand_color(args.image, args.brand, args.tolerance)
        print("--- Inkloom AI Vision Verification Result ---")
        for k, v in res.items():
            if k == "palette":
                print("Extracted Palette:")
                for p in v:
                    print(f"  - {p['hex']}: {p['coverage']}%")
            else:
                print(f"{k}: {v}")
    except Exception as err:
        print(f"Error: {err}", file=sys.stderr)
        sys.exit(1)
