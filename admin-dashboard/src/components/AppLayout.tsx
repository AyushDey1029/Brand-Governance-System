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
  ChevronRight,
  Building2,
  UserCheck,
  Menu,
  X,
  ArrowLeft,
  Info,
  Activity,
  LogOut,
  User,
  Home
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { RouteId, UserRole } from "../types";
import { Badge } from "../design-system/Badge";

interface NavItem {
  id: RouteId;
  label: string;
  icon: React.ReactNode | React.ElementType;
  roles: UserRole[];
  badge?: string;
  badgeVariant?: "brand" | "success" | "warning" | "neutral" | "glow";
}

const renderNavIcon = (icon: React.ReactNode | React.ElementType) => {
  if (!icon) return null;
  if (React.isValidElement(icon)) return icon;
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
    const IconComponent = icon as React.ElementType;
    return <IconComponent className="h-[18px] w-[18px]" />;
  }
  return icon as React.ReactNode;
};

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export const PAGE_TITLES: Record<RouteId, string> = {
  "overview": "Executive Cockpit",
  "creator-studio": "Creator Studio",
  "golden-facts": "Golden Facts",
  "brand-rules": "Guardrails & Rules",
  "visual-assets": "Visual Identity",
  "review-queue": "Review Queue",
  "audit-history": "Audit History",
  "analytics": "Governance Analytics",
  "brand-setup": "Brand Profile",
  "settings": "Workspace Settings",
};

export interface AppLayoutProps {
  children: React.ReactNode;
  onGoHome?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, onGoHome }) => {
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

  const { logout: authLogout } = useAuth();
  const { themeMode, accentColor, accentOptions } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const activeNavRef = useRef<HTMLButtonElement | null>(null);

  // Persistent collapsible sidebar groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("inkloom_sidebar_groups");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      try {
        localStorage.setItem("inkloom_sidebar_groups", JSON.stringify(next));
      } catch (e) {
        console.warn("Could not save sidebar group state:", e);
      }
      return next;
    });
  };

  // Scroll active item into view when currentRoute changes
  useEffect(() => {
    if (activeNavRef.current) {
      activeNavRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [currentRoute]);

  // Close user menu on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isCreatorRole = activeRole === "CONTENT_CREATOR";

  // Navigation Groups with Standardized Naming
  const navGroups: NavGroup[] = [
    {
      id: "core-governance",
      title: "Core Governance",
      items: [
        {
          id: "overview",
          label: isCreatorRole ? "Creator Overview" : "Executive Cockpit",
          icon: <LayoutDashboard className="h-[18px] w-[18px]" />,
          roles: ["OWNER", "BRAND_MANAGER", "CONTENT_CREATOR", "COMPLIANCE_REVIEWER", "SUPER_ADMIN"],
        },
        {
          id: "creator-studio",
          label: "Creator Studio",
          icon: <Sparkles className="h-[18px] w-[18px]" />,
          roles: ["OWNER", "BRAND_MANAGER", "CONTENT_CREATOR", "SUPER_ADMIN"],
          // Badge "AI Live" removed per prompt
        },
        {
          id: "review-queue",
          label: "Review Queue",
          icon: <FileCheck2 className="h-[18px] w-[18px]" />,
          roles: ["OWNER", "BRAND_MANAGER", "COMPLIANCE_REVIEWER", "SUPER_ADMIN"],
          badge: "1 Pending",
          badgeVariant: "warning",
        },
      ],
    },
    {
      id: "knowledge-rules",
      title: "Knowledge & Rules",
      items: [
        {
          id: "golden-facts",
          label: "Golden Facts",
          icon: <BookOpen className="h-[18px] w-[18px]" />,
          roles: ["OWNER", "BRAND_MANAGER", "CONTENT_CREATOR", "SUPER_ADMIN"],
        },
        {
          id: "brand-rules",
          label: "Guardrails & Rules",
          icon: <Sliders className="h-[18px] w-[18px]" />,
          roles: ["OWNER", "BRAND_MANAGER", "SUPER_ADMIN"],
        },
        {
          id: "visual-assets",
          label: "Visual Identity",
          icon: <Palette className="h-[18px] w-[18px]" />,
          roles: ["OWNER", "BRAND_MANAGER", "CONTENT_CREATOR", "SUPER_ADMIN"],
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
          icon: <History className="h-[18px] w-[18px]" />,
          roles: ["OWNER", "BRAND_MANAGER", "CONTENT_CREATOR", "COMPLIANCE_REVIEWER", "SUPER_ADMIN"],
        },
        {
          id: "analytics",
          label: "Governance Analytics",
          icon: <BarChart3 className="h-[18px] w-[18px]" />,
          roles: ["OWNER", "BRAND_MANAGER", "COMPLIANCE_REVIEWER", "SUPER_ADMIN"],
        },
        {
          id: "brand-setup",
          label: "Brand Profile",
          icon: <Building2 className="h-[18px] w-[18px]" />,
          roles: ["OWNER", "BRAND_MANAGER", "SUPER_ADMIN"],
        },
        {
          id: "settings",
          label: "Workspace Settings",
          icon: <SettingsIcon className="h-[18px] w-[18px]" />,
          roles: ["OWNER", "BRAND_MANAGER", "SUPER_ADMIN"],
        },
      ],
    },
  ];

  const roleLabels: Record<UserRole, string> = {
    OWNER: "Brand Manager",
    BRAND_MANAGER: "Brand Manager",
    CONTENT_CREATOR: "Content Creator",
    COMPLIANCE_REVIEWER: "Brand Manager",
    SUPER_ADMIN: "Brand Manager",
  };

  const activeRoleName = isCreatorRole ? "Content Creator" : "Brand Manager";
  const activeAccentOption = accentOptions.find((a) => a.id === accentColor) || accentOptions[0];

  const handleToggleRole = () => {
    const nextRole: UserRole = isCreatorRole ? "BRAND_MANAGER" : "CONTENT_CREATOR";
    setActiveRole(nextRole);
    if (nextRole === "CONTENT_CREATOR") {
      // If switching to Creator and current route is not accessible, go to creator-studio
      const creatorRoutes: RouteId[] = ["overview", "creator-studio", "golden-facts", "audit-history"];
      if (!creatorRoutes.includes(currentRoute)) {
        setCurrentRoute("creator-studio");
      }
    }
  };

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    try {
      if (authLogout) {
        await authLogout();
      }
      await logout();
    } catch (err) {
      console.warn("Sign out error:", err);
    } finally {
      setIsAuthenticated(false);
      setIsDemoMode(false);
      localStorage.removeItem("inkloom_active_user");
      localStorage.removeItem("inkloom_access_token");
      localStorage.removeItem("inkloom_refresh_token");
      if (onGoHome) {
        onGoHome();
      } else {
        window.location.hash = "";
      }
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name) return isCreatorRole ? "CC" : "BM";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const currentUserName = currentUser?.full_name || (isCreatorRole ? "Marcus Vance" : "Sarah Chen");

  return (
    <div className="flex h-screen bg-transparent text-[var(--text-primary)] font-sans overflow-hidden transition-colors duration-300 relative">
      {/* =====================================================================
          1. Architectural Sidebar Navigation
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
              <span className="font-sans font-bold text-[16px] tracking-tight block text-[var(--text-primary)]">
                Inkloom
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-medium -mt-0.5 block truncate tracking-wide">
                Autonomous Brand Governance
              </span>
            </div>
          </div>

          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              title="Return to Product Landing Page"
              className="text-[12px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] px-2 py-1 rounded-lg border border-transparent hover:border-[var(--border-subtle)] transition-all flex items-center gap-1"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Landing</span>
            </button>
          )}
        </div>

        {/* Active Workspace / Dedicated Enterprise Brand (Nexus Cloud) */}
        <div className="p-3.5 border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[12px] uppercase font-bold tracking-[0.04em] text-[var(--text-muted)] flex items-center gap-1.5 font-sans">
              <Activity className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
              Active Workspace
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25 flex items-center gap-1 font-sans">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified Demo
            </span>
          </div>

          <div className="w-full flex items-center justify-between p-2.5 rounded-xl surface-glass-subtle border border-[var(--border-default)] shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="h-4 w-4 rounded-lg block ring-2 ring-[var(--accent-border)] ring-offset-1 ring-offset-[var(--bg-surface)] shadow-xs shrink-0"
                style={{ backgroundColor: activeBrand.secondaryColor || "#F26A0F" }}
              />
              <div className="truncate">
                <div className="text-[13px] font-bold text-[var(--text-primary)] truncate font-sans">
                  {activeBrand.name}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] truncate flex items-center gap-1">
                  <span>{activeBrand.industry || "Enterprise Software / Infrastructure"}</span>
                  <span>•</span>
                  <span className="text-[var(--accent-text)] font-semibold">Production</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Categories and Items (Independently Scrollable with Fade Edges) */}
        <nav
          className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 pb-20 space-y-4 focus-visible:outline-none scroll-smooth"
          aria-label="Workspace Sidebar Navigation"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "var(--border-default) transparent",
          }}
        >
          {navGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter((item) => item.roles.includes(activeRole));
            if (visibleItems.length === 0) return null;
            const isCollapsed = !!collapsedGroups[group.id];

            return (
              <div key={group.id} className="space-y-1">
                {/* Collapsible Section Header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={!isCollapsed}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer rounded-lg font-sans"
                >
                  <span>{group.title}</span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${
                      isCollapsed ? "-rotate-90 text-[var(--text-muted)]" : "rotate-0 text-[var(--text-secondary)]"
                    }`}
                  />
                </button>

                {!isCollapsed && (
                  <div className="space-y-1 pt-0.5">
                    {visibleItems.map((item) => {
                      const isActive = currentRoute === item.id;
                      return (
                        <button
                          key={item.id}
                          ref={isActive ? activeNavRef : undefined}
                          type="button"
                          onClick={() => setCurrentRoute(item.id)}
                          className={`w-full h-10 min-h-[40px] flex items-center justify-between px-3 rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] relative group ${
                            isActive
                              ? "bg-[var(--accent-subtle)] text-white font-semibold border border-[var(--accent-border)] shadow-[0_0_12px_rgba(242,106,15,0.14)]"
                              : "text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-white border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`shrink-0 transition-colors ${
                                isActive
                                  ? "text-[var(--accent-primary)]"
                                  : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                              }`}
                            >
                              {renderNavIcon(item.icon)}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge && (
                            <Badge
                              variant={isActive ? "glow" : item.badgeVariant || "neutral"}
                              size="sm"
                              className="shrink-0"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

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

        {/* Sidebar Footer: Viewing-As Role Chip */}
        <div className="p-3.5 border-t border-[var(--border-subtle)] shrink-0 bg-[var(--bg-surface-subtle)]/40">
          {/* Unambiguous Role Chip: Viewing As */}
          <div className="p-2.5 rounded-xl surface-glass-subtle border border-[var(--border-default)] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="truncate">
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.04em] font-semibold block">
                  Viewing As:
                </span>
                <span className="text-[13px] font-bold text-[var(--text-primary)] block truncate">
                  {activeRoleName}
                </span>
              </div>
            </div>

            {/* Quick Toggle Role Button */}
            <button
              type="button"
              onClick={handleToggleRole}
              title={`Switch role to ${isCreatorRole ? "Brand Manager" : "Content Creator"}`}
              className="px-2 py-1 text-[11px] font-semibold text-[var(--accent-text)] bg-[var(--accent-subtle)] hover:bg-[var(--accent-primary)] hover:text-white rounded-lg border border-[var(--accent-border)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-primary)]"
            >
              Switch
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          2. Main Content Canvas & Floating Header
          ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Sticky Glass Top Bar */}
        <header className="sticky top-0 h-16 surface-glass surface-glass-highlight border-b border-[var(--glass-border)] px-4 sm:px-6 flex items-center justify-between shrink-0 transition-colors duration-200 z-30 shadow-xs backdrop-blur-md">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Path: Tenant / Page (Rendered as Plain Text, NOT a Pill) */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[14px]">
              <span className="font-semibold text-[var(--text-secondary)] truncate">
                {activeBrand.name}
              </span>
              <span className="text-[var(--text-muted)] select-none">/</span>
              <span className="font-bold text-[var(--text-primary)] truncate font-sans">
                {PAGE_TITLES[currentRoute] || currentRoute}
              </span>
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* User Profile Menu with Avatar + Name + Role + Sign Out Inside */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
                aria-label="Open user profile menu"
                className="h-10 flex items-center gap-2.5 px-2.5 rounded-xl surface-glass-subtle border border-[var(--border-default)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-surface)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] shadow-xs"
              >
                {/* User Avatar */}
                <div className="h-7 w-7 rounded-lg bg-[var(--accent-primary)] text-[var(--accent-contrast)] flex items-center justify-center font-bold text-xs shrink-0">
                  {getUserInitials(currentUserName)}
                </div>

                <div className="hidden sm:block text-left truncate max-w-[130px]">
                  <span className="text-[13px] font-semibold text-[var(--text-primary)] block truncate leading-tight">
                    {currentUserName}
                  </span>
                  <span className="text-[11px] font-bold text-[var(--accent-text)] uppercase tracking-[0.04em] block truncate leading-tight">
                    {activeRoleName}
                  </span>
                </div>

                <ChevronDown
                  className={`h-3.5 w-3.5 text-[var(--text-muted)] shrink-0 transition-transform duration-150 ${
                    userMenuOpen ? "rotate-180 text-[var(--accent-primary)]" : ""
                  }`}
                />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 bg-[#16111d] border border-[var(--border-strong)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-[100] p-2 animate-in fade-in zoom-in-95 duration-100"
                  role="menu"
                >
                  <div className="px-3 py-2 border-b border-[var(--border-subtle)] mb-1">
                    <span className="text-[13px] font-bold text-[var(--text-primary)] block">
                      {currentUserName}
                    </span>
                    <span className="text-[12px] text-[var(--text-muted)] block truncate">
                      {currentUser?.email || (isCreatorRole ? "creator@inkloom.ai" : "admin@inkloom.ai")}
                    </span>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-[0.04em] px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)]">
                      {activeRoleName}
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        handleToggleRole();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer text-left"
                    >
                      <span className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-[var(--accent-primary)]" />
                        <span>Switch to {isCreatorRole ? "Brand Manager" : "Content Creator"}</span>
                      </span>
                    </button>
                  </div>

                  <div className="pt-1.5 mt-1 border-t border-[var(--border-subtle)]">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer text-left font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Workspace Main Canvas Container (Max-width 1280px, 24px padding, 24px vertical rhythm) */}
        <main className="flex-1 overflow-y-auto p-6 transition-colors duration-200">
          <div className="max-w-[1280px] mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* =====================================================================
          3. Mobile Drawer Navigation
          ===================================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-80 surface-glass surface-glass-highlight border-r border-[var(--glass-border)] p-5 flex flex-col justify-between shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-contrast)] flex items-center justify-center font-bold text-xs shadow-glow">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="font-sans font-bold text-base text-[var(--text-primary)]">Inkloom</span>
                    <span className="text-[10px] text-[var(--text-muted)] block">Autonomous Brand Governance</span>
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
                <div className="text-[11px] uppercase font-bold text-[var(--text-muted)] tracking-[0.04em] mb-1 font-sans">
                  Active Brand
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: activeBrand.secondaryColor || "var(--accent-primary)" }}
                  />
                  <span className="text-xs font-bold text-[var(--text-primary)]">{activeBrand.name}</span>
                </div>
              </div>

              {/* Navigation Items Grouped */}
              <nav className="space-y-3 pt-1">
                {navGroups.map((group) => {
                  const filtered = group.items.filter((item) => item.roles.includes(activeRole));
                  if (filtered.length === 0) return null;
                  return (
                    <div key={group.id} className="space-y-1">
                      <div className="px-2 text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--text-muted)] font-sans">
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
                              className={`w-full h-10 min-h-[40px] flex items-center justify-between px-3 rounded-xl text-[13px] font-medium transition-all ${
                                isActive
                                  ? "bg-[var(--accent-subtle)] text-[var(--accent-text)] font-semibold border-l-4 border-[var(--accent-primary)]"
                                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span>{renderNavIcon(item.icon)}</span>
                                <span className="truncate">{item.label}</span>
                              </div>
                              {item.badge && (
                                <Badge size="sm" variant={item.badgeVariant || "neutral"}>
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

            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2 text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-xl hover:bg-[var(--bg-surface-subtle)]"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
