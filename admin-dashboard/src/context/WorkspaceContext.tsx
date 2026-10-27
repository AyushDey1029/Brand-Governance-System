import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Brand, UserRole, RouteId, UserProfile } from "../types";
import { MOCK_BRANDS } from "../data/mockData";
import { api } from "../api/client";

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

  // Restore session from token on mount
  useEffect(() => {
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
            setActiveRole((profile.memberships[0].role as UserRole) || "CONTENT_CREATOR");
          }
        })
        .catch(() => {
          api.clearTokens();
          setIsAuthenticated(false);
          setCurrentUser(null);
        });
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
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
      setActiveRole((res.user.memberships[0].role as UserRole) || "CONTENT_CREATOR");
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
    }
  };

  const registerCreator = async (data: {
    email: string;
    password: string;
    full_name: string;
    invitation_token?: string;
  }) => {
    const res = await api.registerCreator(data);
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
      setActiveRole((res.user.memberships[0].role as UserRole) || "CONTENT_CREATOR");
    } else {
      setActiveRole("CONTENT_CREATOR");
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignored
    } finally {
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
    // Find role in this brand if real user
    if (currentUser) {
      const membership = currentUser.memberships.find((m) => m.brand_id === brandId);
      if (membership) {
        setActiveRole((membership.role as UserRole) || "CONTENT_CREATOR");
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
        toneGuidelines: updated.brand_voice && updated.brand_voice.length > 0 ? updated.brand_voice : ["Professional", "Compliant"],
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
