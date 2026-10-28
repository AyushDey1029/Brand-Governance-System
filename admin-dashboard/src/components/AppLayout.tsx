import React, { useState, useRef, useEffect } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Sliders,
  Palette,
  FileCheck2,
  History,
  BarChart3,
  Settings as SettingsIcon,
  ChevronDown,
  Building2,
  UserCheck,
  Menu,
  X,
  ArrowLeft,
  Info,
  Check,
  Sun,
  Moon,
  Monitor,
  Activity,
  Zap,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { useTheme } from "../context/ThemeContext";
import { RouteId, UserRole } from "../types";
import { Badge } from "../design-system/Badge";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { ThemeCustomizer } from "./ThemeCustomizer";

interface NavItem {
  id: RouteId;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  badge?: string;
  badgeVariant?: "brand" | "success" | "warning" | "neutral" | "glow";
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeBrand,
    setActiveBrand,
    activeRole,
    setActiveRole,
    currentRoute,
    setCurrentRoute,
    setIsAuthenticated,
    isDemoMode,
    currentUser,
    logout,
    brands,
  } = useWorkspace();
  const { themeMode, accentColor, isCustomizerOpen, openCustomizer, closeCustomizer, accentOptions } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(e.target as Node)) {
        setBrandDropdownOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setBrandDropdownOpen(false);
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const navGroups: NavGroup[] = [
    {
      id: "core-governance",
      title: "Core Governance",
      items: [
        {
          id: "overview",
          label: "Executive Cockpit",
          icon: <LayoutDashboard className="h-4 w-4" />,
          roles: ["OWNER", "BRAND_MANAGER", "COMPLIANCE_REVIEWER", "SUPER_ADMIN"],
        },
        {
          id: "creator-studio",
          label: "Creator Studio",
          icon: <Sparkles className="h-4 w-4" />,
          roles: ["OWNER", "BRAND_MANAGER", "CONTENT_CREATOR", "SUPER_ADMIN"],
          badge: "AI Live",
          badgeVariant: "glow",
        },
        {
          id: "review-queue",
          label: "Review Queue",
          icon: <FileCheck2 className="h-4 w-4" />,
          roles: ["OWNER", "BRAND_MANAGER", "COMPLIANCE_REVIEWER", "SUPER_ADMIN"],
          badge: "1 Pending",
          badgeVariant: "warning",
        },
      ],
    },
    {
      id: "knowledge-policies",
      title: "Knowledge & Rules",
      items: [
        {
          id: "golden-facts",
          label: "Golden Facts",
          icon: <BookOpen className="h-4 w-4" />,
          roles: ["OWNER", "BRAND_MANAGER", "CONTENT_CREATOR", "SUPER_ADMIN"],
        },
        {
          id: "brand-rules",
          label: "Guardrails & Rules",
          icon: <Sliders className="h-4 w-4" />,
          roles: ["OWNER", "BRAND_MANAGER", "SUPER_ADMIN"],
        },
        {
          id: "visual-assets",
          label: "Visual Identity",
          icon: <Palette className="h-4 w-4" />,
          roles: ["OWNER", "BRAND_MANAGER", "SUPER_ADMIN"],
        },
      ],
    },
    {
      id: "operations-audit",
      title: "Operations & Audit",
      items: [
        {
          id: "audit-history",
          label: "Audit History",
          icon: <History className="h-4 w-4" />,
          roles: ["OWNER", "BRAND_MANAGER", "CONTENT_CREATOR", "COMPLIANCE_REVIEWER", "SUPER_ADMIN"],
        },
        {
          id: "analytics",
          label: "Governance Analytics",
          icon: <BarChart3 className="h-4 w-4" />,
          roles: ["OWNER", "BRAND_MANAGER", "COMPLIANCE_REVIEWER", "SUPER_ADMIN"],
        },
        {
          id: "brand-setup",
          label: "Brand Profile",
          icon: <Building2 className="h-4 w-4" />,
          roles: ["OWNER", "BRAND_MANAGER", "SUPER_ADMIN"],
        },
        {
          id: "settings",
          label: "Workspace Settings",
          icon: <SettingsIcon className="h-4 w-4" />,
          roles: ["OWNER", "BRAND_MANAGER", "SUPER_ADMIN"],
        },
      ],
    },
  ];

  const roleLabels: Record<UserRole, string> = {
    OWNER: "Brand Owner",
    BRAND_MANAGER: "Brand Manager",
    CONTENT_CREATOR: "Content Creator",
    COMPLIANCE_REVIEWER: "Compliance Reviewer",
    SUPER_ADMIN: "Super Admin",
  };

  const activeAccentOption = accentOptions.find((a) => a.id === accentColor) || accentOptions[0];

  return (
    <div className="flex h-screen bg-transparent text-[var(--text-primary)] font-sans overflow-hidden transition-colors duration-300 relative">
      {/* =====================================================================
          1. Architectural Translucent Sidebar
          ===================================================================== */}
      <aside className="hidden lg:flex flex-col w-72 surface-glass surface-glass-highlight border-r border-[var(--glass-border)] shrink-0 transition-all duration-300 select-none relative z-20 shadow-glass">
        {/* Inkloom Brand Identity Header */}
        <div className="h-16 px-5 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="h-9 w-9 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-contrast)] flex items-center justify-center font-bold text-sm shadow-[0_0_20px_var(--accent-ring)] ring-1 ring-white/25 shrink-0 transition-transform hover:scale-105">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-surface)]" />
            </div>
            <div className="truncate">
              <span className="font-display font-bold text-base tracking-tight block text-[var(--text-primary)]">
                Inkloom
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono font-medium -mt-0.5 block truncate tracking-wide">
                AI Brand Governance
              </span>
            </div>
          </div>
          <Badge variant="glow" size="sm" pulse dot className="font-mono text-[9px] shrink-0">
            v2.0
          </Badge>
        </div>

        {/* Workspace Brand Tenant Selector */}
        <div className="p-3.5 border-b border-[var(--border-subtle)]" ref={brandDropdownRef}>
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 font-display">
              <Activity className="h-3 w-3 text-[var(--accent-primary)]" />
              Workspace Tenant
            </span>
            <span className="text-[9px] font-mono font-semibold text-[var(--accent-text)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded-full border border-[var(--accent-border)]">
              Multi-Tenant
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
              title={`Switch active brand tenant (Current: ${activeBrand.name})`}
              aria-haspopup="true"
              aria-expanded={brandDropdownOpen}
              className="w-full flex items-center justify-between p-2.5 rounded-xl surface-glass-subtle border border-[var(--border-default)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-surface)] text-left transition-all duration-200 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <span
                    className="h-4 w-4 rounded-lg block ring-2 ring-[var(--accent-border)] ring-offset-1 ring-offset-[var(--bg-surface)] transition-transform group-hover:scale-110 shadow-xs"
                    style={{ backgroundColor: activeBrand.secondaryColor || "var(--accent-primary)" }}
                  />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-[var(--text-primary)] truncate font-display">
                    {activeBrand.name}
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] truncate flex items-center gap-1 font-mono">
                    <span>{activeBrand.industry || "Enterprise"}</span>
                    <span>•</span>
                    <span className="text-[var(--accent-text)] font-semibold">Production</span>
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
                  brandDropdownOpen ? "rotate-180 text-[var(--accent-primary)]" : "group-hover:text-[var(--text-primary)]"
                }`}
              />
            </button>

            {/* Brand Dropdown Menu */}
            {brandDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 surface-glass surface-glass-highlight border border-[var(--border-default)] rounded-2xl shadow-2xl z-30 py-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold border-b border-[var(--border-subtle)] pb-1 mb-1 font-display">
                  Switch Workspace
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 px-1">
                  {brands && brands.length > 0 ? (
                    brands.map((b) => {
                      const isSelected = b.id === activeBrand.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setActiveBrand(b);
                            setBrandDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 text-xs transition-all cursor-pointer rounded-xl ${
                            isSelected
                              ? "font-bold text-[var(--accent-text)] bg-[var(--accent-subtle)] border border-[var(--accent-border)] shadow-xs"
                              : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                              style={{ backgroundColor: b.secondaryColor || "var(--accent-primary)" }}
                            />
                            <span className="truncate">{b.name}</span>
                          </div>
                          {isSelected && <Check className="h-3.5 w-3.5 text-[var(--accent-primary)] shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-3 py-1.5 text-xs text-[var(--text-muted)]">
                      {activeBrand.name}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Categories and Items */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-3 space-y-4"
          aria-label="Workspace Sidebar Navigation"
        >
          {navGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter((item) => item.roles.includes(activeRole));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.id} className="space-y-1">
                <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-display">
                  {group.title}
                </div>

                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = currentRoute === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCurrentRoute(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] relative group hover:translate-x-0.5 active:scale-[0.98] ${
                          isActive
                            ? "bg-[var(--accent-subtle)] text-[var(--accent-text)] font-bold border border-[var(--accent-border)] border-l-[3px] border-[var(--accent-primary)] shadow-xs shadow-glow/10"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {/* Active vertical accent bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--accent-primary)] rounded-r-full shadow-glow" />
                        )}

                        <div className="flex items-center gap-2.5 min-w-0 pl-0.5">
                          <span
                            className={`transition-colors shrink-0 ${
                              isActive
                                ? "text-[var(--accent-primary)]"
                                : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <Badge
                            variant={isActive ? "glow" : item.badgeVariant || "neutral"}
                            size="sm"
                            dot={item.badge === "AI Live" || item.badge === "Live"}
                            pulse={item.badge === "AI Live" || item.badge === "Live"}
                            className="shrink-0"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Subtle Divider between groups */}
                {groupIdx < navGroups.length - 1 && (
                  <div className="pt-2">
                    <div className="border-t border-[var(--border-subtle)] mx-2" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer: Active Role Card, Theme Trigger, Sign Out */}
        <div className="p-3.5 border-t border-[var(--border-subtle)] space-y-2 shrink-0">
          {/* Active User & Role Switcher Card */}
          <div className="relative" ref={roleDropdownRef}>
            <button
              type="button"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              title="Switch user role for testing permissions"
              aria-haspopup="true"
              aria-expanded={roleDropdownOpen}
              className="w-full flex items-center justify-between p-2 rounded-xl surface-glass-subtle border border-[var(--border-default)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-surface)] transition-all duration-150 text-left cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">
                  <UserCheck className="h-3.5 w-3.5" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-semibold text-[var(--text-primary)] block truncate">
                    {currentUser ? currentUser.full_name : "Demo User"}
                  </span>
                  <span className="text-[10px] text-[var(--accent-text)] font-semibold block truncate">
                    {roleLabels[activeRole]}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`h-3 w-3 text-[var(--text-muted)] shrink-0 transition-transform duration-150 ${
                  roleDropdownOpen ? "rotate-180 text-[var(--accent-primary)]" : ""
                }`}
              />
            </button>

            {/* Role Selection Dropdown */}
            {roleDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1.5 surface-glass surface-glass-highlight border border-[var(--border-default)] rounded-2xl shadow-2xl z-30 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold border-b border-[var(--border-subtle)] pb-1 mb-1 font-display">
                  Test Role Navigation & Access
                </div>
                <div className="space-y-0.5">
                  {(["OWNER", "BRAND_MANAGER", "CONTENT_CREATOR", "COMPLIANCE_REVIEWER"] as UserRole[]).map((r) => {
                    const isSelected = activeRole === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setActiveRole(r);
                          setRoleDropdownOpen(false);
                          if (r === "CONTENT_CREATOR") {
                            setCurrentRoute("creator-studio");
                          } else if (r === "BRAND_MANAGER" || r === "OWNER") {
                            setCurrentRoute("overview");
                          }
                        }}
                        className={`w-full flex items-center justify-between text-left px-3 py-1.5 text-xs transition-colors cursor-pointer rounded-xl mx-auto max-w-[94%] ${
                          isSelected
                            ? "font-bold text-[var(--accent-text)] bg-[var(--accent-subtle)] border border-[var(--accent-border)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        <span>{roleLabels[r]}</span>
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

          {/* Easy-to-Discover Theme Preferences Trigger in Profile Footer */}
          <button
            type="button"
            onClick={openCustomizer}
            title={`Customize Theme (Mode: ${themeMode}, Accent: ${activeAccentOption.label})`}
            className="w-full flex items-center justify-between text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] px-3 py-2 rounded-xl transition-all duration-150 cursor-pointer border border-[var(--border-subtle)] hover:border-[var(--accent-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
          >
            <span className="flex items-center gap-2">
              <Palette className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
              <span className="font-semibold">Theme Studio & Atmosphere</span>
            </span>
            <div className="flex items-center gap-1.5">
              {themeMode === "system" ? (
                <Monitor className="h-3 w-3 text-[var(--accent-primary)]" />
              ) : themeMode === "dark" ? (
                <Moon className="h-3 w-3 text-[var(--accent-text)]" />
              ) : (
                <Sun className="h-3 w-3 text-amber-500" />
              )}
              <span
                className="h-2.5 w-2.5 rounded-full ring-1 ring-[var(--accent-border)] shadow-xs"
                style={{ backgroundColor: activeAccentOption.previewColor }}
              />
            </div>
          </button>

          {/* Exit Demo / Sign Out Action */}
          <button
            type="button"
            onClick={() => (isDemoMode ? setIsAuthenticated(false) : logout())}
            title={isDemoMode ? "Exit demo mode and reset session" : "Sign out of account"}
            className="w-full flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] py-1.5 transition-colors cursor-pointer rounded-xl hover:bg-[var(--bg-surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="font-medium">{isDemoMode ? "Exit Demo" : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* =====================================================================
          2. Main Content Canvas & Floating Cinematic Header
          ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Floating Glass Header Bar */}
        <header className="h-16 surface-glass surface-glass-highlight border-b border-[var(--glass-border)] px-4 sm:px-6 flex items-center justify-between shrink-0 transition-colors duration-200 z-10 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Path with Brand Tint */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs truncate">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: activeBrand.secondaryColor || "var(--accent-primary)" }}
                />
                <span className="font-display font-bold text-[var(--text-primary)] truncate text-sm">
                  {activeBrand.name}
                </span>
              </div>
              <span className="text-[var(--text-muted)]">/</span>
              <span className="text-[var(--accent-text)] bg-[var(--accent-subtle)] px-2.5 py-1 rounded-lg border border-[var(--accent-border)] font-semibold capitalize truncate text-xs font-display">
                {currentRoute.replace("-", " ")}
              </span>
            </nav>
          </div>

          {/* Right Header Controls: Appearance Toggle, Accent Selector & Status Badges */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live Governance Telemetry Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full surface-glass-subtle border border-[var(--border-default)] text-[11px] font-mono text-[var(--text-secondary)]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Autonomous SLA: <strong className="text-emerald-500">99.98%</strong></span>
            </div>

            {/* Compact Appearance Toggle & Accent Color Selector */}
            <ThemeSwitcher />

            <div className="h-4 w-px bg-[var(--border-default)] hidden sm:block" />

            {/* Tenant Status Pill */}
            {isDemoMode ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] text-[11px] font-semibold text-[var(--color-warning-text)]">
                <Info className="h-3.5 w-3.5 shrink-0" />
                <span>Demo Sandbox</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-success-bg)] border border-[var(--color-success-border)] text-[11px] font-semibold text-[var(--color-success-text)]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-[150px]">{currentUser ? currentUser.email : "Tenant Active"}</span>
              </div>
            )}

            {/* Role Indicator Badge */}
            <Badge variant="glow" size="sm" className="hidden xs:inline-flex">
              {roleLabels[activeRole]}
            </Badge>
          </div>
        </header>

        {/* Workspace Main Canvas Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-colors duration-200">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* =====================================================================
          3. Mobile Drawer Navigation
          ===================================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-80 surface-glass surface-glass-highlight border-r border-[var(--glass-border)] p-5 flex flex-col justify-between shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Header inside mobile drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-contrast)] flex items-center justify-center font-bold text-xs shadow-glow">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="font-display font-bold text-base text-[var(--text-primary)]">Inkloom</span>
                    <span className="text-[9px] text-[var(--text-muted)] font-mono block">AI Brand Governance</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Active Brand Card in Mobile Drawer */}
              <div className="p-3 rounded-xl surface-glass-subtle border border-[var(--border-default)]">
                <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1 font-display">
                  Active Brand
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: activeBrand.secondaryColor || "var(--accent-primary)" }}
                  />
                  <span className="text-xs font-bold text-[var(--text-primary)] font-display">{activeBrand.name}</span>
                </div>
              </div>

              {/* Compact Theme Switcher in Mobile Drawer */}
              <div className="p-3 rounded-xl surface-glass-subtle border border-[var(--border-default)] space-y-2">
                <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider font-display">
                  Atmosphere & Theme
                </div>
                <ThemeSwitcher showLabels />
              </div>

              {/* Navigation Items Grouped */}
              <nav className="space-y-3 pt-1">
                {navGroups.map((group) => {
                  const filtered = group.items.filter((item) => item.roles.includes(activeRole));
                  if (filtered.length === 0) return null;
                  return (
                    <div key={group.id} className="space-y-1">
                      <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-display">
                        {group.title}
                      </div>
                      <div className="space-y-1">
                        {filtered.map((item) => {
                          const isActive = currentRoute === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setCurrentRoute(item.id);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                                isActive
                                  ? "bg-[var(--accent-subtle)] text-[var(--accent-text)] font-bold border-l-4 border-[var(--accent-primary)]"
                                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}>
                                  {item.icon}
                                </span>
                                <span className="truncate">{item.label}</span>
                              </div>
                              {item.badge && (
                                <Badge
                                  variant={isActive ? "glow" : item.badgeVariant || "neutral"}
                                  size="sm"
                                  dot={item.badge === "AI Live" || item.badge === "Live"}
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer */}
            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-xs px-2 text-[var(--text-secondary)]">
                <span>Active Role:</span>
                <Badge variant="glow" size="sm">{roleLabels[activeRole]}</Badge>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAuthenticated(false);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] py-2.5 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-subtle)]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-semibold">{isDemoMode ? "Exit Demo" : "Sign Out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. Slide-over Theme Customizer Drawer
          ===================================================================== */}
      {isCustomizerOpen && (
        <ThemeCustomizer variant="drawer" onClose={closeCustomizer} />
      )}
    </div>
  );
};
