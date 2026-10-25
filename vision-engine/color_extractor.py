"""Standalone OpenCV Dominant Color Extractor and Brand Palette Verifier.

Usage:
    python color_extractor.py --image path/or/url/to/image.png --brand "#4F46E5" --tolerance 35
"""
import argparse
import sys
from typing import Tuple
import cv2
import numpy as np


def hex_to_rgb(hex_code: str) -> Tuple[int, int, int]:
    clean = hex_code.lstrip("#")
    if len(clean) == 3:
        clean = "".join([c * 2 for c in clean])
    return int(clean[0:2], 16), int(clean[2:4], 16), int(clean[4:6], 16)


def rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{int(r):02X}{int(g):02X}{int(b):02X}"


def extract_dominant_color(image_path: str, k: int = 3) -> Tuple[str, float]:
    """Reads image from local file, samples pixels, downscales, and clusters with OpenCV k-means."""
    img_bgr = cv2.imread(image_path)
    if img_bgr is None:
        raise FileNotFoundError(f"Could not open image file: {image_path}")

    # Downscale for performance
    h, w = img_bgr.shape[:2]
    max_dim = 150
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        img_bgr = cv2.resize(img_bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    pixels = img_rgb.reshape(-1, 3).astype(np.float32)

    # Filter background white/black if foreground exists
    foreground_mask = ~((pixels[:, 0] > 240) & (pixels[:, 1] > 240) & (pixels[:, 2] > 240)) & \
                      ~((pixels[:, 0] < 20) & (pixels[:, 1] < 20) & (pixels[:, 2] < 20))
    active = pixels[foreground_mask]
    if len(active) < 20:
        active = pixels

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    num_clusters = min(k, len(active))
    _, labels, centers = cv2.kmeans(active, num_clusters, None, criteria, 3, cv2.KMEANS_PP_CENTERS)

    counts = np.bincount(labels.flatten())
    dominant_center = centers[np.argmax(counts)]

    r, g, b = int(dominant_center[0]), int(dominant_center[1]), int(dominant_center[2])
    dominant_hex = rgb_to_hex(r, g, b)
    percentage = (np.max(counts) / len(active)) * 100.0

    return dominant_hex, percentage


def verify_brand_color(image_path: str, brand_hex: str = "#4F46E5", tolerance: float = 38.0) -> dict:
    """Verifies whether an image's dominant color matches the brand palette."""
    dom_hex, pct = extract_dominant_color(image_path)
    r1, g1, b1 = hex_to_rgb(dom_hex)
    r2, g2, b2 = hex_to_rgb(brand_hex)

    distance = float(np.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2))
    is_match = distance <= tolerance

    return {
        "image": image_path,
        "dominant_hex": dom_hex,
        "coverage_percentage": round(pct, 1),
        "target_brand_hex": brand_hex,
        "color_distance": round(distance, 2),
        "tolerance": tolerance,
        "match": is_match,
        "status": "compliant" if is_match else ("warning" if distance <= tolerance * 1.6 else "violation")
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Inkloom AI Vision Engine - Dominant Color Extractor")
    parser.add_argument("--image", required=True, help="Path to image file")
    parser.add_argument("--brand", default="#4F46E5", help="Target brand hex code (e.g. #4F46E5)")
    parser.add_argument("--tolerance", type=float, default=38.0, help="Euclidean color distance tolerance")

    args = parser.parse_args()
    try:
        res = verify_brand_color(args.image, args.brand, args.tolerance)
        print("--- Vision Verification Result ---")
        for k, v in res.items():
            print(f"{k}: {v}")
    except Exception as err:
        print(f"Error: {err}", file=sys.stderr)
        sys.exit(1)
