"""Inkloom AI Standalone Vision Engine.

Computer vision governance modules owned by Abhyudai Sood:
- CIEDE2000 Perceptual Color Delta
- Multi-scale Logo Detection and Clear-Space Verification
- Brand Asset Ingestion Parsers
"""
try:
    from .ciede2000 import (
        delta_e_cie2000,
        hex_to_rgb,
        rgb_to_hex,
        rgb_to_lab,
        hex_to_lab,
        calculate_color_distance,
    )
    from .color_extractor import (
        extract_palette,
        extract_dominant_color,
        verify_brand_color,
    )
    from .logo_detector import (
        verify_logo_compliance,
        detect_logo_multi_scale,
        check_clear_space,
        LogoVerificationResult,
    )
    from .asset_parser import (
        BrandAssetProfile,
        BrandColorAsset,
        BrandLogoAsset,
        parse_assets_from_csv,
        parse_assets_from_json,
        export_assets_to_csv,
    )
except (ImportError, ValueError):
    from ciede2000 import (
        delta_e_cie2000,
        hex_to_rgb,
        rgb_to_hex,
        rgb_to_lab,
        hex_to_lab,
        calculate_color_distance,
    )
    from color_extractor import (
        extract_palette,
        extract_dominant_color,
        verify_brand_color,
    )
    from logo_detector import (
        verify_logo_compliance,
        detect_logo_multi_scale,
        check_clear_space,
        LogoVerificationResult,
    )
    from asset_parser import (
        BrandAssetProfile,
        BrandColorAsset,
        BrandLogoAsset,
        parse_assets_from_csv,
        parse_assets_from_json,
        export_assets_to_csv,
    )

__all__ = [
    "delta_e_cie2000",
    "hex_to_rgb",
    "rgb_to_hex",
    "rgb_to_lab",
    "hex_to_lab",
    "calculate_color_distance",
    "extract_palette",
    "extract_dominant_color",
    "verify_brand_color",
    "verify_logo_compliance",
    "detect_logo_multi_scale",
    "check_clear_space",
    "LogoVerificationResult",
    "BrandAssetProfile",
    "BrandColorAsset",
    "BrandLogoAsset",
    "parse_assets_from_csv",
    "parse_assets_from_json",
    "export_assets_to_csv",
]
