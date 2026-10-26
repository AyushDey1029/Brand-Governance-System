"""Brand Asset Ingestion Parser for Inkloom AI Backend Service.

Reads approved brand assets (colors, logos, tolerances) from CSV and JSON files.
"""
import csv
import json
import os
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class BrandColorAsset(BaseModel):
    """Specification for an approved brand color."""
    id: str
    name: str
    hex_code: str
    role: str = "primary"  # primary, secondary, accent, background
    tolerance_de00: float = 3.5
    description: Optional[str] = None


class BrandLogoAsset(BaseModel):
    """Specification for an approved brand logo variation."""
    id: str
    name: str
    template_path: Optional[str] = None
    min_width_px: int = 40
    min_height_px: int = 24
    clear_space_ratio: float = 0.35
    max_distortion_pct: float = 6.0
    allowed_background: str = "any"


class BrandAssetProfile(BaseModel):
    """Aggregated brand visual governance configuration."""
    brand_id: str = "inkloom"
    brand_name: str = "Inkloom AI"
    primary_color: BrandColorAsset = Field(
        default_factory=lambda: BrandColorAsset(
            id="inkloom_primary",
            name="Inkloom Indigo",
            hex_code="#4F46E5",
            role="primary",
            tolerance_de00=3.5,
            description="Primary hero and brand action color"
        )
    )
    palettes: List[BrandColorAsset] = Field(default_factory=list)
    logos: List[BrandLogoAsset] = Field(default_factory=list)

    def get_all_hex_codes(self) -> List[str]:
        """Returns list of all approved brand hex codes."""
        colors = [self.primary_color.hex_code]
        colors.extend([c.hex_code for c in self.palettes])
        return colors


def parse_assets_from_csv(csv_path: str) -> BrandAssetProfile:
    """Parses a CSV file containing brand color and logo specifications."""
    if not os.path.isfile(csv_path):
        raise FileNotFoundError(f"Brand asset CSV not found: {csv_path}")

    profile = BrandAssetProfile()
    palettes: List[BrandColorAsset] = []
    logos: List[BrandLogoAsset] = []

    with open(csv_path, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            asset_type = (row.get("asset_type") or row.get("type") or "").strip().lower()
            asset_id = (row.get("asset_id") or row.get("id") or "asset").strip()
            name = (row.get("name") or asset_id).strip()
            desc = row.get("description")

            if asset_type in ("color", "palette"):
                hex_code = (row.get("hex_code") or row.get("hex") or "#000000").strip()
                if not hex_code.startswith("#"):
                    hex_code = f"#{hex_code}"
                
                role = (row.get("role") or "secondary").strip().lower()
                tol = float(row.get("tolerance_de00") or row.get("tolerance") or 3.5)

                color_item = BrandColorAsset(
                    id=asset_id,
                    name=name,
                    hex_code=hex_code,
                    role=role,
                    tolerance_de00=tol,
                    description=desc
                )
                if role == "primary":
                    profile.primary_color = color_item
                else:
                    palettes.append(color_item)

            elif asset_type in ("logo", "mark", "icon"):
                template = row.get("file_path") or row.get("template_path")
                min_w = int(row.get("min_width") or row.get("min_width_px") or 40)
                min_h = int(row.get("min_height") or row.get("min_height_px") or 24)
                ratio = float(row.get("clear_space_ratio") or 0.35)
                max_dist = float(row.get("max_distortion_pct") or 6.0)
                bg = (row.get("allowed_background") or "any").strip().lower()

                logos.append(BrandLogoAsset(
                    id=asset_id,
                    name=name,
                    template_path=template,
                    min_width_px=min_w,
                    min_height_px=min_h,
                    clear_space_ratio=ratio,
                    max_distortion_pct=max_dist,
                    allowed_background=bg
                ))

    profile.palettes = palettes
    profile.logos = logos
    return profile
