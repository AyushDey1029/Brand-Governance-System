import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Layers,
  Compass,
  X,
  ShieldCheck,
  Check,
  TrendingUp,
  AlertCircle,
  Play,
  Pause,
  Sliders,
  Droplets,
  Gauge,
  Eye,
  RefreshCw,
  FileText,
  Activity,
  Zap,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
  AccentColor,
  VisualPresetId,
  SurfaceTranslucency,
  MotionIntensity,
} from "../types";
import { Button } from "../design-system/Button";
import { Badge } from "../design-system/Badge";
import { Card, CardContent } from "../design-system/Card";
import { useNotification } from "../context/NotificationContext";

export interface ThemeCustomizerProps {
  /** If "card", renders as an embedded panel (used in Workspace Settings).
   *  If "drawer", renders as a slide-over panel with backdrop (triggered from header).
   */
  variant?: "card" | "drawer";
  onClose?: () => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  variant = "card",
  onClose,
}) => {
  const {
    themeMode,
    resolvedThemeMode,
    accentColor,
    ambientMotion,
    isMotionReduced,
    visualPreset,
    surfaceTranslucency,
    motionIntensity,
    presets,
    setThemeMode,
    setAccentColor,
    setAmbientMotion,
    setVisualPreset,
    applyPreset,
    setSurfaceTranslucency,
    setMotionIntensity,
    resetToDefault,
    isDefault,
    accentOptions,
  } = useTheme();

  const { showToast } = useNotification();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Confirmation state for restoring sovereign defaults
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Playground interactive state
  const [playgroundNav, setPlaygroundNav] = useState<"overview" | "facts" | "studio">("overview");
  const [playgroundAuditScore, setPlaygroundAuditScore] = useState<number>(96.8);
  const [isAuditing, setIsAuditing] = useState(false);
  const [findingRemediated, setFindingRemediated] = useState(false);

  // Handle escape key to close drawer or dismiss reset confirmation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showResetConfirm) {
          setShowResetConfirm(false);
        } else if (variant === "drawer" && onClose) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [variant, onClose, showResetConfirm]);

  const handleConfirmReset = () => {
    resetToDefault();
    setShowResetConfirm(false);
    showToast({
      type: "info",
      title: "Theme Reset",
      message: "Restored sovereign default theme (Dark Mode + Indigo + Midnight).",
    });
  };

  const handleRunPlaygroundAudit = () => {
    if (isAuditing) return;
    setIsAuditing(true);
    setTimeout(() => {
      setPlaygroundAuditScore((prev) => (prev >= 98 ? 94.5 : Number((prev + 1.6).toFixed(1))));
      setIsAuditing(false);
      showToast({
        type: "success",
        title: "Playground Audit Complete",
        message: "Live telemetry updated across sample interface.",
      });
    }, 600);
  };

  const currentAccent = accentOptions.find((a) => a.id === accentColor) || accentOptions[0];
  const activePresetObj = presets.find((p) => p.id === visualPreset) || presets[0];

  const content = (
    <div className="space-y-8">
      {/* Top Header info & Reset Action with Confirmation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent-text)]">
              <Palette className="h-4 w-4 text-[var(--accent-primary)]" />
            </span>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Visual Identity Playground
            </h3>
            <Badge variant="brand" size="sm">
              {themeMode === "system"
                ? `System (${resolvedThemeMode === "dark" ? "Dark" : "Light"})`
                : themeMode === "dark"
                ? "Dark"
                : "Light"}{" "}
              • {currentAccent.label} • {activePresetObj.label}
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
            Curate your brand governance experience with coordinated visual presets, granular ambient lighting, surface translucency, and motion velocity. All changes update the live interface instantly and persist across sessions.
          </p>
        </div>

        {/* Reset Action / Inline Confirmation */}
        <div className="flex items-center gap-2 shrink-0">
          {showResetConfirm ? (
            <div
              className="flex items-center gap-2 p-1.5 rounded-lg border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] animate-in fade-in zoom-in-95 duration-150"
              role="alertdialog"
              aria-label="Confirm theme reset"
            >
              <AlertCircle className="h-3.5 w-3.5 text-[var(--color-warning-solid)] shrink-0" />
              <span className="text-xs font-medium text-[var(--text-primary)]">
                Reset all to default?
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmReset}
                className="text-xs h-7 px-2.5"
              >
                Confirm
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
                className="text-xs h-7 px-2"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant={isDefault ? "outline" : "secondary"}
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              disabled={isDefault}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              title={isDefault ? "Currently configured to sovereign default" : "Restore sovereign default: Dark Mode + Indigo + Midnight"}
              className="text-xs"
            >
              {isDefault ? "Sovereign Default" : "Restore Defaults"}
            </Button>
          )}

          {variant === "drawer" && onClose && (
            <button
              onClick={onClose}
              aria-label="Close Theme Customizer"
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------------------
          1. Curated Visual Presets (Coordinated Bundles: Aurora, Midnight, Nebula, Oceanic, Minimal)
         ---------------------------------------------------------------------- */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
              1. Curated Visual Presets
            </span>
            <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-surface-subtle)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
              1-Click Harmony
            </span>
          </div>
          <span className="text-xs text-[var(--text-secondary)]">
            Active: <strong className="text-[var(--text-primary)]">{activePresetObj.label}</strong>
          </span>
        </div>

        <div
          role="radiogroup"
          aria-label="Curated Visual Presets"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
        >
          {presets.map((preset) => {
            const isSelected = preset.id === visualPreset;
            return (
              <button
                key={preset.id}
                type="button"
                role="radio"
                tabIndex={0}
                aria-checked={isSelected}
                aria-label={`Select ${preset.label} preset: ${preset.tagline}`}
                onClick={() => {
                  applyPreset(preset.id);
                  showToast({
                    type: "info",
                    title: `Preset Applied: ${preset.label}`,
                    message: `Applied ${preset.label} lighting, ${preset.accentColor} accent, and ${preset.translucency} glass.`,
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    applyPreset(preset.id);
                    showToast({
                      type: "info",
                      title: `Preset Applied: ${preset.label}`,
                      message: `Applied ${preset.label} lighting, ${preset.accentColor} accent, and ${preset.translucency} glass.`,
                    });
                  }
                }}
                className={`group relative flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-2 ${
                  isSelected
                    ? "border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-ring)] shadow-sm"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-surface)]"
                }`}
              >
                <div>
                  {/* Chromatic Multi-Stop Gradient Bar */}
                  <div
                    className="h-2.5 w-full rounded-full mb-3 shadow-xs border border-white/10 overflow-hidden transition-transform group-hover:scale-102"
                    style={{
                      background: `linear-gradient(90deg, ${preset.previewColors[0]}, ${preset.previewColors[1]}, ${preset.previewColors[2]})`,
                    }}
                    aria-hidden="true"
                  />

                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {preset.label}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-[var(--accent-primary)] shrink-0" />
                    ) : (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                        {preset.accentColor}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-medium text-[var(--accent-text)] line-clamp-1 mb-1.5">
                    {preset.tagline}
                  </p>

                  <p className="text-[10px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                {/* Characteristics Badges */}
                <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[9px] text-[var(--text-muted)] font-mono">
                  <span className="capitalize">{preset.translucency}</span>
                  <span className="capitalize">{preset.motionIntensity}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ----------------------------------------------------------------------
          2. Granular Appearance Mode & Accent Palette
         ---------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Mode: System / Dark / Light */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
              2A. Appearance Mode
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              Active:{" "}
              <strong className="text-[var(--text-primary)] capitalize">
                {themeMode === "system" ? `System (${resolvedThemeMode})` : `${themeMode}`}
              </strong>
            </span>
          </div>

          <div
            role="radiogroup"
            aria-label="Appearance Mode Selection"
            className="grid grid-cols-3 gap-2.5"
          >
            {/* System */}
            <button
              type="button"
              role="radio"
              tabIndex={0}
              aria-checked={themeMode === "system"}
              onClick={() => setThemeMode("system")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] ${
                themeMode === "system"
                  ? "border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-ring)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--border-default)]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Monitor className="h-4 w-4 text-[var(--accent-primary)]" />
                {themeMode === "system" && <Check className="h-3.5 w-3.5 text-[var(--accent-primary)]" />}
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">System</div>
              <div className="text-[10px] text-[var(--text-muted)] truncate">Syncs with OS</div>
            </button>

            {/* Dark */}
            <button
              type="button"
              role="radio"
              tabIndex={0}
              aria-checked={themeMode === "dark"}
              onClick={() => setThemeMode("dark")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] ${
                themeMode === "dark"
                  ? "border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-ring)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--border-default)]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Moon className="h-4 w-4 text-indigo-400" />
                {themeMode === "dark" && <Check className="h-3.5 w-3.5 text-[var(--accent-primary)]" />}
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Dark Mode</div>
              <div className="text-[10px] text-[var(--text-muted)] truncate">Deep slate</div>
            </button>

            {/* Light */}
            <button
              type="button"
              role="radio"
              tabIndex={0}
              aria-checked={themeMode === "light"}
              onClick={() => setThemeMode("light")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] ${
                themeMode === "light"
                  ? "border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-ring)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--border-default)]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Sun className="h-4 w-4 text-amber-500" />
                {themeMode === "light" && <Check className="h-3.5 w-3.5 text-[var(--accent-primary)]" />}
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Light Mode</div>
              <div className="text-[10px] text-[var(--text-muted)] truncate">Warm daylight</div>
            </button>
          </div>
        </div>

        {/* Accent Color Palette: 7 choices */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
              2B. Accent Palette
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              Selected: <strong className="text-[var(--text-primary)]">{currentAccent.label}</strong>
            </span>
          </div>

          <div
            role="radiogroup"
            aria-label="Accent Palette Selection"
            className="grid grid-cols-7 gap-2"
          >
            {accentOptions.map((opt) => {
              const isSelected = opt.id === accentColor;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  tabIndex={0}
                  aria-checked={isSelected}
                  title={`${opt.label}: ${opt.description}`}
                  onClick={() => {
                    setAccentColor(opt.id as AccentColor);
                    showToast({
                      type: "info",
                      title: "Accent Updated",
                      message: `Accent color changed to ${opt.label}.`,
                    });
                  }}
                  className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] ${
                    isSelected
                      ? "border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-ring)] scale-105"
                      : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--border-default)]"
                  }`}
                >
                  <span
                    className="relative h-6 w-6 rounded-full shrink-0 flex items-center justify-center shadow-xs transition-transform group-hover:scale-110"
                    style={{ backgroundColor: opt.previewColor }}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                  </span>
                  <span className="text-[10px] font-medium text-[var(--text-primary)] mt-1.5 truncate max-w-full">
                    {opt.label.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------------
          3. Surface Translucency & Motion Velocity Controls
         ---------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Surface Translucency Selector */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-[var(--accent-subtle)] text-[var(--accent-text)]">
                <Droplets className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
              </span>
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Surface Translucency
              </h4>
            </div>
            <Badge variant="neutral" size="sm" className="capitalize">
              {surfaceTranslucency} Glass
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Controls frosted glassmorphism diffusion, card backdrop blur, and depth absorption.
          </p>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {/* Solid */}
            <button
              type="button"
              onClick={() => setSurfaceTranslucency("solid")}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                surfaceTranslucency === "solid"
                  ? "border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-ring)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--border-default)]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[var(--text-primary)]">Solid</span>
                {surfaceTranslucency === "solid" && <Check className="h-3 w-3 text-[var(--accent-primary)]" />}
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">Opaque, crisp contrast, 0 blur</p>
            </button>

            {/* Medium */}
            <button
              type="button"
              onClick={() => setSurfaceTranslucency("medium")}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                surfaceTranslucency === "medium"
                  ? "border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-ring)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--border-default)]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[var(--text-primary)]">Medium</span>
                {surfaceTranslucency === "medium" && <Check className="h-3 w-3 text-[var(--accent-primary)]" />}
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">16px blur, balanced frosted glass</p>
            </button>

            {/* Heavy */}
            <button
              type="button"
              onClick={() => setSurfaceTranslucency("heavy")}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                surfaceTranslucency === "heavy"
                  ? "border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-ring)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--border-default)]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[var(--text-primary)]">Heavy</span>
                {surfaceTranslucency === "heavy" && <Check className="h-3 w-3 text-[var(--accent-primary)]" />}
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">28px blur, deep refraction</p>
            </button>
          </div>
        </div>

        {/* Atmospheric Ambient Motion & Velocity Setting */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-[var(--accent-subtle)] text-[var(--accent-text)]">
                <Gauge className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
              </span>
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Atmospheric Ambient Motion
              </h4>
              <Badge variant={isMotionReduced ? "neutral" : "glow"} size="sm" className="capitalize">
                {isMotionReduced ? "Paused" : `${motionIntensity} Velocity`}
              </Badge>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={ambientMotion && motionIntensity !== "paused"}
              aria-label="Toggle atmospheric ambient motion"
              onClick={() => {
                const nextVal = !ambientMotion || motionIntensity === "paused";
                setAmbientMotion(nextVal);
                showToast({
                  type: "info",
                  title: nextVal ? "Ambient Motion Enabled" : "Ambient Motion Paused",
                  message: nextVal
                    ? "Atmospheric gradient drift active."
                    : "Static balanced gradient composition active.",
                });
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] ${
                ambientMotion && motionIntensity !== "paused" ? "bg-[var(--accent-primary)]" : "bg-[var(--border-strong)]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  ambientMotion && motionIntensity !== "paused" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Controls organic viewport luminous gradient drift cycles and velocity.
          </p>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {/* Paused */}
            <button
              type="button"
              onClick={() => setMotionIntensity("paused")}
              className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                motionIntensity === "paused"
                  ? "border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-ring)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--border-default)]"
              }`}
            >
              <Pause className="h-3.5 w-3.5 mx-auto mb-1 text-[var(--text-muted)]" />
              <div className="text-xs font-bold text-[var(--text-primary)]">Paused</div>
              <div className="text-[9px] text-[var(--text-muted)]">Static</div>
            </button>

            {/* Gentle */}
            <button
              type="button"
              onClick={() => setMotionIntensity("gentle")}
              className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                motionIntensity === "gentle"
                  ? "border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-ring)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--border-default)]"
              }`}
            >
              <Play className="h-3.5 w-3.5 mx-auto mb-1 text-[var(--accent-primary)]" />
              <div className="text-xs font-bold text-[var(--text-primary)]">Gentle</div>
              <div className="text-[9px] text-[var(--text-muted)]">44s cycle</div>
            </button>

            {/* Normal */}
            <button
              type="button"
              onClick={() => setMotionIntensity("normal")}
              className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                motionIntensity === "normal"
                  ? "border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-ring)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--border-default)]"
              }`}
            >
              <Zap className="h-3.5 w-3.5 mx-auto mb-1 text-[var(--accent-primary)]" />
              <div className="text-xs font-bold text-[var(--text-primary)]">Normal</div>
              <div className="text-[9px] text-[var(--text-muted)]">25s cycle</div>
            </button>

            {/* Vibrant */}
            <button
              type="button"
              onClick={() => setMotionIntensity("vibrant")}
              className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                motionIntensity === "vibrant"
                  ? "border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-ring)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:border-[var(--border-default)]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 mx-auto mb-1 text-[var(--accent-primary)]" />
              <div className="text-xs font-bold text-[var(--text-primary)]">Vibrant</div>
              <div className="text-[9px] text-[var(--text-muted)]">13s cycle</div>
            </button>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------------
          4. Genuinely Interactive Visual Identity Playground Sandbox
             (Miniature sample of the actual Inkloom application interface)
         ---------------------------------------------------------------------- */}
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface-elevated)] p-5 sm:p-6 space-y-5 shadow-lg relative overflow-hidden">
        {/* Top Control Bar for Playground */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-[var(--accent-primary)]" />
              <h4 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">
                Interactive Application Sandbox
              </h4>
              <Badge variant="glow" size="sm">
                Live DOM Preview
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Interact with genuine Inkloom navigation, metric cards, finding badges, and actions to test optical ergonomics.
            </p>
          </div>

          {/* Live Telemetry Chips */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-[var(--text-muted)]">
            <span className="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--accent-text)] font-semibold">
              preset: {visualPreset}
            </span>
            <span className="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              translucency: {surfaceTranslucency}
            </span>
            <span className="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              motion: {isMotionReduced ? "paused" : motionIntensity}
            </span>
          </div>
        </div>

        {/* The Live Interactive Mini-Application Frame */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] p-4 sm:p-5 relative shadow-inner overflow-hidden">
          {/* Ambient Lighting Overlay inside preview matching global atmosphere */}
          <div
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background:
                resolvedThemeMode === "dark"
                  ? "radial-gradient(circle at 80% 10%, var(--ambient-glow-1) 0%, transparent 50%), radial-gradient(circle at 20% 90%, var(--ambient-glow-2) 0%, transparent 50%)"
                  : "radial-gradient(circle at 80% 10%, var(--ambient-glow-1) 0%, transparent 60%), radial-gradient(circle at 20% 90%, var(--ambient-glow-2) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-10 space-y-4">
            {/* 1. Mini Top App Header */}
            <div className="surface-glass rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-[var(--accent-primary)] text-[var(--accent-contrast)] flex items-center justify-center font-bold text-xs shadow-xs">
                  IN
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    Inkloom Governance Suite
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-[var(--accent-subtle)] text-[var(--accent-text)]">
                      v2.4
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">Acme Corp Brand Workspace</div>
                </div>
              </div>

              {/* Mini Navigation Links */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setPlaygroundNav("overview")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    playgroundNav === "overview"
                      ? "bg-[var(--accent-subtle)] text-[var(--accent-text)] font-semibold shadow-xs"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)]"
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setPlaygroundNav("facts")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    playgroundNav === "facts"
                      ? "bg-[var(--accent-subtle)] text-[var(--accent-text)] font-semibold shadow-xs"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)]"
                  }`}
                >
                  Golden Facts
                </button>
                <button
                  type="button"
                  onClick={() => setPlaygroundNav("studio")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    playgroundNav === "studio"
                      ? "bg-[var(--accent-subtle)] text-[var(--accent-text)] font-semibold shadow-xs"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)]"
                  }`}
                >
                  Creator Studio
                </button>
              </div>

              {/* Primary Interactive Action: Run Test Audit */}
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunPlaygroundAudit}
                disabled={isAuditing}
                leftIcon={<RefreshCw className={`h-3 w-3 ${isAuditing ? "animate-spin" : ""}`} />}
                className="text-xs h-7 px-3"
              >
                {isAuditing ? "Auditing..." : "Run Test Audit"}
              </Button>
            </div>

            {/* 2. Mini Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Metric Card 1: Compliance Score */}
              <div className="surface-glass rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium">
                  <span>Compliance Score</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-0.5 text-[10px]">
                    <TrendingUp className="h-3 w-3" /> +1.8%
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
                    {playgroundAuditScore}%
                  </span>
                  <span className="text-[10px] text-emerald-500 font-semibold">Tier 1 Sovereign</span>
                </div>
                {/* Mini Progress Bar */}
                <div className="h-1.5 w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500"
                    style={{ width: `${playgroundAuditScore}%` }}
                  />
                </div>
              </div>

              {/* Metric Card 2: Golden Fact Verification */}
              <div className="surface-glass rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium">
                  <span>Golden Facts Vault</span>
                  <Badge variant="brand" size="sm">142 Facts</Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
                    100%
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">Synchronized</span>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] line-clamp-1">
                  Zero stale references detected in enterprise corpus.
                </p>
              </div>

              {/* Metric Card 3: Active Rule Governance */}
              <div className="surface-glass rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium">
                  <span>Enforced Policies</span>
                  <Activity className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
                    28 Rules
                  </span>
                  <span className="text-[10px] text-[var(--accent-text)] font-semibold">Active Engine</span>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] line-clamp-1">
                  Tone, terminology, and legal claim boundaries enforced.
                </p>
              </div>
            </div>

            {/* 3. Representative Interactive Finding Card */}
            <div className="surface-glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[var(--border-default)]">
              <div className="flex items-start gap-3">
                <span className="p-2 rounded-lg bg-[var(--color-warning-bg)] text-[var(--color-warning-solid)] shrink-0 border border-[var(--color-warning-border)]">
                  <AlertCircle className="h-4 w-4" />
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {findingRemediated
                        ? "Claim Aligned with Golden Facts"
                        : "Unverified Claim Detected in Draft"}
                    </span>
                    <Badge variant={findingRemediated ? "success" : "warning"} size="sm">
                      {findingRemediated ? "Remediated" : "Resolvable Warning"}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {findingRemediated
                      ? "“Inkloom provides enterprise 99.99% availability per SLA v2026.1.”"
                      : "“Inkloom provides zero-downtime infinite cloud architecture.”"}
                  </p>
                </div>
              </div>

              <Button
                variant={findingRemediated ? "outline" : "secondary"}
                size="sm"
                onClick={() => setFindingRemediated(!findingRemediated)}
                leftIcon={findingRemediated ? <Check className="h-3 w-3" /> : <Sparkles className="h-3 w-3 text-[var(--accent-primary)]" />}
                className="text-xs shrink-0"
              >
                {findingRemediated ? "Undo Revision" : "Auto-Remediate"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === "drawer") {
    return (
      <div
        className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Theme Customizer"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Slide-over panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div
            ref={drawerRef}
            className="w-screen max-w-3xl bg-[var(--bg-surface)] border-l border-[var(--border-default)] shadow-2xl p-6 sm:p-8 overflow-y-auto"
          >
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Variant "card" (embedded)
  return (
    <Card className="overflow-hidden border border-[var(--border-subtle)] shadow-xs">
      <CardContent className="p-6 sm:p-8">{content}</CardContent>
    </Card>
  );
};
