import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Brand, UserRole, RouteId, UserProfile } from "../types";
import { MOCK_BRANDS } from "../data/mockData";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";

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
  const { status, user: authUser, role: authRole, tenant: authTenant, isDemo: authIsDemo, signOut } = useAuth();

  const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS);
  const [activeBrand, setActiveBrand] = useState<Brand>(MOCK_BRANDS[0]);
  const [activeRole, setActiveRole] = useState<UserRole>("CONTENT_CREATOR");
  const [currentRoute, setCurrentRoute] = useState<RouteId>("overview");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Sync workspace state from AuthContext whenever auth changes
  useEffect(() => {
    const isAuthed = status === "signed_in";
    setIsAuthenticated(isAuthed);
    setIsDemoMode(authIsDemo);

    if (isAuthed && authUser) {
      const roleMapped: UserRole = authRole === "admin" ? "BRAND_MANAGER" : "CONTENT_CREATOR";
      setActiveRole(roleMapped);

      if (authIsDemo) {
        setBrands(MOCK_BRANDS);
        setActiveBrand(MOCK_BRANDS[0]);
        setCurrentUser({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.name,
          is_active: true,
          is_superuser: authRole === "admin",
          memberships: [
            {
              brand_id: MOCK_BRANDS[0].id,
              brand_name: MOCK_BRANDS[0].name,
              brand_slug: MOCK_BRANDS[0].slug,
              role: roleMapped,
            },
          ],
        });
      } else {
        // Real user workspace
        const brandId = authTenant?.id || `tenant_${authUser.id}`;
        const brandName = authTenant?.name || `${authUser.name}'s Workspace`;
        const realBrand: Brand = {
          id: brandId,
          name: brandName,
          slug: brandName.toLowerCase().replace(/\s+/g, "-"),
          tagline: "Autonomous Brand Governance",
          industry: authTenant?.industry || "Enterprise Software",
          primaryColor: "#F26A0F",
          secondaryColor: "#F26A0F",
          toneGuidelines: ["Professional", "Compliant"],
          activeRulesCount: 0,
          goldenFactsCount: 0,
        };

        setBrands([realBrand]);
        setActiveBrand(realBrand);
        setCurrentUser({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.name,
          is_active: true,
          is_superuser: authRole === "admin",
          memberships: [
            {
              brand_id: brandId,
              brand_name: brandName,
              brand_slug: realBrand.slug,
              role: roleMapped,
            },
          ],
        });
      }
    } else {
      // Signed out
      setCurrentUser(null);
      setIsDemoMode(false);
    }
  }, [status, authUser, authRole, authTenant, authIsDemo]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const res = await api.login(credentials);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setIsDemoMode(false);
    } catch {
      // Offline fallback
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
      const res = await api.registerBrand(data);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setIsDemoMode(false);
    } catch {
      // Offline fallback
    }
  };

  const registerCreator = async (data: {
    email: string;
    password: string;
    full_name: string;
    invitation_token?: string;
  }) => {
    try {
      const res = await api.registerCreator(data);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setIsDemoMode(false);
    } catch {
      // Offline fallback
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch {
      // Ignored
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setIsDemoMode(false);
      setCurrentRoute("overview");
      localStorage.removeItem("inkloom_active_user");
      localStorage.removeItem("inkloom_access_token");
      localStorage.removeItem("inkloom_refresh_token");
    }
  };

  const switchBrand = (brandId: string) => {
    const brand = brands.find((b) => b.id === brandId);
    if (!brand) return;
    setActiveBrand(brand);
  };

  const refreshActiveBrand = async () => {
    if (!api.hasTokens() || !activeBrand?.id) return;
    try {
      const updated = await api.getBrand(activeBrand.id);
      if (updated) {
        setActiveBrand((prev) => ({
          ...prev,
          name: updated.name,
          slug: updated.slug,
          description: updated.description,
          website: updated.website,
        }));
      }
    } catch {
      // Ignore
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
