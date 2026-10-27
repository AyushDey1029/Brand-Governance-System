import React, { useState, useEffect, useCallback } from "react";
import {
  Palette,
  Upload,
  Copy,
  Check,
  Image as ImageIcon,
  Crop,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  FileText,
  Type,
  Layout,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Sun,
  Moon,
  Grid,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../design-system/Card";
import { Button } from "../design-system/Button";
import { Badge } from "../design-system/Badge";
import { Input, Textarea, Select } from "../design-system/FormControls";
import { Modal } from "../design-system/Modal";
import { EmptyState } from "../design-system/EmptyState";
import { AnimatedCounter } from "../design-system/AnimatedCounter";
import { AtmosphericBackground } from "../components/AtmosphericBackground";
import { useNotification } from "../context/NotificationContext";
import { MOCK_VISUAL_ASSETS } from "../data/mockData";
import { VisualAsset } from "../types";
import { api } from "../api/client";

const ASSET_TABS = [
  { id: "ALL", label: "All Assets" },
  { id: "COLOR_SWATCH", label: "Color Palette" },
  { id: "LOGO", label: "Approved Logos" },
  { id: "REFERENCE_IMAGE", label: "Reference Imagery" },
  { id: "TYPOGRAPHY", label: "Typography Specs" },
  { id: "MEDIA_REQUIREMENT", label: "Media Specs" },
];

export const VisualAssetsView: React.FC = () => {
  const { activeBrand, isDemoMode } = useWorkspace();
  const { showToast } = useNotification();

  const [assets, setAssets] = useState<VisualAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [logoStages, setLogoStages] = useState<Record<string, "light" | "dark" | "checker">>({});

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [isTypographyModalOpen, setIsTypographyModalOpen] = useState(false);
  const [isMediaSpecModalOpen, setIsMediaSpecModalOpen] = useState(false);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState("LOGO");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Color Swatch Form State
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#4F46E5");
  const [colorRole, setColorRole] = useState("Primary");
  const [colorPantone, setColorPantone] = useState("");
  const [isSavingColor, setIsSavingColor] = useState(false);

  // Typography Form State
  const [fontFamily, setFontFamily] = useState("");
  const [fontRole, setFontRole] = useState("Headings");
  const [fontFallback, setFontFallback] = useState("sans-serif");
  const [fontWeights, setFontWeights] = useState("400, 600, 700");

  // Media Spec Form State
  const [specChannel, setSpecChannel] = useState("LinkedIn Banner");
  const [specAspectRatio, setSpecAspectRatio] = useState("1.91:1");
  const [specMinResolution, setSpecMinResolution] = useState("1200x628");
  const [specMaxMb, setSpecMaxMb] = useState("5");

  // Load assets
  const fetchAssets = useCallback(async () => {
    if (!activeBrand?.id) return;
    if (isDemoMode || !api.hasTokens()) {
      setAssets(MOCK_VISUAL_ASSETS);
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.listAssets(activeBrand.id, activeTab !== "ALL" ? activeTab : undefined);
      const normalized: VisualAsset[] = data.map((a: any) => ({
        id: a.id,
        brandId: a.brand_id,
        name: a.name,
        assetType: a.asset_type,
        previewUrl: a.preview_url ? `${api.getAssetFileUrl(activeBrand.id, a.id)}` : undefined,
        hexCode: a.hex_code,
        aspectRatio: a.aspect_ratio,
        clearanceMarginPx: a.clearance_margin_px,
        file_size_bytes: a.file_size_bytes,
        mime_type: a.mime_type,
        metadata_json: a.metadata_json || {},
        updatedAt: a.updated_at ? a.updated_at.split("T")[0] : undefined,
      }));
      setAssets(normalized);
    } catch (err: any) {
      console.error("Failed to load visual assets:", err);
      setAssets(MOCK_VISUAL_ASSETS);
    } finally {
      setIsLoading(false);
    }
  }, [activeBrand.id, isDemoMode, activeTab]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    showToast({
      type: "info",
      title: "Color Copied",
      message: `${hex} copied to clipboard for design tools.`,
    });
    setTimeout(() => setCopiedHex(null), 2000);
  };

  // Submit Color Swatch
  const handleSaveColorSwatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingColor(true);

    const payload = {
      name: colorName,
      asset_type: "COLOR_SWATCH",
      hex_code: colorHex,
      metadata_json: {
        role: colorRole,
        pantone: colorPantone || null,
      },
    };

    try {
      if (!isDemoMode && api.hasTokens() && activeBrand.id) {
        await api.createAsset(activeBrand.id, payload);
        showToast({
          type: "success",
          title: "Color Swatch Added",
          message: `Indexed ${colorHex} (${colorName}) into brand color palette.`,
        });
        await fetchAssets();
      } else {
        const mock: VisualAsset = {
          id: `asset-${Date.now()}`,
          name: colorName,
          assetType: "COLOR_SWATCH",
          hexCode: colorHex,
          metadata_json: { role: colorRole, pantone: colorPantone },
        };
        setAssets((prev) => [mock, ...prev]);
        showToast({ type: "success", title: "Color Added (Demo)", message: colorHex });
      }
      setIsColorModalOpen(false);
      setColorName("");
      setColorPantone("");
    } catch (err: any) {
      showToast({ type: "error", title: "Failed to add color", message: err.message });
    } finally {
      setIsSavingColor(false);
    }
  };

  // Submit Typography Spec
  const handleSaveTypography = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: `${fontRole}: ${fontFamily}`,
      asset_type: "TYPOGRAPHY",
      metadata_json: {
        family: fontFamily,
        role: fontRole,
        fallback: fontFallback,
        weights: fontWeights.split(",").map((w) => w.trim()),
      },
    };

    try {
      if (!isDemoMode && api.hasTokens() && activeBrand.id) {
        await api.createAsset(activeBrand.id, payload);
        showToast({ type: "success", title: "Typography Spec Added", message: fontFamily });
        await fetchAssets();
      } else {
        const mock: VisualAsset = {
          id: `asset-${Date.now()}`,
          name: `${fontRole}: ${fontFamily}`,
          assetType: "TYPOGRAPHY",
          metadata_json: payload.metadata_json,
        };
        setAssets((prev) => [mock, ...prev]);
      }
      setIsTypographyModalOpen(false);
      setFontFamily("");
    } catch (err: any) {
      showToast({ type: "error", title: "Failed to save font", message: err.message });
    }
  };

  // Submit Media Spec
  const handleSaveMediaSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: `${specChannel} Spec`,
      asset_type: "MEDIA_REQUIREMENT",
      aspect_ratio: specAspectRatio,
      metadata_json: {
        channel: specChannel,
        min_resolution: specMinResolution,
        max_file_size_mb: specMaxMb,
      },
    };

    try {
      if (!isDemoMode && api.hasTokens() && activeBrand.id) {
        await api.createAsset(activeBrand.id, payload);
        showToast({ type: "success", title: "Media Requirement Saved", message: specChannel });
        await fetchAssets();
      } else {
        const mock: VisualAsset = {
          id: `asset-${Date.now()}`,
          name: `${specChannel} Spec`,
          assetType: "MEDIA_REQUIREMENT",
          aspectRatio: specAspectRatio,
          metadata_json: payload.metadata_json,
        };
        setAssets((prev) => [mock, ...prev]);
      }
      setIsMediaSpecModalOpen(false);
    } catch (err: any) {
      showToast({ type: "error", title: "Failed to save media spec", message: err.message });
    }
  };

  // Submit File Upload (Logo / Reference Image)
  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!uploadFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    if (uploadFile.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds the 10MB maximum limit.");
      return;
    }

    const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!allowed.includes(uploadFile.type)) {
      setUploadError(`Unsupported file format (${uploadFile.type}). Allowed: PNG, JPEG, WEBP, SVG.`);
      return;
    }

    setIsUploading(true);
    try {
      if (!isDemoMode && api.hasTokens() && activeBrand.id) {
        await api.uploadAsset(activeBrand.id, uploadName || uploadFile.name, uploadType, uploadFile);
        showToast({
          type: "success",
          title: "Asset Uploaded & Protected",
          message: `Saved ${uploadFile.name} to private tenant asset repository.`,
        });
        await fetchAssets();
      } else {
        const mock: VisualAsset = {
          id: `asset-${Date.now()}`,
          name: uploadName || uploadFile.name,
          assetType: uploadType,
          previewUrl: URL.createObjectURL(uploadFile),
          file_size_bytes: uploadFile.size,
          mime_type: uploadFile.type,
          updatedAt: new Date().toISOString().split("T")[0],
        };
        setAssets((prev) => [mock, ...prev]);
        showToast({ type: "success", title: "Asset Uploaded (Demo)", message: uploadFile.name });
      }
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadName("");
    } catch (err: any) {
      setUploadError(err.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Asset
  const handleDeleteAsset = async (asset: VisualAsset) => {
    if (!window.confirm(`Permanently delete asset "${asset.name}"?`)) return;

    if (!isDemoMode && api.hasTokens() && activeBrand.id) {
      try {
        await api.deleteAsset(activeBrand.id, asset.id);
        await fetchAssets();
        showToast({ type: "info", title: "Asset Removed", message: asset.name });
      } catch (err: any) {
        showToast({ type: "error", title: "Failed to delete", message: err.message });
      }
    } else {
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
      showToast({ type: "info", title: "Asset Removed (Demo)", message: asset.name });
    }
  };

  // Filtered lists
  const colorSwatches = assets.filter((a) => a.assetType === "COLOR_SWATCH");
  const logos = assets.filter((a) => a.assetType.startsWith("LOGO"));
  const referenceImages = assets.filter((a) => a.assetType === "REFERENCE_IMAGE");
  const typographySpecs = assets.filter((a) => a.assetType === "TYPOGRAPHY");
  const mediaSpecs = assets.filter((a) => a.assetType === "MEDIA_REQUIREMENT");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Brand Studio Atmospheric Header */}
      <div className="surface-glass surface-glass-highlight rounded-3xl p-6 sm:p-8 border border-[var(--glass-border)] shadow-glass relative overflow-hidden">
        <AtmosphericBackground variant="header" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                OpenCV Vision & Colorimetric Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[var(--bg-surface-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                Brand Studio & Design System
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
              <span className="p-2 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-border)] shadow-xs">
                <Palette className="h-6 w-6" />
              </span>
              Visual Identity Studio
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Curate, test, and preview official brand colors, logo clearance stages, typography hierarchies, and social media constraints for{" "}
              <strong className="text-[var(--text-primary)] font-semibold">{activeBrand.name}</strong>.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsColorModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
              className="micro-lift font-medium"
            >
              Add Color
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTypographyModalOpen(true)}
              leftIcon={<Type className="h-4 w-4" />}
              className="micro-lift font-medium"
            >
              Add Font Spec
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsMediaSpecModalOpen(true)}
              leftIcon={<Layout className="h-4 w-4" />}
              className="micro-lift font-medium"
            >
              Add Media Spec
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setUploadError(null);
                setUploadFile(null);
                setUploadName("");
                setIsUploadModalOpen(true);
              }}
              leftIcon={<Upload className="h-4 w-4" />}
              className="font-bold shadow-glow micro-lift"
            >
              Upload Asset
            </Button>
          </div>
        </div>
      </div>

      {/* Studio Asset Telemetry Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs micro-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Palette Swatches</span>
            <Palette className="h-4 w-4 text-[var(--accent-primary)] opacity-80" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-[var(--text-primary)]">
              <AnimatedCounter value={colorSwatches.length} />
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">ΔE &lt; 25 tolerance</span>
          </div>
        </div>

        <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs micro-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Approved Lockups</span>
            <Crop className="h-4 w-4 text-cyan-400 opacity-80" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-[var(--text-primary)]">
              <AnimatedCounter value={logos.length} />
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">clearance-enforced</span>
          </div>
        </div>

        <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs micro-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Typography Stacks</span>
            <Type className="h-4 w-4 text-violet-400 opacity-80" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-[var(--text-primary)]">
              <AnimatedCounter value={typographySpecs.length} />
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">hierarchy rules</span>
          </div>
        </div>

        <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs micro-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Media Ratio Specs</span>
            <Layout className="h-4 w-4 text-emerald-400 opacity-80" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-[var(--text-primary)]">
              <AnimatedCounter value={mediaSpecs.length} />
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">channel constraints</span>
          </div>
        </div>
      </div>

      {/* Studio Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[var(--border-subtle)] scrollbar-none">
        {ASSET_TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          let count = assets.length;
          if (tab.id === "COLOR_SWATCH") count = colorSwatches.length;
          if (tab.id === "LOGO") count = logos.length;
          if (tab.id === "REFERENCE_IMAGE") count = referenceImages.length;
          if (tab.id === "TYPOGRAPHY") count = typographySpecs.length;
          if (tab.id === "MEDIA_REQUIREMENT") count = mediaSpecs.length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`interactive-pill px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? "bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border border-transparent"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected ? "bg-[var(--accent-primary)] text-white" : "bg-[var(--bg-surface-subtle)] text-[var(--text-muted)]"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="p-16 surface-glass rounded-3xl border border-[var(--glass-border)] text-center text-xs text-[var(--text-muted)] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-[var(--accent-primary)]" />
          <p className="font-medium text-[var(--text-secondary)]">Loading brand studio assets...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Color Palette Section */}
          {(activeTab === "ALL" || activeTab === "COLOR_SWATCH") && (
            <Card className="surface-glass surface-tactile border border-[var(--glass-border)] shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
                    <Palette className="h-4 w-4 text-[var(--accent-primary)]" />
                    Approved Chromatic Palette
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Deterministic OpenCV verification measures image color compliance and flags ΔE &gt; 25 deviations
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsColorModalOpen(true)}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  className="text-xs"
                >
                  Add Swatch
                </Button>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                {colorSwatches.length === 0 ? (
                  <EmptyState
                    preset="default"
                    title="No color swatches configured"
                    description="Define core and secondary brand colors for automatic OpenCV visual compliance checks."
                    actionLabel="Add First Swatch"
                    onAction={() => setIsColorModalOpen(true)}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {colorSwatches.map((swatch) => (
                      <div
                        key={swatch.id}
                        className="interactive-card micro-lift p-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] space-y-3 transition-all"
                      >
                        <div
                          className="h-24 w-full rounded-xl shadow-inner flex items-end justify-between p-2.5 relative overflow-hidden group/swatch"
                          style={{ backgroundColor: swatch.hexCode }}
                        >
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs shadow-xs">
                            {swatch.metadata_json?.role || "Brand Color"}
                          </span>
                          <button
                            onClick={() => handleCopyHex(swatch.hexCode || "")}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-transform active:scale-90 cursor-pointer shadow-xs"
                            title="Copy hex code to clipboard"
                          >
                            {copiedHex === swatch.hexCode ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <div>
                            <h4 className="font-bold text-[var(--text-primary)]">{swatch.name}</h4>
                            <p className="font-mono text-[11px] text-[var(--accent-text)] font-semibold mt-0.5">{swatch.hexCode}</p>
                            {swatch.metadata_json?.pantone && (
                              <p className="text-[10px] text-[var(--text-muted)] font-mono">Pantone: {swatch.metadata_json.pantone}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteAsset(swatch)}
                            className="text-[var(--text-muted)] hover:text-[var(--color-danger)] p-1.5 rounded-md hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                            title="Delete swatch"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Approved Logos Section with Live Contrast Stage */}
          {(activeTab === "ALL" || activeTab === "LOGO") && (
            <Card className="surface-glass surface-tactile border border-[var(--glass-border)] shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
                    <Crop className="h-4 w-4 text-[var(--accent-primary)]" />
                    Approved Brand Logos & Live Contrast Stage
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Deterministic logo clearance margins, aspect ratios, and live contrast testing against light/dark stages
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUploadType("LOGO");
                    setIsUploadModalOpen(true);
                  }}
                  leftIcon={<Upload className="h-3.5 w-3.5" />}
                  className="text-xs"
                >
                  Upload Logo
                </Button>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                {logos.length === 0 ? (
                  <EmptyState
                    preset="default"
                    title="No logos uploaded yet"
                    description="Upload your primary and secondary brand logos to verify safe margins and contrast compliance."
                    actionLabel="Upload Logo"
                    onAction={() => {
                      setUploadType("LOGO");
                      setIsUploadModalOpen(true);
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {logos.map((logo) => {
                      const stage = logoStages[logo.id] || "dark";
                      const stageBg =
                        stage === "light"
                          ? "bg-white border-slate-200"
                          : stage === "dark"
                          ? "bg-slate-950 border-slate-800"
                          : "bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[size:12px_12px] bg-slate-100 dark:bg-slate-900";

                      return (
                        <div
                          key={logo.id}
                          className="interactive-card micro-lift rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] p-4 space-y-3 transition-all"
                        >
                          {/* Live Stage Frame */}
                          <div
                            className={`h-36 w-full rounded-xl border flex items-center justify-center p-4 overflow-hidden relative group transition-colors duration-200 ${stageBg}`}
                          >
                            {logo.previewUrl ? (
                              <img
                                src={logo.previewUrl}
                                alt={logo.name}
                                className="max-h-full max-w-full object-contain filter drop-shadow-xs"
                              />
                            ) : (
                              <div className="text-center space-y-1">
                                <ImageIcon className="h-8 w-8 text-[var(--text-muted)] mx-auto opacity-60" />
                                <span className="text-[10px] font-mono text-[var(--text-muted)]">No preview file</span>
                              </div>
                            )}

                            {/* Contrast Stage Switcher Controls */}
                            <div className="absolute top-2 right-2 flex items-center gap-1 p-1 rounded-lg bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => setLogoStages((prev) => ({ ...prev, [logo.id]: "light" }))}
                                className={`p-1 rounded text-xs transition-colors ${stage === "light" ? "bg-white/30 text-white font-bold" : "text-white/70 hover:text-white"}`}
                                title="Light Contrast Stage"
                              >
                                <Sun className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setLogoStages((prev) => ({ ...prev, [logo.id]: "dark" }))}
                                className={`p-1 rounded text-xs transition-colors ${stage === "dark" ? "bg-white/30 text-white font-bold" : "text-white/70 hover:text-white"}`}
                                title="Dark Contrast Stage"
                              >
                                <Moon className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setLogoStages((prev) => ({ ...prev, [logo.id]: "checker" }))}
                                className={`p-1 rounded text-xs transition-colors ${stage === "checker" ? "bg-white/30 text-white font-bold" : "text-white/70 hover:text-white"}`}
                                title="Transparency Grid"
                              >
                                <Grid className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-[var(--text-primary)]">{logo.name}</h4>
                                <p className="text-[10px] font-mono text-[var(--text-muted)]">
                                  {logo.file_size_bytes ? `${Math.round(logo.file_size_bytes / 1024)} KB` : "Stored"} •{" "}
                                  {logo.mime_type || "image/svg+xml"}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteAsset(logo)}
                                className="text-[var(--text-muted)] hover:text-[var(--color-danger)] p-1 rounded-md transition-colors cursor-pointer"
                                title="Delete logo"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[var(--border-subtle)]">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)]">
                                Margin: {logo.clearanceMarginPx ? `${logo.clearanceMarginPx}px` : "16px"}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                                {logo.aspectRatio || "Free-Ratio"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reference Images Section */}
          {(activeTab === "ALL" || activeTab === "REFERENCE_IMAGE") && (
            <Card className="surface-glass surface-tactile border border-[var(--glass-border)] shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
                    <ImageIcon className="h-4 w-4 text-[var(--accent-primary)]" />
                    Approved Reference Imagery & Graphic Standards
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Pre-approved photography, diagrams, and illustrative assets used for brand visual audits
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUploadType("REFERENCE_IMAGE");
                    setIsUploadModalOpen(true);
                  }}
                  leftIcon={<Upload className="h-3.5 w-3.5" />}
                  className="text-xs"
                >
                  Upload Image
                </Button>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                {referenceImages.length === 0 ? (
                  <EmptyState
                    preset="default"
                    title="No reference images uploaded yet"
                    description="Curate approved stock photography, diagrams, and illustrative assets for brand visual audits."
                    actionLabel="Upload Image"
                    onAction={() => {
                      setUploadType("REFERENCE_IMAGE");
                      setIsUploadModalOpen(true);
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {referenceImages.map((img) => (
                      <div
                        key={img.id}
                        className="interactive-card micro-lift rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] p-4 space-y-3 transition-all"
                      >
                        <div className="h-36 w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center p-2 overflow-hidden">
                          {img.previewUrl ? (
                            <img
                              src={img.previewUrl}
                              alt={img.name}
                              className="max-h-full max-w-full object-cover rounded-lg"
                            />
                          ) : (
                            <ImageIcon className="h-10 w-10 text-[var(--text-muted)]" />
                          )}
                        </div>

                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-[var(--text-primary)]">{img.name}</h4>
                            <p className="text-[10px] font-mono text-[var(--text-muted)]">
                              {img.file_size_bytes ? `${Math.round(img.file_size_bytes / 1024)} KB` : "Uploaded"} •{" "}
                              {img.mime_type || "image/png"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteAsset(img)}
                            className="text-[var(--text-muted)] hover:text-[var(--color-danger)] p-1 rounded-md transition-colors cursor-pointer"
                            title="Delete image"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Typography Guidance Section with Live Font Specimen */}
          {(activeTab === "ALL" || activeTab === "TYPOGRAPHY") && (
            <Card className="surface-glass surface-tactile border border-[var(--glass-border)] shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
                    <Type className="h-4 w-4 text-[var(--accent-primary)]" />
                    Typography Guidance & Live Font Specimen Studio
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Enforces approved corporate font stacks, weights, and live font rendering
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTypographyModalOpen(true)}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  className="text-xs"
                >
                  Add Font Spec
                </Button>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                {typographySpecs.length === 0 ? (
                  <EmptyState
                    preset="default"
                    title="No typography specifications"
                    description="Configure brand font families and fallback stacks to verify design typography rules."
                    actionLabel="Add Font Spec"
                    onAction={() => setIsTypographyModalOpen(true)}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {typographySpecs.map((typo) => {
                      const family = typo.metadata_json?.family || typo.name;
                      const fallback = typo.metadata_json?.fallback || "sans-serif";
                      const weights: string[] = typo.metadata_json?.weights || ["400", "700"];

                      return (
                        <div
                          key={typo.id}
                          className="interactive-card micro-lift p-4.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] space-y-3 transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent-text)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded border border-[var(--accent-border)]">
                                {typo.metadata_json?.role || "Typography Spec"}
                              </span>
                              <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1.5">{family}</h4>
                              <p className="text-xs text-[var(--text-muted)] font-mono">
                                Fallback stack: {fallback}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteAsset(typo)}
                              className="text-[var(--text-muted)] hover:text-[var(--color-danger)] p-1 rounded-md transition-colors cursor-pointer"
                              title="Delete spec"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Live Font Specimen Preview */}
                          <div
                            className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1 shadow-inner"
                            style={{ fontFamily: `${family}, ${fallback}` }}
                          >
                            <p className="text-base text-[var(--text-primary)] font-bold tracking-tight">
                              Sphinx of black quartz, judge my vow.
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[var(--border-subtle)]">
                            <span className="text-[10px] font-mono text-[var(--text-muted)]">Approved Weights:</span>
                            {weights.map((w) => (
                              <span
                                key={w}
                                className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
                              >
                                {w}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Channel Media Requirements Section with Wireframe Previews */}
          {(activeTab === "ALL" || activeTab === "MEDIA_REQUIREMENT") && (
            <Card className="surface-glass surface-tactile border border-[var(--glass-border)] shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
                    <Layout className="h-4 w-4 text-[var(--accent-primary)]" />
                    Channel Media Requirements & Ratios
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Aspect ratios, wireframe dimensional containers, and maximum payload weights
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMediaSpecModalOpen(true)}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  className="text-xs"
                >
                  Add Media Spec
                </Button>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                {mediaSpecs.length === 0 ? (
                  <EmptyState
                    preset="default"
                    title="No media requirements saved"
                    description="Specify social banners, post aspect ratios, and dimension constraints."
                    actionLabel="Add Media Spec"
                    onAction={() => setIsMediaSpecModalOpen(true)}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mediaSpecs.map((spec) => (
                      <div
                        key={spec.id}
                        className="interactive-card micro-lift p-4.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] space-y-3 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent-text)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded border border-[var(--accent-border)]">
                              {spec.metadata_json?.channel || "Media Spec"}
                            </span>
                            <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1.5">{spec.name}</h4>
                          </div>
                          <button
                            onClick={() => handleDeleteAsset(spec)}
                            className="text-[var(--text-muted)] hover:text-[var(--color-danger)] p-1 rounded-md transition-colors cursor-pointer"
                            title="Delete spec"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Aspect Ratio Container Wireframe Preview */}
                        <div className="h-28 w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3 flex items-center justify-center">
                          <div
                            className="border-2 border-dashed border-[var(--accent-primary)]/70 bg-[var(--accent-subtle)]/40 rounded-lg flex items-center justify-center p-2 text-center"
                            style={{
                              width: spec.aspectRatio === "1:1" ? "80px" : spec.aspectRatio === "9:16" ? "48px" : "140px",
                              height: spec.aspectRatio === "9:16" ? "85px" : spec.aspectRatio === "1:1" ? "80px" : "72px",
                            }}
                          >
                            <span className="font-mono text-[10px] font-bold text-[var(--accent-text)]">
                              {spec.aspectRatio || "1.91:1"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[var(--border-subtle)]">
                          <div>
                            <span className="text-[10px] font-mono text-[var(--text-muted)] block">Min Resolution</span>
                            <strong className="font-mono text-[var(--text-primary)]">{spec.metadata_json?.min_resolution || "1200x628"}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-[var(--text-muted)] block">Max File Size</span>
                            <strong className="font-mono text-[var(--text-primary)]">{spec.metadata_json?.max_file_size_mb || "5"} MB</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add Color Swatch Modal */}
      <Modal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        title="Add Approved Brand Color"
        description="Add a hex color to the brand palette for deterministic OpenCV image audits."
        maxWidth="md"
      >
        <form onSubmit={handleSaveColorSwatch} className="space-y-4">
          <Input
            label="Swatch Name"
            placeholder="e.g. Nexus Primary Indigo"
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">
                Color Value (Hex Code)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="h-9 w-9 rounded-md border border-[var(--border-default)] cursor-pointer p-0.5 bg-transparent"
                />
                <Input
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  placeholder="#4F46E5"
                  className="font-mono uppercase flex-1"
                  required
                />
              </div>
            </div>

            <Select
              label="Palette Role"
              value={colorRole}
              onChange={(e) => setColorRole(e.target.value)}
              options={[
                { value: "Primary", label: "Primary Brand Color" },
                { value: "Secondary", label: "Secondary Accent" },
                { value: "Accent", label: "Interactive Accent" },
                { value: "Neutral", label: "Background / Neutral" },
              ]}
            />
          </div>

          <Input
            label="Pantone Reference (Optional)"
            placeholder="e.g. PMS 2728 C"
            value={colorPantone}
            onChange={(e) => setColorPantone(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="ghost" onClick={() => setIsColorModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSavingColor}>
              {isSavingColor ? "Saving..." : "Add to Palette"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Upload File Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Brand Asset File"
        description="Files are stored securely in the private tenant repository and validated against allowed MIME types."
        maxWidth="md"
      >
        <form onSubmit={handleUploadFile} className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded-lg bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-xs text-[var(--color-danger)] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {uploadError}
            </div>
          )}

          <Input
            label="Asset Title / Display Name"
            placeholder="e.g. Primary Horizontal Lockup Dark Mode"
            value={uploadName}
            onChange={(e) => setUploadName(e.target.value)}
            required
          />

          <Select
            label="Asset Classification"
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            options={[
              { value: "LOGO", label: "Brand Logo / Lockup" },
              { value: "REFERENCE_IMAGE", label: "Approved Reference Graphic" },
            ]}
          />

          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">
              Select Image File (PNG, JPEG, WEBP, SVG &lt;= 10MB)
            </label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.svg"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="text-xs w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--accent-subtle)] file:text-[var(--accent-primary)] hover:file:bg-[var(--accent-subtle)] cursor-pointer text-[var(--text-secondary)]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="ghost" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isUploading}>
              {isUploading ? "Uploading & Inspecting..." : "Upload & Secure"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Typography Modal */}
      <Modal
        isOpen={isTypographyModalOpen}
        onClose={() => setIsTypographyModalOpen(false)}
        title="Add Typography Hierarchy Spec"
        description="Configure approved font family, fallback stack, and permitted font weights."
        maxWidth="md"
      >
        <form onSubmit={handleSaveTypography} className="space-y-4">
          <Input
            label="Font Family Name"
            placeholder="e.g. Inter, Plus Jakarta Sans, IBM Plex Mono"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Hierarchy Role"
              value={fontRole}
              onChange={(e) => setFontRole(e.target.value)}
              options={[
                { value: "Headings", label: "Headings / Display" },
                { value: "Body", label: "Body Copy" },
                { value: "Code", label: "Code & Monospace" },
                { value: "Captions", label: "Captions & Metadata" },
              ]}
            />
            <Input
              label="Fallback Generic"
              placeholder="e.g. sans-serif, system-ui"
              value={fontFallback}
              onChange={(e) => setFontFallback(e.target.value)}
            />
          </div>

          <Input
            label="Approved Font Weights"
            placeholder="e.g. 400, 600, 700"
            value={fontWeights}
            onChange={(e) => setFontWeights(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="ghost" onClick={() => setIsTypographyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Typography Spec
            </Button>
          </div>
        </form>
      </Modal>

      {/* Media Spec Modal */}
      <Modal
        isOpen={isMediaSpecModalOpen}
        onClose={() => setIsMediaSpecModalOpen(false)}
        title="Add Media Requirement Spec"
        description="Define channel-specific aspect ratios, resolution floors, and maximum payload sizes."
        maxWidth="md"
      >
        <form onSubmit={handleSaveMediaSpec} className="space-y-4">
          <Input
            label="Channel / Medium Placement"
            placeholder="e.g. LinkedIn Feed Post, X Card, OpenGraph Hero"
            value={specChannel}
            onChange={(e) => setSpecChannel(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mandatory Aspect Ratio"
              placeholder="e.g. 1.91:1, 1:1, 16:9"
              value={specAspectRatio}
              onChange={(e) => setSpecAspectRatio(e.target.value)}
              required
            />
            <Input
              label="Minimum Resolution (WxH)"
              placeholder="e.g. 1200x628"
              value={specMinResolution}
              onChange={(e) => setSpecMinResolution(e.target.value)}
            />
          </div>

          <Input
            label="Max File Size (MB)"
            type="number"
            placeholder="5"
            value={specMaxMb}
            onChange={(e) => setSpecMaxMb(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="ghost" onClick={() => setIsMediaSpecModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Media Spec
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
