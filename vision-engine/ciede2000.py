"""CIEDE2000 (Delta E 00) Color Difference Algorithm in Pure NumPy and OpenCV.

Implements the official CIE Publication 142-2001 and ISO/CIE 11664-6:2014 standard
for calculating color difference in the CIELAB color space.
"""
import math
from typing import Tuple, Union
import cv2
import numpy as np


def hex_to_rgb(hex_code: str) -> Tuple[int, int, int]:
    """Convert hex string (e.g. '#4F46E5' or '4F46E5') to RGB integer tuple (0-255)."""
    clean = hex_code.lstrip("#")
    if len(clean) == 3:
        clean = "".join([c * 2 for c in clean])
    if len(clean) != 6:
        raise ValueError(f"Invalid hex color: {hex_code}")
    return int(clean[0:2], 16), int(clean[2:4], 16), int(clean[4:6], 16)


def rgb_to_hex(r: int, g: int, b: int) -> str:
    """Convert RGB integers (0-255) to a formatted uppercase hex string."""
    r_c = max(0, min(255, int(round(r))))
    g_c = max(0, min(255, int(round(g))))
    b_c = max(0, min(255, int(round(b))))
    return f"#{r_c:02X}{g_c:02X}{b_c:02X}"


def rgb_to_lab(r: int, g: int, b: int) -> Tuple[float, float, float]:
    """Convert sRGB integer tuple [0..255] to standard CIE L*a*b* coordinates.
    
    Uses standard D65 illuminant via OpenCV with floating point precision.
    Returns:
        (L, a, b) where L in [0, 100], a in [-128, 127], b in [-128, 127].
    """
    rgb_f = np.array([[[r, g, b]]], dtype=np.float32) / 255.0
    lab = cv2.cvtColor(rgb_f, cv2.COLOR_RGB2LAB)[0, 0]
    return float(lab[0]), float(lab[1]), float(lab[2])


def hex_to_lab(hex_code: str) -> Tuple[float, float, float]:
    """Convert hex color string directly to CIE L*a*b* coordinates."""
    r, g, b = hex_to_rgb(hex_code)
    return rgb_to_lab(r, g, b)


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


def calculate_color_distance(
    c1: Union[str, Tuple[int, int, int]],
    c2: Union[str, Tuple[int, int, int]],
    method: str = "ciede2000"
) -> float:
    """Universal color distance helper between two hex codes or RGB tuples."""
    rgb1 = hex_to_rgb(c1) if isinstance(c1, str) else c1
    rgb2 = hex_to_rgb(c2) if isinstance(c2, str) else c2

    if method == "rgb_euclidean":
        return float(math.sqrt(sum((a - b) ** 2 for a, b in zip(rgb1, rgb2))))

    lab1 = rgb_to_lab(*rgb1)
    lab2 = rgb_to_lab(*rgb2)
    return delta_e_cie2000(lab1, lab2)
