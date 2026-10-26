"""Multi-Scale Logo Template Matching, Clear-Space & Boundary Verification Engine.

Performs deterministic multi-scale OpenCV correlation matching for brand logos,
verifies aspect ratio integrity, minimum size constraints, and computes
clear-space exclusion zone compliance.
"""
import math
from typing import Dict, List, Optional, Tuple, Union
import cv2
import numpy as np


class LogoVerificationResult:
    """Structured result for brand logo inspection."""
    def __init__(
        self,
        detected: bool,
        confidence: float,
        bounding_box: Optional[Tuple[int, int, int, int]] = None,
        scale: float = 1.0,
        aspect_ratio_ok: bool = True,
        aspect_ratio_error: float = 0.0,
        min_size_ok: bool = True,
        clear_space_ok: bool = True,
        clear_space_clutter: float = 0.0,
        status: str = "compliant",
        message: str = ""
    ):
        self.detected = detected
        self.confidence = round(confidence, 3)
        self.bounding_box = bounding_box  # (x, y, w, h)
        self.scale = round(scale, 3)
        self.aspect_ratio_ok = aspect_ratio_ok
        self.aspect_ratio_error = round(aspect_ratio_error, 2)
        self.min_size_ok = min_size_ok
        self.clear_space_ok = clear_space_ok
        self.clear_space_clutter = round(clear_space_clutter, 2)
        self.status = status
        self.message = message

    def to_dict(self) -> Dict[str, any]:
        return {
            "detected": self.detected,
            "confidence": self.confidence,
            "bounding_box": {
                "x": self.bounding_box[0],
                "y": self.bounding_box[1],
                "w": self.bounding_box[2],
                "h": self.bounding_box[3],
            } if self.bounding_box else None,
            "scale": self.scale,
            "aspect_ratio_ok": self.aspect_ratio_ok,
            "aspect_ratio_error_pct": self.aspect_ratio_error,
            "min_size_ok": self.min_size_ok,
            "clear_space_ok": self.clear_space_ok,
            "clear_space_clutter": self.clear_space_clutter,
            "status": self.status,
            "message": self.message
        }


def detect_logo_multi_scale(
    target_img: np.ndarray,
    template_img: np.ndarray,
    scale_range: Tuple[float, float] = (0.3, 1.8),
    scale_steps: int = 15,
    threshold: float = 0.65
) -> Tuple[bool, float, Optional[Tuple[int, int, int, int]], float]:
    """Finds best matching logo instance across multiple scales using TM_CCOEFF_NORMED.
    
    Returns:
        (detected, max_correlation, bounding_box (x, y, w, h), best_scale)
    """
    if len(target_img.shape) == 3:
        target_gray = cv2.cvtColor(target_img, cv2.COLOR_BGR2GRAY)
    else:
        target_gray = target_img

    if len(template_img.shape) == 3:
        if template_img.shape[2] == 4:
            template_gray = cv2.cvtColor(template_img[:, :, :3], cv2.COLOR_BGR2GRAY)
        else:
            template_gray = cv2.cvtColor(template_img, cv2.COLOR_BGR2GRAY)
    else:
        template_gray = template_img

    t_h, t_w = template_gray.shape[:2]
    img_h, img_w = target_gray.shape[:2]

    best_val = -1.0
    best_loc = None
    best_scale = 1.0
    best_dim = (0, 0)

    scales = np.linspace(scale_range[0], scale_range[1], scale_steps)

    for s in scales:
        resized_w = int(t_w * s)
        resized_h = int(t_h * s)

        if resized_w >= img_w or resized_h >= img_h or resized_w < 10 or resized_h < 10:
            continue

        resized_template = cv2.resize(template_gray, (resized_w, resized_h), interpolation=cv2.INTER_AREA)
        res = cv2.matchTemplate(target_gray, resized_template, cv2.TM_CCOEFF_NORMED)
        min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)

        if max_val > best_val:
            best_val = max_val
            best_loc = max_loc
            best_scale = s
            best_dim = (resized_w, resized_h)

    detected = best_val >= threshold
    if detected and best_loc:
        bbox = (best_loc[0], best_loc[1], best_dim[0], best_dim[1])
        return True, float(best_val), bbox, float(best_scale)

    return False, float(best_val) if best_val > 0 else 0.0, None, 1.0


def check_clear_space(
    target_img: np.ndarray,
    bbox: Tuple[int, int, int, int],
    clear_space_ratio: float = 0.35,
    max_clutter_density: float = 0.08
) -> Tuple[bool, float]:
    """Inspects the exclusion zone / padding area around the logo for visual intrusion or clutter."""
    x, y, w, h = bbox
    img_h, img_w = target_img.shape[:2]
    margin = int(h * clear_space_ratio)

    if margin < 4:
        margin = 4

    # Outer perimeter boundary
    x_min = max(0, x - margin)
    y_min = max(0, y - margin)
    x_max = min(img_w, x + w + margin)
    y_max = min(img_h, y + h + margin)

    if len(target_img.shape) == 3:
        gray = cv2.cvtColor(target_img, cv2.COLOR_BGR2GRAY)
    else:
        gray = target_img

    edges = cv2.Canny(gray, 60, 150)

    # Exclude the logo itself plus a small border buffer
    edge_buffer = max(2, int(min(w, h) * 0.06))
    x_inner_min = max(0, x - edge_buffer)
    y_inner_min = max(0, y - edge_buffer)
    x_inner_max = min(img_w, x + w + edge_buffer)
    y_inner_max = min(img_h, y + h + edge_buffer)

    margin_mask = np.zeros_like(edges, dtype=np.uint8)
    margin_mask[y_min:y_max, x_min:x_max] = 255
    margin_mask[y_inner_min:y_inner_max, x_inner_min:x_inner_max] = 0

    margin_edge_pixels = cv2.bitwise_and(edges, edges, mask=margin_mask)
    margin_area = np.count_nonzero(margin_mask)

    if margin_area == 0:
        return True, 0.0

    edge_count = np.count_nonzero(margin_edge_pixels)
    clutter_density = float(edge_count) / float(margin_area)

    is_compliant = clutter_density <= max_clutter_density
    return is_compliant, clutter_density


def verify_logo_compliance(
    target_img_or_path: Union[str, np.ndarray],
    template_img_or_path: Union[str, np.ndarray],
    min_height: int = 20,
    clear_space_ratio: float = 0.35,
    detection_threshold: float = 0.65
) -> LogoVerificationResult:
    """Comprehensive brand logo verification: detection, aspect ratio, min size, and clear space."""
    if isinstance(target_img_or_path, str):
        target = cv2.imread(target_img_or_path, cv2.IMREAD_UNCHANGED)
        if target is None:
            raise FileNotFoundError(f"Could not load target image: {target_img_or_path}")
    else:
        target = target_img_or_path

    if isinstance(template_img_or_path, str):
        template = cv2.imread(template_img_or_path, cv2.IMREAD_UNCHANGED)
        if template is None:
            raise FileNotFoundError(f"Could not load template image: {template_img_or_path}")
    else:
        template = template_img_or_path

    detected, conf, bbox, scale = detect_logo_multi_scale(
        target, template, threshold=detection_threshold
    )

    if not detected:
        return LogoVerificationResult(
            detected=False,
            confidence=conf,
            status="violation",
            message=f"Official brand logo not detected on canvas (highest confidence: {conf:.2f} < {detection_threshold})."
        )

    x, y, w, h = bbox
    t_h, t_w = template.shape[:2]
    expected_ratio = float(t_w) / float(t_h)
    actual_ratio = float(w) / float(h)
    ratio_error_pct = abs(actual_ratio - expected_ratio) / expected_ratio * 100.0
    aspect_ok = ratio_error_pct <= 6.0

    min_size_ok = h >= min_height
    clear_ok, clutter = check_clear_space(target, bbox, clear_space_ratio=clear_space_ratio)

    issues = []
    if not aspect_ok:
        issues.append(f"Logo aspect ratio distorted by {ratio_error_pct:.1f}%")
    if not min_size_ok:
        issues.append(f"Logo height ({h}px) is below minimum guideline of {min_height}px")
    if not clear_ok:
        issues.append(f"Exclusion zone violated: high clutter density ({clutter:.2f}) in required margin")

    if not issues:
        status = "compliant"
        message = (
            f"Brand logo successfully verified at ({x}, {y}) with scale {scale:.2f}x "
            f"(Confidence: {conf:.2f}). Aspect ratio, clear-space, and size compliant."
        )
    elif len(issues) == 1 and clear_ok and aspect_ok:
        status = "warning"
        message = f"Logo detected with minor guideline warning: {issues[0]}."
    else:
        status = "violation"
        message = f"Logo compliance failed: {'; '.join(issues)}."

    return LogoVerificationResult(
        detected=True,
        confidence=conf,
        bounding_box=bbox,
        scale=scale,
        aspect_ratio_ok=aspect_ok,
        aspect_ratio_error=ratio_error_pct,
        min_size_ok=min_size_ok,
        clear_space_ok=clear_ok,
        clear_space_clutter=clutter,
        status=status,
        message=message
    )
