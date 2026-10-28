import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, Palette, Check, ChevronDown, Sliders } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { AccentColor, ThemeMode } from "../types";

export interface ThemeSwitcherProps {
  compact?: boolean;
  showLabels?: boolean;
  modeOnly?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  compact = false, 
  showLabels = false,
  modeOnly = false 
}) => {
  const {
    themeMode,
    resolvedThemeMode,
    accentColor,
    setThemeMode,
    toggleThemeMode,
    setAccentColor,
    accentOptions,
  } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = accentOptions.find((a) => a.id === accentColor) || accentOptions[0];

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleSelectAccent = (colorId: AccentColor) => {
    setAccentColor(colorId);
    setDropdownOpen(false);
  };

  const getToggleTitle = () => {
    if (themeMode === "system") {
      return `Appearance: System (${resolvedThemeMode === "dark" ? "Dark" : "Light"}). Click to switch to ${resolvedThemeMode === "dark" ? "Light" : "Dark"} Mode`;
    }
    return themeMode === "dark" ? "Appearance: Dark Mode. Click to switch to Light Mode" : "Appearance: Light Mode. Click to switch to Dark Mode";
  };

  return (
    <div className="flex items-center gap-1.5" role="toolbar" aria-label="Theme & Appearance Controls">
      {/* 1. Compact Accessible Light / Dark / System Mode Toggle */}
      <button
        type="button"
        onClick={toggleThemeMode}
        title={getToggleTitle()}
        aria-label={getToggleTitle()}
        className="h-9 px-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-surface)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
      >
        {themeMode === "system" ? (
          <Monitor className="h-4 w-4 text-[var(--accent-primary)] transition-transform duration-200" />
        ) : themeMode === "dark" ? (
          <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-12" />
        ) : (
          <Moon className="h-4 w-4 text-[var(--accent-text)] transition-transform duration-200 hover:-rotate-12" />
        )}
        {showLabels && (
          <span className="text-xs font-medium capitalize">
            {themeMode === "system" ? `System (${resolvedThemeMode})` : `${themeMode} Mode`}
          </span>
        )}
      </button>

      {/* 2. Theme Selector Dropdown (Rendered only if NOT modeOnly) */}
      {!modeOnly && (
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            aria-label={`Current accent: ${activeOption.label}, Appearance: ${themeMode}. Click to configure theme.`}
            title={`Theme: ${activeOption.label} • ${themeMode === "system" ? "System" : themeMode} (Click to switch)`}
            className="h-9 flex items-center gap-2 px-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-surface)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] shadow-xs"
          >
            {/* Active Accent Swatch Dot with subtle glow ring */}
            <span
              className="h-3.5 w-3.5 rounded-full shrink-0 ring-2 ring-[var(--accent-border)] ring-offset-1 ring-offset-[var(--bg-surface-subtle)] shadow-xs transition-transform"
              style={{ backgroundColor: activeOption.previewColor }}
            />
            {!compact && (
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {activeOption.label}
              </span>
            )}
            <ChevronDown
              className={`h-3 w-3 text-[var(--text-muted)] transition-transform duration-150 ${
                dropdownOpen ? "rotate-180 text-[var(--accent-primary)]" : ""
              }`}
            />
          </button>

          {/* Popover Menu with Accessible Swatches */}
          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-64 surface-glass surface-glass-highlight border border-[var(--border-default)] rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100"
              role="dialog"
              aria-label="Select accent theme palette"
            >
              <div className="px-2.5 py-1.5 border-b border-[var(--border-subtle)] mb-1 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-display">
                  Accent Palettes
                </span>
                <span className="text-[10px] text-[var(--accent-text)] font-semibold">
                  7 Presets
                </span>
              </div>

              <div className="space-y-0.5" role="radiogroup" aria-label="Accent themes">
                {accentOptions.map((opt) => {
                  const isSelected = opt.id === accentColor;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleSelectAccent(opt.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[var(--accent-subtle)] text-[var(--accent-text)] font-bold border border-[var(--accent-border)] shadow-xs"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-3.5 w-3.5 rounded-full shrink-0 ring-1 ring-white/20 shadow-xs"
                          style={{ backgroundColor: opt.previewColor }}
                        />
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-[var(--accent-primary)] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
