"""OpenCV Deterministic Vision Service for Inkloom AI.

Extracts dominant hex color from images (URLs or base64 data) and evaluates compliance
against approved brand palettes using exact mathematical matrix sampling.
"""
import base64
import logging
from typing import List, Tuple, Optional
import cv2
import numpy as np
import httpx

from app.config import get_settings
from app.models.schemas import VisionCheckResult

logger = logging.getLogger(__name__)


def hex_to_rgb(hex_code: str) -> Tuple[int, int, int]:
    """Convert hex string (e.g. #4F46E5) to RGB tuple."""
    hex_clean = hex_code.lstrip("#")
    if len(hex_clean) == 3:
        hex_clean = "".join([c * 2 for c in hex_clean])
    return int(hex_clean[0:2], 16), int(hex_clean[2:4], 16), int(hex_clean[4:6], 16)


def rgb_to_hex(r: int, g: int, b: int) -> str:
    """Convert RGB integers to formatted hex string."""
    return f"#{int(r):02X}{int(g):02X}{int(b):02X}"


def color_distance_rgb(c1: Tuple[int, int, int], c2: Tuple[int, int, int]) -> float:
    """Calculate Euclidean color distance between two RGB colors (0 to ~441.67)."""
    return float(np.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2))))


def extract_dominant_color_from_bytes(image_bytes: bytes, k: int = 3) -> Tuple[str, Tuple[int, int, int]]:
    """Decodes image bytes and computes the dominant non-background color using OpenCV k-means."""
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img_bgr is None:
        raise ValueError("Could not decode image bytes with OpenCV")

    # Downscale for sub-millisecond execution
    h, w = img_bgr.shape[:2]
    max_dim = 120
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        img_bgr = cv2.resize(img_bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    # Convert BGR to RGB
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    pixels = img_rgb.reshape(-1, 3).astype(np.float32)

    # Filter out near-white and near-black background pixels if sufficient foreground exists
    foreground_mask = ~((pixels[:, 0] > 240) & (pixels[:, 1] > 240) & (pixels[:, 2] > 240)) & \
                      ~((pixels[:, 0] < 20) & (pixels[:, 1] < 20) & (pixels[:, 2] < 20))
    
    active_pixels = pixels[foreground_mask]
    if len(active_pixels) < 20:
        # Image is mostly solid or monochrome
        active_pixels = pixels

    # OpenCV K-Means Clustering
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    num_clusters = min(k, len(active_pixels))
    if num_clusters < 1:
        num_clusters = 1

    _, labels, centers = cv2.kmeans(
        active_pixels,
        num_clusters,
        None,
        criteria,
        3,
        cv2.KMEANS_PP_CENTERS
    )

    # Find the largest cluster
    counts = np.bincount(labels.flatten())
    dominant_center = centers[np.argmax(counts)]

    r, g, b = int(dominant_center[0]), int(dominant_center[1]), int(dominant_center[2])
    dominant_hex = rgb_to_hex(r, g, b)
    return dominant_hex, (r, g, b)


async def fetch_image_bytes(image_url: str) -> Optional[bytes]:
    """Retrieves image bytes from either HTTP(S) URL or base64 data URI."""
    try:
        if image_url.startswith("data:image"):
            # Parse data URI: data:image/png;base64,....
            header, base64_data = image_url.split(",", 1)
            return base64.b64decode(base64_data)
        
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            resp = await client.get(image_url)
            if resp.status_code == 200:
                return resp.content
            logger.warning("Failed to fetch image %s: HTTP %s", image_url, resp.status_code)
            return None
    except Exception as e:
        logger.warning("Error loading image from %s: %s", image_url, e)
        return None


async def evaluate_single_image(image_url: str) -> VisionCheckResult:
    """Extracts dominant color from an image and compares against brand palette."""
    settings = get_settings()
    target_hex = settings.brand_primary_hex
    target_rgb = hex_to_rgb(target_hex)

    image_bytes = await fetch_image_bytes(image_url)
    if not image_bytes:
        return VisionCheckResult(
            image_url=image_url,
            dominant_hex="#000000",
            target_brand_hex=target_hex,
            match=False,
            color_distance=999.0,
            status="error",
            message="Could not download or decode image asset."
        )

    try:
        dominant_hex, dominant_rgb = extract_dominant_color_from_bytes(image_bytes)
        distance = color_distance_rgb(dominant_rgb, target_rgb)
        tolerance = settings.color_tolerance

        if distance <= tolerance:
            return VisionCheckResult(
                image_url=image_url,
                dominant_hex=dominant_hex,
                target_brand_hex=target_hex,
                match=True,
                color_distance=round(distance, 2),
                status="compliant",
                message=f"Dominant color {dominant_hex} precisely aligns with brand palette {target_hex}."
            )
        elif distance <= tolerance * 1.6:
            return VisionCheckResult(
                image_url=image_url,
                dominant_hex=dominant_hex,
                target_brand_hex=target_hex,
                match=False,
                color_distance=round(distance, 2),
                status="warning",
                message=f"Dominant color {dominant_hex} shows minor palette deviation from {target_hex} (Distance: {distance:.1f})."
            )
        else:
            return VisionCheckResult(
                image_url=image_url,
                dominant_hex=dominant_hex,
                target_brand_hex=target_hex,
                match=False,
                color_distance=round(distance, 2),
                status="violation",
                message=f"Off-brand color detected: {dominant_hex}. Approved primary brand color is {target_hex}."
            )

    except Exception as e:
        logger.error("OpenCV processing failed for %s: %s", image_url, e)
        return VisionCheckResult(
            image_url=image_url,
            dominant_hex="#000000",
            target_brand_hex=target_hex,
            match=False,
            color_distance=999.0,
            status="error",
            message=f"Vision analysis error: {str(e)}"
        )


async def evaluate_images_compliance(image_urls: List[str]) -> List[VisionCheckResult]:
    """Runs concurrent OpenCV color evaluation across multiple images."""
    if not image_urls:
        return []

    # Limit to first 5 images per request to keep response snappy
    targets = image_urls[:5]
    results: List[VisionCheckResult] = []
    for url in targets:
        result = await evaluate_single_image(url)
        results.append(result)
    return results
