import React from "react";
import { useTheme } from "../context/ThemeContext";

export interface AtmosphericBackgroundProps {
  /** "canvas" for global full-screen viewport atmosphere (default),
   *  "header" for contained, restrained page banner glow,
   *  "section" for localized subtle container depth
   */
  variant?: "canvas" | "header" | "section";
  className?: string;
  intensity?: "subtle" | "normal" | "vibrant";
}

/**
 * AtmosphericBackground
 *
 * Production-quality cinematic atmospheric lighting and animated background system.
 * Combines multiple large, softly blurred radial gradients drifting across the viewport
 * over 22-32s cycles with GPU-accelerated transforms (translate3d).
 * 
 * Includes:
 * 1. Restrained mesh-gradient base for depth separation
 * 2. Multi-orb chromatic diffusion dynamically tinted by user's active accent palette
 * 3. Autonomous motion control (toggled via user setting or OS prefers-reduced-motion)
 * 4. Technical micro-grid texture preventing color banding
 * 5. Stacking-safe non-interfering layer (pointer-events-none, z-0)
 */
export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({
  variant = "canvas",
  className = "",
  intensity = "normal",
}) => {
  const { resolvedThemeMode, isMotionReduced } = useTheme();

  // Opacity multipliers based on intensity prop
  const opacityMultiplier =
    intensity === "subtle" ? 0.6 : intensity === "vibrant" ? 1.25 : 1.0;

  // --- Variant: Header (Restrained, localized banner glow) ---
  if (variant === "header" || variant === "section") {
    return (
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 rounded-2xl transition-opacity duration-700 ${
          isMotionReduced ? "ambient-motion-disabled" : ""
        } ${className}`}
      >
        {/* Subtle mesh substrate */}
        <div
          className="absolute inset-0 transition-colors duration-700"
          style={{
            background:
              resolvedThemeMode === "dark"
                ? "radial-gradient(ellipse at 80% 20%, var(--ambient-glow-1) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, var(--ambient-glow-2) 0%, transparent 60%)"
                : "radial-gradient(ellipse at 80% 20%, var(--ambient-glow-1) 0%, transparent 65%), radial-gradient(ellipse at 20% 80%, var(--ambient-glow-2) 0%, transparent 65%)",
            opacity: 0.7 * opacityMultiplier,
          }}
        />

        {/* Localized Floating Orb Alpha */}
        <div
          className="ambient-orb absolute -top-[30%] -right-[15%] w-[380px] h-[380px] rounded-full blur-[80px] animate-ambient-drift-alpha transition-colors duration-1000 will-change-transform"
          style={{
            background: "radial-gradient(circle, var(--ambient-glow-1) 0%, transparent 70%)",
            opacity: (resolvedThemeMode === "dark" ? 0.65 : 0.8) * opacityMultiplier,
          }}
        />

        {/* Localized Floating Orb Beta */}
        <div
          className="ambient-orb absolute -bottom-[30%] -left-[10%] w-[320px] h-[320px] rounded-full blur-[85px] animate-ambient-drift-beta transition-colors duration-1000 will-change-transform"
          style={{
            background: "radial-gradient(circle, var(--ambient-glow-2) 0%, transparent 70%)",
            opacity: (resolvedThemeMode === "dark" ? 0.5 : 0.65) * opacityMultiplier,
          }}
        />

        {/* Localized Micro-Grid Texture */}
        <div className="absolute inset-0 tech-grid-overlay opacity-20 dark:opacity-10" />
      </div>
    );
  }

  // --- Variant: Canvas (Global Viewport Atmosphere) ---
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-700 ${
        isMotionReduced ? "ambient-motion-disabled" : ""
      } ${className}`}
    >
      {/* Layer 1: Restrained Mesh Gradient Base Canvas for physical depth */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background:
            resolvedThemeMode === "dark"
              ? "radial-gradient(at 0% 0%, var(--ambient-glow-1) 0px, transparent 50%), radial-gradient(at 100% 0%, var(--ambient-glow-2) 0px, transparent 50%), radial-gradient(at 50% 100%, var(--ambient-glow-3) 0px, transparent 50%), var(--bg-app)"
              : "radial-gradient(at 0% 0%, var(--ambient-glow-1) 0px, transparent 55%), radial-gradient(at 100% 0%, var(--ambient-glow-2) 0px, transparent 50%), radial-gradient(at 50% 100%, var(--ambient-glow-3) 0px, transparent 55%), var(--bg-app)",
          opacity: 0.85 * opacityMultiplier,
        }}
      />

      {/* Layer 2: Ambient Floating Light Orb Alpha (Primary Accent - 22s drift cycle) */}
      <div
        className="ambient-orb absolute -top-[12%] left-[4%] w-[68vw] max-w-[950px] h-[68vw] max-h-[950px] rounded-full blur-[120px] animate-ambient-drift-alpha transition-colors duration-1000 will-change-transform"
        style={{
          background: "radial-gradient(circle, var(--ambient-glow-1) 0%, transparent 70%)",
          opacity: (resolvedThemeMode === "dark" ? 0.75 : 0.85) * opacityMultiplier,
        }}
      />

      {/* Layer 3: Ambient Floating Light Orb Beta (Harmonic Violet/Champagne - 28s drift cycle) */}
      <div
        className="ambient-orb absolute top-[22%] -right-[8%] w-[58vw] max-w-[800px] h-[58vw] max-h-[800px] rounded-full blur-[130px] animate-ambient-drift-beta transition-colors duration-1000 will-change-transform"
        style={{
          background: "radial-gradient(circle, var(--ambient-glow-2) 0%, transparent 70%)",
          opacity: (resolvedThemeMode === "dark" ? 0.65 : 0.75) * opacityMultiplier,
        }}
      />

      {/* Layer 4: Ambient Floating Light Orb Gamma (Cyan Reflection/Opal Blue - 24s drift cycle) */}
      <div
        className="ambient-orb absolute -bottom-[15%] left-[18%] w-[62vw] max-w-[850px] h-[62vw] max-h-[850px] rounded-full blur-[140px] animate-ambient-drift-gamma transition-colors duration-1000 will-change-transform"
        style={{
          background: "radial-gradient(circle, var(--ambient-glow-3) 0%, transparent 70%)",
          opacity: (resolvedThemeMode === "dark" ? 0.55 : 0.7) * opacityMultiplier,
        }}
      />

      {/* Layer 5: Deep Atmospheric Core Diffusion (Connective substrate - 32s pulse cycle) */}
      <div
        className="ambient-orb absolute top-[35%] left-[25%] w-[50vw] max-w-[700px] h-[50vw] max-h-[700px] rounded-full blur-[150px] animate-ambient-drift-core transition-colors duration-1000 will-change-transform"
        style={{
          background: "radial-gradient(circle, var(--ambient-glow-1) 0%, transparent 75%)",
          opacity: (resolvedThemeMode === "dark" ? 0.4 : 0.55) * opacityMultiplier,
        }}
      />

      {/* Layer 6: Mathematical Micro-Grid Pattern Overlay for Cinematic Tactile Texture */}
      <div className="absolute inset-0 tech-grid-overlay opacity-30 dark:opacity-15" />

      {/* Layer 7: Soft Perimeter Vignette Depth */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background:
            resolvedThemeMode === "dark"
              ? "radial-gradient(ellipse at center, transparent 40%, rgba(6, 10, 18, 0.65) 100%)"
              : "radial-gradient(ellipse at center, transparent 48%, rgba(226, 232, 240, 0.5) 100%)",
        }}
      />
    </div>
  );
};
