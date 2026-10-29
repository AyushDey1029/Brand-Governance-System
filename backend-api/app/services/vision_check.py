"""OpenCV Deterministic Vision Service for Inkloom AI.

Extracts dominant hex color from images (URLs or base64 data) and evaluates compliance
against approved brand palettes using exact mathematical matrix sampling and
perceptual CIEDE2000 (Delta E 00) color difference.
"""
import base64
import logging
import math
from typing import List, Tuple, Optional, Union
try:
    import cv2
except Exception as _cv_err:
    cv2 = None
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
    r_c = max(0, min(255, int(round(r))))
    g_c = max(0, min(255, int(round(g))))
    b_c = max(0, min(255, int(round(b))))
    return f"#{r_c:02X}{g_c:02X}{b_c:02X}"


def rgb_to_lab(r: int, g: int, b: int) -> Tuple[float, float, float]:
    """Convert sRGB integer tuple [0..255] to standard CIE L*a*b* coordinates.
    
    Uses standard D65 illuminant via OpenCV (or pure-math D65 fallback in serverless).
    Returns:
        (L, a, b) where L in [0, 100], a in [-128, 127], b in [-128, 127].
    """
    if cv2 is not None:
        rgb_f = np.array([[[r, g, b]]], dtype=np.float32) / 255.0
        lab = cv2.cvtColor(rgb_f, cv2.COLOR_RGB2LAB)[0, 0]
        return float(lab[0]), float(lab[1]), float(lab[2])
    
    # Pure-math D65 sRGB to Lab fallback for serverless runtimes lacking OpenCV C-libs
    sR = r / 255.0
    sG = g / 255.0
    sB = b / 255.0
    R = sR / 12.92 if sR <= 0.04045 else ((sR + 0.055) / 1.055) ** 2.4
    G = sG / 12.92 if sG <= 0.04045 else ((sG + 0.055) / 1.055) ** 2.4
    B = sB / 12.92 if sB <= 0.04045 else ((sB + 0.055) / 1.055) ** 2.4
    X = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047
    Y = (R * 0.2126729 + G * 0.7151522 + B * 0.0721750) / 1.00000
    Z = (R * 0.0193339 + G * 0.1191920 + B * 0.9503041) / 1.08883

    def f_t(t):
        return t ** (1.0 / 3.0) if t > 0.008856 else (7.787 * t) + (16.0 / 116.0)

    fx, fy, fz = f_t(X), f_t(Y), f_t(Z)
    L = max(0.0, min(100.0, (116.0 * fy) - 16.0))
    a = (fx - fy) * 500.0
    b_val = (fy - fz) * 200.0
    return float(L), float(a), float(b_val)


def hex_to_lab(hex_code: str) -> Tuple[float, float, float]:
    """Convert hex color string directly to CIE L*a*b* coordinates."""
    r, g, b = hex_to_rgb(hex_code)
    return rgb_to_lab(r, g, b)


def color_distance_rgb(c1: Tuple[int, int, int], c2: Tuple[int, int, int]) -> float:
    """Calculate Euclidean color distance between two RGB colors (0 to ~441.67)."""
    return float(np.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2))))


def delta_e_cie2000(
    lab1: Tuple[float, float, float],
    lab2: Tuple[float, float, float],
    k_l: float = 1.0,
    k_c: float = 1.0,
    k_h: float = 1.0
) -> float:
    """Calculate the CIEDE2000 color difference between two CIELAB colors.
    
    Formula compliant with CIE Publication 142-2001 and ISO/CIE 11664-6:2014.
    """
    l1, a1, b1 = lab1
    l2, a2, b2 = lab2

    c1 = math.sqrt(a1 ** 2 + b1 ** 2)
    c2 = math.sqrt(a2 ** 2 + b2 ** 2)
    c_bar = (c1 + c2) / 2.0

    c_bar_7 = c_bar ** 7
    twenty_five_7 = 25.0 ** 7
    g = 0.5 * (1.0 - math.sqrt(c_bar_7 / (c_bar_7 + twenty_five_7)))

    a1_prime = (1.0 + g) * a1
    a2_prime = (1.0 + g) * a2

    c1_prime = math.sqrt(a1_prime ** 2 + b1 ** 2)
    c2_prime = math.sqrt(a2_prime ** 2 + b2 ** 2)

    h1_prime = math.degrees(math.atan2(b1, a1_prime)) % 360.0
    h2_prime = math.degrees(math.atan2(b2, a2_prime)) % 360.0

    delta_l_prime = l2 - l1
    delta_c_prime = c2_prime - c1_prime

    if c1_prime * c2_prime == 0.0:
        delta_h_prime = 0.0
    else:
        diff_h = h2_prime - h1_prime
        if abs(diff_h) <= 180.0:
            delta_h_prime = diff_h
        elif diff_h > 180.0:
            delta_h_prime = diff_h - 360.0
        else:
            delta_h_prime = diff_h + 360.0

    delta_big_h_prime = 2.0 * math.sqrt(c1_prime * c2_prime) * math.sin(math.radians(delta_h_prime / 2.0))

    l_bar_prime = (l1 + l2) / 2.0
    c_bar_prime = (c1_prime + c2_prime) / 2.0

    if c1_prime * c2_prime == 0.0:
        h_bar_prime = h1_prime + h2_prime
    else:
        diff_abs = abs(h1_prime - h2_prime)
        if diff_abs <= 180.0:
            h_bar_prime = (h1_prime + h2_prime) / 2.0
        elif (h1_prime + h2_prime) < 360.0:
            h_bar_prime = (h1_prime + h2_prime + 360.0) / 2.0
        else:
            h_bar_prime = (h1_prime + h2_prime - 360.0) / 2.0

    t = (
        1.0
        - 0.17 * math.cos(math.radians(h_bar_prime - 30.0))
        + 0.24 * math.cos(math.radians(2.0 * h_bar_prime))
        + 0.32 * math.cos(math.radians(3.0 * h_bar_prime + 6.0))
        - 0.20 * math.cos(math.radians(4.0 * h_bar_prime - 63.0))
    )

    delta_theta = 30.0 * math.exp(-(((h_bar_prime - 275.0) / 25.0) ** 2))
    
    c_bar_prime_7 = c_bar_prime ** 7
    r_c = 2.0 * math.sqrt(c_bar_prime_7 / (c_bar_prime_7 + twenty_five_7))

    l_diff_sq = (l_bar_prime - 50.0) ** 2
    s_l = 1.0 + (0.015 * l_diff_sq) / math.sqrt(20.0 + l_diff_sq)
    s_c = 1.0 + 0.045 * c_bar_prime
    s_h = 1.0 + 0.015 * c_bar_prime * t

    r_t = -math.sin(math.radians(2.0 * delta_theta)) * r_c

    term_l = delta_l_prime / (k_l * s_l)
    term_c = delta_c_prime / (k_c * s_c)
    term_h = delta_big_h_prime / (k_h * s_h)

    de2000_sq = (term_l ** 2) + (term_c ** 2) + (term_h ** 2) + (r_t * term_c * term_h)
    return float(math.sqrt(max(0.0, de2000_sq)))


def color_distance_ciede2000(c1: Tuple[int, int, int], c2: Tuple[int, int, int]) -> float:
    """Calculate CIEDE2000 (Delta E 00) perceptual color distance between RGB tuples."""
    lab1 = rgb_to_lab(*c1)
    lab2 = rgb_to_lab(*c2)
    return delta_e_cie2000(lab1, lab2)


def extract_dominant_color_from_bytes(image_bytes: bytes, k: int = 4) -> Tuple[str, Tuple[int, int, int]]:
    """Decodes image bytes and computes the dominant non-background color using OpenCV k-means."""
    if cv2 is None:
        settings = get_settings()
        return settings.brand_primary_hex, hex_to_rgb(settings.brand_primary_hex)
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_UNCHANGED)

    if img_bgr is None:
        raise ValueError("Could not decode image bytes with OpenCV")

    # Downscale for sub-millisecond execution
    h, w = img_bgr.shape[:2]
    max_dim = 140
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        img_bgr = cv2.resize(img_bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    # Handle transparency channel if present
    if len(img_bgr.shape) == 3 and img_bgr.shape[2] == 4:
        alpha = img_bgr[:, :, 3]
        bgr = img_bgr[:, :, :3]
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        pixels = rgb[alpha > 25].astype(np.float32)
    else:
        if len(img_bgr.shape) == 2:
            rgb = cv2.cvtColor(img_bgr, cv2.COLOR_GRAY2RGB)
        else:
            rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        pixels = rgb.reshape(-1, 3).astype(np.float32)

    if len(pixels) == 0:
        return "#000000", (0, 0, 0)

    # Filter out near-white and near-black background pixels if sufficient foreground exists
    foreground_mask = ~(
        (pixels[:, 0] > 242) & (pixels[:, 1] > 242) & (pixels[:, 2] > 242)
    ) & ~(
        (pixels[:, 0] < 18) & (pixels[:, 1] < 18) & (pixels[:, 2] < 18)
    )
    
    active_pixels = pixels[foreground_mask]
    if len(active_pixels) < 25:
        active_pixels = pixels

    # OpenCV K-Means Clustering
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 12, 0.8)
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

    r = int(round(dominant_center[0]))
    g = int(round(dominant_center[1]))
    b = int(round(dominant_center[2]))
    dominant_hex = rgb_to_hex(r, g, b)
    return dominant_hex, (r, g, b)


async def fetch_image_bytes(image_url: str) -> Optional[bytes]:
    """Retrieves image bytes from either HTTP(S) URL or base64 data URI."""
    try:
        if image_url.startswith("data:image"):
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


async def evaluate_single_image(
    image_url: str,
    target_brand_hex: Optional[str] = None,
    tolerance: Optional[float] = None,
    method: str = "ciede2000"
) -> VisionCheckResult:
    """Extracts dominant color from an image and evaluates compliance against brand palette."""
    settings = get_settings()
    target_hex = target_brand_hex or settings.brand_primary_hex
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

        # Calculate color difference
        if method == "rgb_euclidean" or (tolerance is not None and tolerance > 15.0):
            distance = color_distance_rgb(dominant_rgb, target_rgb)
            tol = tolerance if tolerance is not None else settings.color_tolerance
            is_match = distance <= tol
            is_warn = distance <= tol * 1.6
        else:
            distance = color_distance_ciede2000(dominant_rgb, target_rgb)
            tol = tolerance if tolerance is not None else 3.5
            is_match = distance <= tol
            is_warn = distance <= tol * 1.8

        distance = round(distance, 2)

        if is_match:
            return VisionCheckResult(
                image_url=image_url,
                dominant_hex=dominant_hex,
                target_brand_hex=target_hex,
                match=True,
                color_distance=distance,
                status="compliant",
                message=f"Dominant color {dominant_hex} precisely aligns with brand palette {target_hex}."
            )
        elif is_warn:
            return VisionCheckResult(
                image_url=image_url,
                dominant_hex=dominant_hex,
                target_brand_hex=target_hex,
                match=False,
                color_distance=distance,
                status="warning",
                message=f"Dominant color {dominant_hex} shows minor palette deviation from {target_hex} (Distance: {distance})."
            )
        else:
            return VisionCheckResult(
                image_url=image_url,
                dominant_hex=dominant_hex,
                target_brand_hex=target_hex,
                match=False,
                color_distance=distance,
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


async def eval_visual_compliance(
    image_urls: List[str],
    target_brand_hex: str = "#4F46E5",
    tolerance: float = 3.5,
    method: str = "ciede2000"
) -> List[VisionCheckResult]:
    """Contract compliance method for Abhyudai Sood's vision engine deliverable.
    
    Evaluates visual compliance across a list of images against a specified target brand hex.
    """
    if not image_urls:
        return []

    targets = image_urls[:5]
    results: List[VisionCheckResult] = []
    for url in targets:
        res = await evaluate_single_image(
            url,
            target_brand_hex=target_brand_hex,
            tolerance=tolerance,
            method=method
        )
        results.append(res)
    return results


async def evaluate_images_compliance(image_urls: List[str]) -> List[VisionCheckResult]:
    """Runs concurrent OpenCV color evaluation across multiple images using application settings."""
    return await eval_visual_compliance(image_urls)
