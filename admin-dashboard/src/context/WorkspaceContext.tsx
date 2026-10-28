import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Brand, UserRole, RouteId, UserProfile } from "../types";
import { MOCK_BRANDS } from "../data/mockData";
import { api } from "../api/client";
import { signInWithSupabase, signUpWithSupabase } from "../services/supabaseClient";

interface WorkspaceContextType {
  currentUser: UserProfile | null;
  activeBrand: Brand;
  setActiveBrand: (brand: Brand) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  currentRoute: RouteId;
  setCurrentRoute: (route: RouteId) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  isDemoMode: boolean;
  setIsDemoMode: (demo: boolean) => void;
  brands: Brand[];
  login: (credentials: { email: string; password: string }) => Promise<void>;
  loginDemoCreator: () => void;
  loginDemoAdmin: () => void;
  registerBrand: (data: {
    email: string;
    password: string;
    full_name: string;
    brand_name: string;
    brand_slug: string;
    website?: string;
  }) => Promise<void>;
  registerCreator: (data: {
    email: string;
    password: string;
    full_name: string;
    invitation_token?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  switchBrand: (brandId: string) => void;
  refreshActiveBrand: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS);
  const [activeBrand, setActiveBrand] = useState<Brand>(MOCK_BRANDS[0]);
  const [activeRole, setActiveRole] = useState<UserRole>("BRAND_MANAGER");
  const [currentRoute, setCurrentRoute] = useState<RouteId>("overview");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Restore session from token or local cache on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem("inkloom_active_user");
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        setCurrentUser(parsed);
        setIsAuthenticated(true);
        setIsDemoMode(!!parsed.isDemo);
        if (parsed.memberships && parsed.memberships.length > 0) {
          const role = (parsed.memberships[0].role as UserRole) || "CONTENT_CREATOR";
          setActiveRole(role);
          setCurrentRoute(role === "CONTENT_CREATOR" ? "creator-studio" : "overview");
        } else if (parsed.role) {
          const role = (parsed.role as UserRole) || "CONTENT_CREATOR";
          setActiveRole(role);
          setCurrentRoute(role === "CONTENT_CREATOR" ? "creator-studio" : "overview");
        }
        return;
      } catch (_) {}
    }

    if (api.hasTokens()) {
      api
        .getMe()
        .then((profile) => {
          setCurrentUser(profile);
          setIsAuthenticated(true);
          setIsDemoMode(false);

          if (profile.memberships && profile.memberships.length > 0) {
            const mappedBrands: Brand[] = profile.memberships.map((m) => ({
              id: m.brand_id,
              name: m.brand_name,
              slug: m.brand_slug,
              tagline: "Brand Identity & Governance",
              industry: "Enterprise",
              primaryColor: "#0f172a",
              secondaryColor: "#3b82f6",
              toneGuidelines: ["Professional", "Compliant"],
              activeRulesCount: 0,
              goldenFactsCount: 0,
            }));
            setBrands(mappedBrands);
            setActiveBrand(mappedBrands[0]);
            const role = (profile.memberships[0].role as UserRole) || "CONTENT_CREATOR";
            setActiveRole(role);
            setCurrentRoute(role === "CONTENT_CREATOR" ? "creator-studio" : "overview");
          }
        })
        .catch(() => {
          api.clearTokens();
          setIsAuthenticated(false);
          setCurrentUser(null);
        });
    }
  }, []);

  const loginDemoCreator = () => {
    const creatorUser: UserProfile = {
      id: "demo-creator-marcus",
      email: "marcus.vance@inkloom.internal",
      full_name: "Marcus Vance",
      is_active: true,
      created_at: new Date().toISOString(),
      memberships: [
        {
          brand_id: activeBrand.id,
          brand_name: activeBrand.name,
          brand_slug: activeBrand.slug,
          role: "CONTENT_CREATOR",
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ],
    };
    setCurrentUser(creatorUser);
    setIsAuthenticated(true);
    setIsDemoMode(true);
    setActiveRole("CONTENT_CREATOR");
    setCurrentRoute("creator-studio");
    localStorage.setItem("inkloom_active_user", JSON.stringify(creatorUser));
  };

  const loginDemoAdmin = () => {
    const adminUser: UserProfile = {
      id: "demo-admin-sarah",
      email: "sarah.chen@inkloom.internal",
      full_name: "Sarah Chen",
      is_active: true,
      created_at: new Date().toISOString(),
      memberships: [
        {
          brand_id: activeBrand.id,
          brand_name: activeBrand.name,
          brand_slug: activeBrand.slug,
          role: "BRAND_MANAGER",
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ],
    };
    setCurrentUser(adminUser);
    setIsAuthenticated(true);
    setIsDemoMode(true);
    setActiveRole("BRAND_MANAGER");
    setCurrentRoute("overview");
    localStorage.setItem("inkloom_active_user", JSON.stringify(adminUser));
  };

  const login = async (credentials: { email: string; password: string }) => {
    // 1. Try Supabase Authentication First
    try {
      const sbResult = await signInWithSupabase(credentials);
      const userProfile: UserProfile = {
        id: sbResult.user.id,
        email: sbResult.user.email,
        full_name: sbResult.user.fullName,
        is_active: true,
        created_at: new Date().toISOString(),
        memberships: [
          {
            brand_id: activeBrand.id,
            brand_name: activeBrand.name,
            brand_slug: activeBrand.slug,
            role: sbResult.user.role,
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ],
      };
      setCurrentUser(userProfile);
      setIsAuthenticated(true);
      setIsDemoMode(false);
      setActiveRole(sbResult.user.role as UserRole);
      setCurrentRoute(sbResult.user.role === "CONTENT_CREATOR" ? "creator-studio" : "overview");
      localStorage.setItem("inkloom_active_user", JSON.stringify(userProfile));
      return;
    } catch (sbErr: any) {
      console.warn("[WorkspaceContext] Supabase login error:", sbErr.message);
      // If error is password mismatch or explicit error, check if api client is preferred
    }

    // 2. Fallback to API Client
    const res = await api.login(credentials);
    setCurrentUser(res.user);
    setIsAuthenticated(true);
    setIsDemoMode(false);

    if (res.user.memberships && res.user.memberships.length > 0) {
      const mappedBrands: Brand[] = res.user.memberships.map((m) => ({
        id: m.brand_id,
        name: m.brand_name,
        slug: m.brand_slug,
        tagline: "Brand Identity & Governance",
        industry: "Enterprise",
        primaryColor: "#0f172a",
        secondaryColor: "#3b82f6",
        toneGuidelines: ["Professional", "Compliant"],
        activeRulesCount: 0,
        goldenFactsCount: 0,
      }));
      setBrands(mappedBrands);
      setActiveBrand(mappedBrands[0]);
      const role = (res.user.memberships[0].role as UserRole) || "CONTENT_CREATOR";
      setActiveRole(role);
      setCurrentRoute(role === "CONTENT_CREATOR" ? "creator-studio" : "overview");
    }
  };

  const registerBrand = async (data: {
    email: string;
    password: string;
    full_name: string;
    brand_name: string;
    brand_slug: string;
    website?: string;
  }) => {
    try {
      const sbResult = await signUpWithSupabase({
        email: data.email,
        password: data.password,
        fullName: data.full_name,
        role: "admin",
        workspace: data.brand_name,
      });

      const initialBrand: Brand = {
        id: "brand-" + Date.now().toString(36),
        name: data.brand_name,
        slug: data.brand_slug,
        tagline: "Brand Identity & Governance",
        industry: "Enterprise",
        primaryColor: "#0f172a",
        secondaryColor: "#3b82f6",
        toneGuidelines: ["Professional", "Compliant"],
        activeRulesCount: 0,
        goldenFactsCount: 0,
      };

      const userProfile: UserProfile = {
        id: sbResult.user.id,
        email: data.email,
        full_name: data.full_name,
        is_active: true,
        created_at: new Date().toISOString(),
        memberships: [
          {
            brand_id: initialBrand.id,
            brand_name: initialBrand.name,
            brand_slug: initialBrand.slug,
            role: "OWNER",
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ],
      };

      setBrands([initialBrand]);
      setActiveBrand(initialBrand);
      setCurrentUser(userProfile);
      setIsAuthenticated(true);
      setIsDemoMode(false);
      setActiveRole("OWNER");
      setCurrentRoute("overview");
      localStorage.setItem("inkloom_active_user", JSON.stringify(userProfile));
      return;
    } catch (e) {
      console.warn("[WorkspaceContext] Supabase sign up skipped, using API:", e);
    }

    const res = await api.registerBrand(data);
    setCurrentUser(res.user);
    setIsAuthenticated(true);
    setIsDemoMode(false);

    if (res.user.memberships && res.user.memberships.length > 0) {
      const initialBrand: Brand = {
        id: res.user.memberships[0].brand_id,
        name: res.user.memberships[0].brand_name,
        slug: res.user.memberships[0].brand_slug,
        tagline: "Brand Identity & Governance",
        industry: "Enterprise",
        primaryColor: "#0f172a",
        secondaryColor: "#3b82f6",
        toneGuidelines: ["Professional", "Compliant"],
        activeRulesCount: 0,
        goldenFactsCount: 0,
      };
      setBrands([initialBrand]);
      setActiveBrand(initialBrand);
      setActiveRole("OWNER");
      setCurrentRoute("overview");
    }
  };

  const registerCreator = async (data: {
    email: string;
    password: string;
    full_name: string;
    invitation_token?: string;
  }) => {
    try {
      const sbResult = await signUpWithSupabase({
        email: data.email,
        password: data.password,
        fullName: data.full_name,
        role: "creator",
        workspace: activeBrand.name,
      });

      const userProfile: UserProfile = {
        id: sbResult.user.id,
        email: data.email,
        full_name: data.full_name,
        is_active: true,
        created_at: new Date().toISOString(),
        memberships: [
          {
            brand_id: activeBrand.id,
            brand_name: activeBrand.name,
            brand_slug: activeBrand.slug,
            role: "CONTENT_CREATOR",
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ],
      };

      setCurrentUser(userProfile);
      setIsAuthenticated(true);
      setIsDemoMode(false);
      setActiveRole("CONTENT_CREATOR");
      setCurrentRoute("creator-studio");
      localStorage.setItem("inkloom_active_user", JSON.stringify(userProfile));
      return;
    } catch (e) {
      console.warn("[WorkspaceContext] Supabase creator signup skipped, using API:", e);
    }

    const res = await api.registerCreator(data);
    setCurrentUser(res.user);
    setIsAuthenticated(true);
    setIsDemoMode(false);
    setActiveRole("CONTENT_CREATOR");
    setCurrentRoute("creator-studio");
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignored
    } finally {
      localStorage.removeItem("inkloom_active_user");
      setCurrentUser(null);
      setIsAuthenticated(false);
      setIsDemoMode(false);
      setBrands(MOCK_BRANDS);
      setActiveBrand(MOCK_BRANDS[0]);
      setActiveRole("BRAND_MANAGER");
      setCurrentRoute("overview");
    }
  };

  const switchBrand = (brandId: string) => {
    const brand = brands.find((b) => b.id === brandId);
    if (!brand) return;

    setActiveBrand(brand);
    if (currentUser) {
      const membership = currentUser.memberships.find((m) => m.brand_id === brandId);
      if (membership) {
        const role = (membership.role as UserRole) || "CONTENT_CREATOR";
        setActiveRole(role);
        setCurrentRoute(role === "CONTENT_CREATOR" ? "creator-studio" : "overview");
      }
    }
  };

  const refreshActiveBrand = async () => {
    if (!api.hasTokens() || !activeBrand?.id) return;
    try {
      const updated = await api.getBrand(activeBrand.id);
      const mapped: Brand = {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        website: updated.website,
        tagline: updated.tagline || "Brand Identity & Governance",
        industry: updated.industry || "Enterprise",
        primaryColor: updated.primary_color || "#0f172a",
        secondaryColor: updated.secondary_color || "#3b82f6",
        toneGuidelines:
          updated.brand_voice && updated.brand_voice.length > 0 ? updated.brand_voice : ["Professional", "Compliant"],
        supported_channels: updated.supported_channels || ["all"],
        target_audience: updated.target_audience,
        brand_voice: updated.brand_voice,
        preferred_terminology: updated.preferred_terminology,
        prohibited_terminology: updated.prohibited_terminology,
        reviewer_contact_email: updated.reviewer_contact_email,
        review_thresholds: updated.review_thresholds,
        activeRulesCount: activeBrand.activeRulesCount,
        goldenFactsCount: activeBrand.goldenFactsCount,
      };
      setActiveBrand(mapped);
      setBrands((prev) => prev.map((b) => (b.id === mapped.id ? mapped : b)));
    } catch {
      // Ignore if offline/mock
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentUser,
        activeBrand,
        setActiveBrand,
        activeRole,
        setActiveRole,
        currentRoute,
        setCurrentRoute,
        isAuthenticated,
        setIsAuthenticated,
        isDemoMode,
        setIsDemoMode,
        brands,
        login,
        loginDemoCreator,
        loginDemoAdmin,
        registerBrand,
        registerCreator,
        logout,
        switchBrand,
        refreshActiveBrand,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
