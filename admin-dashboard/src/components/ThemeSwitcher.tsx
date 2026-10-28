import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, Palette, Check, ChevronDown, Sliders } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { AccentColor, ThemeMode } from "../types";

export interface ThemeSwitcherProps {
  compact?: boolean;
  showLabels?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ compact = false, showLabels = false }) => {
  const {
    themeMode,
    resolvedThemeMode,
    accentColor,
    setThemeMode,
    toggleThemeMode,
    setAccentColor,
    openCustomizer,
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
        className="h-8 px-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-surface)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
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

      {/* 2. Compact, Discoverable Theme Selector Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          aria-label={`Current accent: ${activeOption.label}, Appearance: ${themeMode}. Click to configure theme.`}
          title={`Theme: ${activeOption.label} • ${themeMode === "system" ? "System" : themeMode} (Click to switch)`}
          className="h-8 flex items-center gap-2 px-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-surface)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] shadow-xs"
        >
          {/* Active Accent Swatch Dot with subtle glow ring */}
          <span
            className="h-3.5 w-3.5 rounded-full shrink-0 ring-2 ring-[var(--accent-border)] ring-offset-1 ring-offset-[var(--bg-surface-subtle)] shadow-xs transition-transform"
            style={{ backgroundColor: activeOption.previewColor }}
          />

          {!compact && (
            <span className="text-xs font-semibold text-[var(--text-primary)] hidden sm:inline truncate max-w-[80px]">
              {activeOption.label}
            </span>
          )}

          <ChevronDown
            className={`h-3 w-3 text-[var(--text-muted)] transition-transform duration-150 shrink-0 ${
              dropdownOpen ? "rotate-180 text-[var(--accent-primary)]" : ""
            }`}
          />
        </button>

        {/* Popover Menu with Appearance Modes, 7 Accents & Customizer Launcher */}
        {dropdownOpen && (
          <div
            role="menu"
            aria-orientation="vertical"
            className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Appearance Mode Segmented Selector */}
            <div className="px-1 py-1 mb-1 border-b border-[var(--border-subtle)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5 px-1">
                Appearance Mode
              </span>
              <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setThemeMode("system")}
                  className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                    themeMode === "system"
                      ? "bg-[var(--bg-surface)] text-[var(--accent-primary)] font-semibold shadow-xs border border-[var(--border-default)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                  title="Follow OS Light/Dark setting"
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>System</span>
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode("dark")}
                  className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                    themeMode === "dark"
                      ? "bg-[var(--bg-surface)] text-[var(--accent-primary)] font-semibold shadow-xs border border-[var(--border-default)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                  title="Dark Mode"
                >
                  <Moon className="h-3.5 w-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode("light")}
                  className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                    themeMode === "light"
                      ? "bg-[var(--bg-surface)] text-[var(--accent-primary)] font-semibold shadow-xs border border-[var(--border-default)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                  title="Light Mode"
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span>Light</span>
                </button>
              </div>
            </div>

            {/* Accent Palette Section Header */}
            <div className="px-2 py-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Accent Palette
              </span>
              <span className="text-[10px] font-mono text-[var(--accent-text)] bg-[var(--accent-subtle)] px-1.5 py-0.5 rounded border border-[var(--accent-border)] font-medium">
                7 Choices
              </span>
            </div>

            {/* List of 7 Accents */}
            <div className="space-y-0.5 py-1">
              {accentOptions.map((opt) => {
                const isSelected = opt.id === accentColor;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="menuitem"
                    onClick={() => handleSelectAccent(opt.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[var(--accent-subtle)] text-[var(--accent-text)] font-semibold border border-[var(--accent-border)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="relative h-3.5 w-3.5 rounded-full shrink-0 shadow-xs flex items-center justify-center"
                        style={{ backgroundColor: opt.previewColor }}
                      >
                        {isSelected && <Check className="h-2 w-2 text-white stroke-[3]" />}
                      </span>
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-[var(--accent-primary)] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Divider & Full Customizer Drawer Trigger */}
            <div className="mt-1.5 pt-1.5 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  openCustomizer();
                }}
                className="w-full flex items-center justify-center gap-2 px-2 py-1.5 text-xs text-[var(--accent-text)] hover:bg-[var(--accent-subtle)] rounded-lg font-medium transition-colors cursor-pointer"
              >
                <Sliders className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                <span>Open Theme Studio...</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
