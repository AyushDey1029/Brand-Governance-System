import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  ThemeMode,
  ResolvedThemeMode,
  AccentColor,
  AccentOption,
  VisualPresetId,
  SurfaceTranslucency,
  MotionIntensity,
  VisualPreset,
} from "../types";

export const DEFAULT_THEME_MODE: ThemeMode = "dark";
export const DEFAULT_ACCENT_COLOR: AccentColor = "indigo";
export const DEFAULT_VISUAL_PRESET: VisualPresetId = "midnight";
export const DEFAULT_TRANSLUCENCY: SurfaceTranslucency = "medium";
export const DEFAULT_MOTION_INTENSITY: MotionIntensity = "normal";

export const THEME_MODE_KEY = "inkloom_theme_mode";
export const ACCENT_COLOR_KEY = "inkloom_accent_color";
export const AMBIENT_MOTION_KEY = "inkloom_ambient_motion";
export const VISUAL_PRESET_KEY = "inkloom_visual_preset";
export const TRANSLUCENCY_KEY = "inkloom_surface_translucency";
export const MOTION_INTENSITY_KEY = "inkloom_motion_intensity";
export const USER_THEME_PREFIX = "inkloom_user_theme_";

export const ACCENT_OPTIONS: AccentOption[] = [
  {
    id: "indigo",
    label: "Indigo",
    previewColor: "#6366f1",
    badgeClass: "bg-indigo-500",
    description: "Default sovereign Inkloom identity with high empirical authority",
  },
  {
    id: "violet",
    label: "Violet",
    previewColor: "#8b5cf6",
    badgeClass: "bg-violet-500",
    description: "Deep creative purple tone for modern creative studios",
  },
  {
    id: "ocean",
    label: "Ocean Blue",
    previewColor: "#0284c7",
    badgeClass: "bg-sky-500",
    description: "High-contrast maritime blue for enterprise infrastructure",
  },
  {
    id: "emerald",
    label: "Emerald",
    previewColor: "#10b981",
    badgeClass: "bg-emerald-500",
    description: "Empirical organic green for sustainable brand compliance",
  },
  {
    id: "rose",
    label: "Rose",
    previewColor: "#f43f5e",
    badgeClass: "bg-rose-500",
    description: "High-energy crimson highlight for rapid content velocity",
  },
  {
    id: "amber",
    label: "Amber",
    previewColor: "#f59e0b",
    badgeClass: "bg-amber-500",
    description: "Warm architectural gold tone for editorial governance",
  },
  {
    id: "teal",
    label: "Teal",
    previewColor: "#14b8a6",
    badgeClass: "bg-teal-500",
    description: "Modern cyan-tinted mineral green for telemetry dashboards",
  },
];

export const VISUAL_PRESETS: VisualPreset[] = [
  {
    id: "midnight",
    label: "Midnight",
    tagline: "Deep charcoal foundation with sovereign indigo",
    description: "The definitive Inkloom dark identity with balanced obsidian surfaces and restrained illumination.",
    previewColors: ["#4f46e5", "#6366f1", "#1e1b4b"],
    accentColor: "indigo",
    translucency: "medium",
    motionIntensity: "normal",
  },
  {
    id: "aurora",
    label: "Aurora",
    tagline: "Boreal emerald and teal radiance",
    description: "Vibrant high-latitude luminous ribbons with organic emerald glow and deep frosted glass depth.",
    previewColors: ["#059669", "#0d9488", "#0284c7"],
    accentColor: "teal",
    translucency: "heavy",
    motionIntensity: "vibrant",
  },
  {
    id: "nebula",
    label: "Nebula",
    tagline: "Cosmic violet and deep magenta atmosphere",
    description: "Rich interstellar starlight diffusion with violet highlights and balanced glass surfaces.",
    previewColors: ["#8b5cf6", "#d946ef", "#4338ca"],
    accentColor: "violet",
    translucency: "medium",
    motionIntensity: "normal",
  },
  {
    id: "oceanic",
    label: "Oceanic",
    tagline: "Deep abyssal marine tides and azure glow",
    description: "Crisp maritime gradient flows with cyan light accents and deep frosted glass depth.",
    previewColors: ["#0284c7", "#06b6d4", "#1e3a8a"],
    accentColor: "ocean",
    translucency: "heavy",
    motionIntensity: "gentle",
  },
  {
    id: "minimal",
    label: "Minimal",
    tagline: "Crisp distraction-free architectural surfaces",
    description: "Clean high-contrast layout with restrained lighting, solid backdrop, and calm static presence.",
    previewColors: ["#64748b", "#475569", "#334155"],
    accentColor: "indigo",
    translucency: "solid",
    motionIntensity: "paused",
  },
];

export interface UserThemePreference {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  ambientMotion?: boolean;
  preset?: VisualPresetId;
  translucency?: SurfaceTranslucency;
  motionIntensity?: MotionIntensity;
  userId: string;
  updatedAt: string;
}

export function isValidThemeMode(val: unknown): val is ThemeMode {
  return val === "dark" || val === "light" || val === "system";
}

export function isValidAccentColor(val: unknown): val is AccentColor {
  return typeof val === "string" && ACCENT_OPTIONS.some((opt) => opt.id === val);
}

export function isValidVisualPreset(val: unknown): val is VisualPresetId {
  return typeof val === "string" && VISUAL_PRESETS.some((preset) => preset.id === val);
}

export function isValidTranslucency(val: unknown): val is SurfaceTranslucency {
  return val === "solid" || val === "medium" || val === "heavy";
}

export function isValidMotionIntensity(val: unknown): val is MotionIntensity {
  return val === "paused" || val === "gentle" || val === "normal" || val === "vibrant";
}

export function sanitizeThemeMode(val: unknown): ThemeMode {
  return isValidThemeMode(val) ? val : DEFAULT_THEME_MODE;
}

export function sanitizeAccentColor(val: unknown): AccentColor {
  return isValidAccentColor(val) ? val : DEFAULT_ACCENT_COLOR;
}

export function sanitizeVisualPreset(val: unknown): VisualPresetId {
  return isValidVisualPreset(val) ? val : DEFAULT_VISUAL_PRESET;
}

export function sanitizeTranslucency(val: unknown): SurfaceTranslucency {
  return isValidTranslucency(val) ? val : DEFAULT_TRANSLUCENCY;
}

export function sanitizeMotionIntensity(val: unknown): MotionIntensity {
  return isValidMotionIntensity(val) ? val : DEFAULT_MOTION_INTENSITY;
}

/** Detect operating system light or dark preference */
export function getSystemThemeMode(): ResolvedThemeMode {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "dark";
  }
}

/** Detect operating system reduced motion preference */
export function getSystemReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** Resolve active visual appearance ("light" or "dark") given a user mode preference */
export function resolveEffectiveThemeMode(mode: ThemeMode): ResolvedThemeMode {
  if (mode === "system") {
    return getSystemThemeMode();
  }
  return mode;
}

/** Safe storage wrapper with SSR guards and private browsing failure tolerance */
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === "undefined" || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      window.localStorage.setItem(key, value);
    } catch {
      // gracefully ignore storage write limits or security exceptions
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

/** Synchronously apply mode, accent, motion, preset, and translucency tokens to document.documentElement */
export function applyThemeToDOM(
  mode: ThemeMode,
  accent: AccentColor,
  ambientMotion: boolean = true,
  preset: VisualPresetId = DEFAULT_VISUAL_PRESET,
  translucency: SurfaceTranslucency = DEFAULT_TRANSLUCENCY,
  motionIntensity: MotionIntensity = DEFAULT_MOTION_INTENSITY
): ResolvedThemeMode {
  if (typeof document === "undefined") return "dark";
  const root = document.documentElement;
  const effectiveMode = resolveEffectiveThemeMode(mode);
  const isOsReduced = getSystemReducedMotion();
  const effectiveMotion = ambientMotion && !isOsReduced && motionIntensity !== "paused";

  // 1. Mode class & color scheme
  root.classList.remove("light", "dark");
  root.classList.add(effectiveMode);
  root.style.colorScheme = effectiveMode;

  // 2. Data attributes for telemetry and CSS token activation
  root.setAttribute("data-accent", accent);
  root.setAttribute("data-theme-preference", mode);
  root.setAttribute("data-theme-resolved", effectiveMode);
  root.setAttribute("data-ambient-motion", effectiveMotion ? "on" : "off");
  root.setAttribute("data-preset", preset);
  root.setAttribute("data-translucency", translucency);
  root.setAttribute("data-motion-intensity", motionIntensity);

  return effectiveMode;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  resolvedThemeMode: ResolvedThemeMode;
  accentColor: AccentColor;
  ambientMotion: boolean;
  isMotionReduced: boolean;
  visualPreset: VisualPresetId;
  surfaceTranslucency: SurfaceTranslucency;
  motionIntensity: MotionIntensity;
  presets: VisualPreset[];
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (accent: AccentColor) => void;
  setAmbientMotion: (enabled: boolean) => void;
  setVisualPreset: (preset: VisualPresetId) => void;
  applyPreset: (preset: VisualPresetId) => void;
  setSurfaceTranslucency: (translucency: SurfaceTranslucency) => void;
  setMotionIntensity: (intensity: MotionIntensity) => void;
  toggleThemeMode: () => void;
  resetToDefault: () => void;
  isDefault: boolean;
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (open: boolean) => void;
  openCustomizer: () => void;
  closeCustomizer: () => void;
  syncUserTheme: (userId: string | null) => void;
  accentOptions: AccentOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Read initial values from storage safely with default fallback to Dark Mode + Indigo + Midnight
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = safeStorage.getItem(THEME_MODE_KEY);
    return sanitizeThemeMode(saved);
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const saved = safeStorage.getItem(ACCENT_COLOR_KEY);
    return sanitizeAccentColor(saved);
  });

  const [ambientMotion, setAmbientMotionState] = useState<boolean>(() => {
    const saved = safeStorage.getItem(AMBIENT_MOTION_KEY);
    return saved !== null ? saved === "true" : true;
  });

  const [visualPreset, setVisualPresetState] = useState<VisualPresetId>(() => {
    const saved = safeStorage.getItem(VISUAL_PRESET_KEY);
    return sanitizeVisualPreset(saved);
  });

  const [surfaceTranslucency, setSurfaceTranslucencyState] = useState<SurfaceTranslucency>(() => {
    const saved = safeStorage.getItem(TRANSLUCENCY_KEY);
    return sanitizeTranslucency(saved);
  });

  const [motionIntensity, setMotionIntensityState] = useState<MotionIntensity>(() => {
    const saved = safeStorage.getItem(MOTION_INTENSITY_KEY);
    return sanitizeMotionIntensity(saved);
  });

  const [isOsReducedMotion, setIsOsReducedMotion] = useState<boolean>(() => getSystemReducedMotion());

  const [resolvedThemeMode, setResolvedThemeMode] = useState<ResolvedThemeMode>(() =>
    resolveEffectiveThemeMode(sanitizeThemeMode(safeStorage.getItem(THEME_MODE_KEY)))
  );

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const activeUserIdRef = useRef<string | null>(null);

  // Apply to DOM on initial render and whenever mode, accent, motion, preset, translucency, or motionIntensity updates
  useEffect(() => {
    const effective = applyThemeToDOM(
      themeMode,
      accentColor,
      ambientMotion,
      visualPreset,
      surfaceTranslucency,
      motionIntensity
    );
    setResolvedThemeMode(effective);
    safeStorage.setItem(THEME_MODE_KEY, themeMode);
    safeStorage.setItem(ACCENT_COLOR_KEY, accentColor);
    safeStorage.setItem(AMBIENT_MOTION_KEY, String(ambientMotion));
    safeStorage.setItem(VISUAL_PRESET_KEY, visualPreset);
    safeStorage.setItem(TRANSLUCENCY_KEY, surfaceTranslucency);
    safeStorage.setItem(MOTION_INTENSITY_KEY, motionIntensity);
  }, [themeMode, accentColor, ambientMotion, visualPreset, surfaceTranslucency, motionIntensity]);

  // Dynamic listener for operating system light/dark preference changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQueryTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const mediaQueryMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (themeMode === "system") {
        const newEffective: ResolvedThemeMode = e.matches ? "dark" : "light";
        setResolvedThemeMode(newEffective);
        applyThemeToDOM(
          "system",
          accentColor,
          ambientMotion,
          visualPreset,
          surfaceTranslucency,
          motionIntensity
        );
      }
    };

    const handleSystemMotionChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsOsReducedMotion(e.matches);
      applyThemeToDOM(
        themeMode,
        accentColor,
        ambientMotion,
        visualPreset,
        surfaceTranslucency,
        motionIntensity
      );
    };

    if (mediaQueryTheme.addEventListener) {
      mediaQueryTheme.addEventListener("change", handleSystemThemeChange);
      mediaQueryMotion.addEventListener("change", handleSystemMotionChange);
    } else if ((mediaQueryTheme as any).addListener) {
      (mediaQueryTheme as any).addListener(handleSystemThemeChange);
      (mediaQueryMotion as any).addListener(handleSystemMotionChange);
    }

    return () => {
      if (mediaQueryTheme.removeEventListener) {
        mediaQueryTheme.removeEventListener("change", handleSystemThemeChange);
        mediaQueryMotion.removeEventListener("change", handleSystemMotionChange);
      } else if ((mediaQueryTheme as any).removeListener) {
        (mediaQueryTheme as any).removeListener(handleSystemThemeChange);
        (mediaQueryMotion as any).removeListener(handleSystemMotionChange);
      }
    };
  }, [themeMode, accentColor, ambientMotion, visualPreset, surfaceTranslucency, motionIntensity]);

  // Pause ambient animations when the page/tab is hidden or inactive to conserve GPU/CPU cycles
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleVisibility = () => {
      const isVisible = !document.hidden;
      document.documentElement.setAttribute("data-page-visible", isVisible ? "true" : "false");
      if (!isVisible) {
        document.documentElement.classList.add("page-hidden");
      } else {
        document.documentElement.classList.remove("page-hidden");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    handleVisibility();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Synchronize authenticated user preferences without requiring backend migration
  const syncUserTheme = useCallback(
    (userId: string | null) => {
      activeUserIdRef.current = userId;
      if (!userId) {
        return;
      }

      try {
        const userKey = `${USER_THEME_PREFIX}${userId}`;
        const rawUserPref = safeStorage.getItem(userKey);

        if (rawUserPref) {
          const parsed = JSON.parse(rawUserPref);
          const resolvedMode = sanitizeThemeMode(parsed?.themeMode);
          const resolvedAccent = sanitizeAccentColor(parsed?.accentColor);
          const resolvedPreset = sanitizeVisualPreset(parsed?.preset);
          const resolvedTranslucency = sanitizeTranslucency(parsed?.translucency);
          const resolvedMotion = sanitizeMotionIntensity(parsed?.motionIntensity);
          const resolvedAmbientMotion =
            parsed?.ambientMotion !== undefined
              ? Boolean(parsed.ambientMotion)
              : resolvedMotion !== "paused";

          setThemeModeState(resolvedMode);
          setAccentColorState(resolvedAccent);
          setVisualPresetState(resolvedPreset);
          setSurfaceTranslucencyState(resolvedTranslucency);
          setMotionIntensityState(resolvedMotion);
          setAmbientMotionState(resolvedAmbientMotion);

          const effective = applyThemeToDOM(
            resolvedMode,
            resolvedAccent,
            resolvedAmbientMotion,
            resolvedPreset,
            resolvedTranslucency,
            resolvedMotion
          );
          setResolvedThemeMode(effective);
          safeStorage.setItem(THEME_MODE_KEY, resolvedMode);
          safeStorage.setItem(ACCENT_COLOR_KEY, resolvedAccent);
          safeStorage.setItem(AMBIENT_MOTION_KEY, String(resolvedAmbientMotion));
          safeStorage.setItem(VISUAL_PRESET_KEY, resolvedPreset);
          safeStorage.setItem(TRANSLUCENCY_KEY, resolvedTranslucency);
          safeStorage.setItem(MOTION_INTENSITY_KEY, resolvedMotion);
          return;
        }

        // Initialize user-scoped record with current active preferences
        const initialUserPref: UserThemePreference = {
          userId,
          themeMode,
          accentColor,
          ambientMotion,
          preset: visualPreset,
          translucency: surfaceTranslucency,
          motionIntensity,
          updatedAt: new Date().toISOString(),
        };
        safeStorage.setItem(userKey, JSON.stringify(initialUserPref));
      } catch (err) {
        console.warn("[Inkloom Theme] User preference synchronization recovered gracefully:", err);
      }
    },
    [themeMode, accentColor, ambientMotion, visualPreset, surfaceTranslucency, motionIntensity]
  );

  const saveToUserStorage = (partial: Partial<UserThemePreference>) => {
    if (activeUserIdRef.current) {
      try {
        const userKey = `${USER_THEME_PREFIX}${activeUserIdRef.current}`;
        const existing = safeStorage.getItem(userKey);
        const parsed = existing ? JSON.parse(existing) : {};
        const record: UserThemePreference = {
          userId: activeUserIdRef.current,
          themeMode,
          accentColor,
          ambientMotion,
          preset: visualPreset,
          translucency: surfaceTranslucency,
          motionIntensity,
          ...parsed,
          ...partial,
          updatedAt: new Date().toISOString(),
        };
        safeStorage.setItem(userKey, JSON.stringify(record));
      } catch {
        // Safe fallback
      }
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    const validated = sanitizeThemeMode(mode);
    setThemeModeState(validated);
    const effective = applyThemeToDOM(
      validated,
      accentColor,
      ambientMotion,
      visualPreset,
      surfaceTranslucency,
      motionIntensity
    );
    setResolvedThemeMode(effective);
    safeStorage.setItem(THEME_MODE_KEY, validated);
    saveToUserStorage({ themeMode: validated });
  };

  const setAccentColor = (accent: AccentColor) => {
    const validated = sanitizeAccentColor(accent);
    setAccentColorState(validated);
    applyThemeToDOM(
      themeMode,
      validated,
      ambientMotion,
      visualPreset,
      surfaceTranslucency,
      motionIntensity
    );
    safeStorage.setItem(ACCENT_COLOR_KEY, validated);
    saveToUserStorage({ accentColor: validated });
  };

  const setAmbientMotion = (enabled: boolean) => {
    setAmbientMotionState(enabled);
    safeStorage.setItem(AMBIENT_MOTION_KEY, String(enabled));
    const nextIntensity: MotionIntensity = enabled
      ? motionIntensity === "paused"
        ? "normal"
        : motionIntensity
      : "paused";
    setMotionIntensityState(nextIntensity);
    safeStorage.setItem(MOTION_INTENSITY_KEY, nextIntensity);

    applyThemeToDOM(
      themeMode,
      accentColor,
      enabled,
      visualPreset,
      surfaceTranslucency,
      nextIntensity
    );
    saveToUserStorage({ ambientMotion: enabled, motionIntensity: nextIntensity });
  };

  const setVisualPreset = (preset: VisualPresetId) => {
    const validated = sanitizeVisualPreset(preset);
    setVisualPresetState(validated);
    applyThemeToDOM(
      themeMode,
      accentColor,
      ambientMotion,
      validated,
      surfaceTranslucency,
      motionIntensity
    );
    safeStorage.setItem(VISUAL_PRESET_KEY, validated);
    saveToUserStorage({ preset: validated });
  };

  const applyPreset = (presetId: VisualPresetId) => {
    const found = VISUAL_PRESETS.find((p) => p.id === presetId);
    if (!found) return;

    setVisualPresetState(found.id);
    setAccentColorState(found.accentColor);
    setSurfaceTranslucencyState(found.translucency);
    setMotionIntensityState(found.motionIntensity);
    const isMotionEnabled = found.motionIntensity !== "paused";
    setAmbientMotionState(isMotionEnabled);

    applyThemeToDOM(
      themeMode,
      found.accentColor,
      isMotionEnabled,
      found.id,
      found.translucency,
      found.motionIntensity
    );

    safeStorage.setItem(VISUAL_PRESET_KEY, found.id);
    safeStorage.setItem(ACCENT_COLOR_KEY, found.accentColor);
    safeStorage.setItem(TRANSLUCENCY_KEY, found.translucency);
    safeStorage.setItem(MOTION_INTENSITY_KEY, found.motionIntensity);
    safeStorage.setItem(AMBIENT_MOTION_KEY, String(isMotionEnabled));

    saveToUserStorage({
      preset: found.id,
      accentColor: found.accentColor,
      translucency: found.translucency,
      motionIntensity: found.motionIntensity,
      ambientMotion: isMotionEnabled,
    });
  };

  const setSurfaceTranslucency = (translucency: SurfaceTranslucency) => {
    const validated = sanitizeTranslucency(translucency);
    setSurfaceTranslucencyState(validated);
    applyThemeToDOM(
      themeMode,
      accentColor,
      ambientMotion,
      visualPreset,
      validated,
      motionIntensity
    );
    safeStorage.setItem(TRANSLUCENCY_KEY, validated);
    saveToUserStorage({ translucency: validated });
  };

  const setMotionIntensity = (intensity: MotionIntensity) => {
    const validated = sanitizeMotionIntensity(intensity);
    setMotionIntensityState(validated);
    const isMotionEnabled = validated !== "paused";
    setAmbientMotionState(isMotionEnabled);

    applyThemeToDOM(
      themeMode,
      accentColor,
      isMotionEnabled,
      visualPreset,
      surfaceTranslucency,
      validated
    );
    safeStorage.setItem(MOTION_INTENSITY_KEY, validated);
    safeStorage.setItem(AMBIENT_MOTION_KEY, String(isMotionEnabled));
    saveToUserStorage({ motionIntensity: validated, ambientMotion: isMotionEnabled });
  };

  const toggleThemeMode = () => {
    const nextMode: ThemeMode = resolvedThemeMode === "dark" ? "light" : "dark";
    setThemeMode(nextMode);
  };

  const resetToDefault = () => {
    setThemeModeState(DEFAULT_THEME_MODE);
    setAccentColorState(DEFAULT_ACCENT_COLOR);
    setAmbientMotionState(true);
    setVisualPresetState(DEFAULT_VISUAL_PRESET);
    setSurfaceTranslucencyState(DEFAULT_TRANSLUCENCY);
    setMotionIntensityState(DEFAULT_MOTION_INTENSITY);

    const effective = applyThemeToDOM(
      DEFAULT_THEME_MODE,
      DEFAULT_ACCENT_COLOR,
      true,
      DEFAULT_VISUAL_PRESET,
      DEFAULT_TRANSLUCENCY,
      DEFAULT_MOTION_INTENSITY
    );
    setResolvedThemeMode(effective);

    safeStorage.setItem(THEME_MODE_KEY, DEFAULT_THEME_MODE);
    safeStorage.setItem(ACCENT_COLOR_KEY, DEFAULT_ACCENT_COLOR);
    safeStorage.setItem(AMBIENT_MOTION_KEY, "true");
    safeStorage.setItem(VISUAL_PRESET_KEY, DEFAULT_VISUAL_PRESET);
    safeStorage.setItem(TRANSLUCENCY_KEY, DEFAULT_TRANSLUCENCY);
    safeStorage.setItem(MOTION_INTENSITY_KEY, DEFAULT_MOTION_INTENSITY);

    saveToUserStorage({
      themeMode: DEFAULT_THEME_MODE,
      accentColor: DEFAULT_ACCENT_COLOR,
      ambientMotion: true,
      preset: DEFAULT_VISUAL_PRESET,
      translucency: DEFAULT_TRANSLUCENCY,
      motionIntensity: DEFAULT_MOTION_INTENSITY,
    });
  };

  const isDefault =
    themeMode === DEFAULT_THEME_MODE &&
    accentColor === DEFAULT_ACCENT_COLOR &&
    ambientMotion === true &&
    visualPreset === DEFAULT_VISUAL_PRESET &&
    surfaceTranslucency === DEFAULT_TRANSLUCENCY &&
    motionIntensity === DEFAULT_MOTION_INTENSITY;

  const openCustomizer = () => setIsCustomizerOpen(true);
  const closeCustomizer = () => setIsCustomizerOpen(false);

  const isMotionReduced = !ambientMotion || isOsReducedMotion || motionIntensity === "paused";

  // Cross-tab synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === THEME_MODE_KEY && e.newValue) {
        const validatedMode = sanitizeThemeMode(e.newValue);
        setThemeModeState(validatedMode);
        const effective = applyThemeToDOM(
          validatedMode,
          accentColor,
          ambientMotion,
          visualPreset,
          surfaceTranslucency,
          motionIntensity
        );
        setResolvedThemeMode(effective);
      } else if (e.key === ACCENT_COLOR_KEY && e.newValue) {
        const validatedAccent = sanitizeAccentColor(e.newValue);
        setAccentColorState(validatedAccent);
        applyThemeToDOM(
          themeMode,
          validatedAccent,
          ambientMotion,
          visualPreset,
          surfaceTranslucency,
          motionIntensity
        );
      } else if (e.key === AMBIENT_MOTION_KEY && e.newValue !== null) {
        const enabled = e.newValue === "true";
        setAmbientMotionState(enabled);
        applyThemeToDOM(
          themeMode,
          accentColor,
          enabled,
          visualPreset,
          surfaceTranslucency,
          motionIntensity
        );
      } else if (e.key === VISUAL_PRESET_KEY && e.newValue) {
        const validatedPreset = sanitizeVisualPreset(e.newValue);
        setVisualPresetState(validatedPreset);
        applyThemeToDOM(
          themeMode,
          accentColor,
          ambientMotion,
          validatedPreset,
          surfaceTranslucency,
          motionIntensity
        );
      } else if (e.key === TRANSLUCENCY_KEY && e.newValue) {
        const validatedTranslucency = sanitizeTranslucency(e.newValue);
        setSurfaceTranslucencyState(validatedTranslucency);
        applyThemeToDOM(
          themeMode,
          accentColor,
          ambientMotion,
          visualPreset,
          validatedTranslucency,
          motionIntensity
        );
      } else if (e.key === MOTION_INTENSITY_KEY && e.newValue) {
        const validatedIntensity = sanitizeMotionIntensity(e.newValue);
        setMotionIntensityState(validatedIntensity);
        applyThemeToDOM(
          themeMode,
          accentColor,
          ambientMotion,
          visualPreset,
          surfaceTranslucency,
          validatedIntensity
        );
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [themeMode, accentColor, ambientMotion, visualPreset, surfaceTranslucency, motionIntensity]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        resolvedThemeMode,
        accentColor,
        ambientMotion,
        isMotionReduced,
        visualPreset,
        surfaceTranslucency,
        motionIntensity,
        presets: VISUAL_PRESETS,
        setThemeMode,
        setAccentColor,
        setAmbientMotion,
        setVisualPreset,
        applyPreset,
        setSurfaceTranslucency,
        setMotionIntensity,
        toggleThemeMode,
        resetToDefault,
        isDefault,
        isCustomizerOpen,
        setIsCustomizerOpen,
        openCustomizer,
        closeCustomizer,
        syncUserTheme,
        accentOptions: ACCENT_OPTIONS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
