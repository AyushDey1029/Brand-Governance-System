import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getSupabaseClient, 
  signInUser, 
  signUpUser, 
  signOutUser 
} from '../services/supabaseClient';

const AuthContext = createContext(null);

const DEMO_TENANT = {
  id: 'brand-nexus',
  name: 'Nexus Cloud',
  plan: 'Production',
  industry: 'Enterprise Software / Infrastructure'
};

const DEMO_CREATOR = {
  id: 'demo-creator-marcus',
  name: 'Marcus Vance',
  email: 'creator@nexuscloud.internal',
  avatarUrl: null
};

const DEMO_ADMIN = {
  id: 'demo-admin-sarah',
  name: 'Sarah Jenkins',
  email: 'admin@nexuscloud.internal',
  avatarUrl: null
};

export function AuthProvider({ children }) {
  // Status: "loading" | "signed_out" | "signed_in"
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('creator'); // 'admin' | 'creator'
  const [tenant, setTenant] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [session, setSession] = useState(null);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'
  const [authPortal, setAuthPortal] = useState('creator'); // 'creator' | 'admin'

  // Hydrate auth session on mount
  useEffect(() => {
    let mounted = true;

    async function hydrateAuth() {
      try {
        // 1. Check local session storage first for immediate offline/cached recovery
        const savedSession = localStorage.getItem('inkloom_active_user');
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            if (parsed && mounted) {
              if (parsed.isDemo) {
                setIsDemo(true);
                const isAdm = parsed.role === 'admin';
                setRole(isAdm ? 'admin' : 'creator');
                setUser(isAdm ? DEMO_ADMIN : DEMO_CREATOR);
                setTenant(DEMO_TENANT);
                setStatus('signed_in');
              } else {
                setIsDemo(false);
                setRole(parsed.role === 'admin' ? 'admin' : 'creator');
                setUser({
                  id: parsed.id,
                  name: parsed.fullName || parsed.name || parsed.email?.split('@')[0] || 'User',
                  email: parsed.email,
                  avatarUrl: parsed.avatarUrl || null
                });
                setTenant({
                  id: 'tenant_' + (parsed.id || 'default'),
                  name: parsed.workspace || `${parsed.fullName || 'Enterprise'}'s Workspace`,
                  plan: 'Enterprise',
                  industry: 'Enterprise Software'
                });
                setStatus('signed_in');
              }
            }
          } catch (e) {
            console.warn('[Inkloom Auth] Failed parsing saved user session:', e);
          }
        }

        // 2. Validate against live Supabase auth if client is configured
        const client = await getSupabaseClient();
        if (client) {
          const { data } = await client.auth.getSession();
          if (mounted && data?.session?.user) {
            const u = data.session.user;
            setSession(data.session);

            let userRole = u.user_metadata?.role === 'admin' ? 'admin' : 'creator';
            let fullName = u.user_metadata?.full_name || u.email?.split('@')[0] || 'Creator';
            let workspaceName = u.user_metadata?.workspace || `${fullName}'s Workspace`;

            try {
              const { data: dbProfile } = await client
                .from('profiles')
                .select('role, full_name, workspace')
                .eq('id', u.id)
                .single();
              if (dbProfile) {
                if (dbProfile.role) userRole = dbProfile.role === 'admin' ? 'admin' : 'creator';
                if (dbProfile.full_name) fullName = dbProfile.full_name;
                if (dbProfile.workspace) workspaceName = dbProfile.workspace;
              }
            } catch (_) {}

            const realUser = {
              id: u.id,
              name: fullName,
              email: u.email,
              avatarUrl: null
            };

            const realTenant = {
              id: 'tenant_' + u.id,
              name: workspaceName,
              plan: 'Enterprise',
              industry: 'Enterprise Software'
            };

            setIsDemo(false);
            setUser(realUser);
            setRole(userRole);
            setTenant(realTenant);
            setStatus('signed_in');

            localStorage.setItem('inkloom_active_user', JSON.stringify({
              id: u.id,
              name: fullName,
              fullName,
              email: u.email,
              role: userRole,
              workspace: workspaceName,
              isDemo: false
            }));
          } else if (!savedSession && mounted) {
            setStatus('signed_out');
          }

          // Listen for Supabase auth state transitions
          client.auth.onAuthStateChange((_event, newSession) => {
            if (!mounted) return;
            setSession(newSession);
            if (newSession?.user) {
              const u = newSession.user;
              const uRole = u.user_metadata?.role === 'admin' ? 'admin' : 'creator';
              const fName = u.user_metadata?.full_name || u.email?.split('@')[0] || 'User';
              const wName = u.user_metadata?.workspace || `${fName}'s Workspace`;

              setIsDemo(false);
              setUser({ id: u.id, name: fName, email: u.email, avatarUrl: null });
              setRole(uRole);
              setTenant({ id: 'tenant_' + u.id, name: wName, plan: 'Enterprise', industry: 'Enterprise Software' });
              setStatus('signed_in');

              localStorage.setItem('inkloom_active_user', JSON.stringify({
                id: u.id,
                name: fName,
                fullName: fName,
                email: u.email,
                role: uRole,
                workspace: wName,
                isDemo: false
              }));
            } else if (!isDemo && !localStorage.getItem('inkloom_active_user')) {
              setUser(null);
              setTenant(null);
              setStatus('signed_out');
            }
          });
        } else if (!savedSession && mounted) {
          setStatus('signed_out');
        }
      } catch (err) {
        console.warn('[Inkloom Auth] Hydration encountered an issue:', err);
        if (mounted && status === 'loading') {
          setStatus('signed_out');
        }
      } finally {
        if (mounted) {
          setStatus((prev) => (prev === 'loading' ? 'signed_out' : prev));
        }
      }
    }

    hydrateAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================================
  // ACTIONS: SIGN IN / SIGN UP / SIGN OUT
  // =========================================================================

  const signIn = async (credentials) => {
    const res = await signInUser(credentials);
    const u = res.user;
    const userRole = u.role === 'admin' ? 'admin' : 'creator';
    const realUser = {
      id: u.id,
      name: u.fullName || u.email?.split('@')[0] || 'User',
      email: u.email,
      avatarUrl: null
    };
    const realTenant = {
      id: 'tenant_' + u.id,
      name: u.workspace || `${realUser.name}'s Workspace`,
      plan: 'Enterprise',
      industry: 'Enterprise Software'
    };

    setIsDemo(false);
    setUser(realUser);
    setRole(userRole);
    setTenant(realTenant);
    setStatus('signed_in');
    setSession(res.session);

    localStorage.setItem('inkloom_active_user', JSON.stringify({
      id: u.id,
      name: realUser.name,
      fullName: realUser.name,
      email: u.email,
      role: userRole,
      workspace: realTenant.name,
      isDemo: false
    }));

    closeAuthModal();
    return res;
  };

  const signUp = async ({ email, password, fullName, role: requestedRole = authPortal, workspaceName }) => {
    const res = await signUpUser({ email, password, fullName, role: requestedRole });
    const u = res.user;
    const userRole = (requestedRole || u.role) === 'admin' ? 'admin' : 'creator';
    const realUser = {
      id: u.id,
      name: fullName || u.email?.split('@')[0] || 'User',
      email: u.email,
      avatarUrl: null
    };
    const realTenant = {
      id: 'tenant_' + u.id,
      name: workspaceName || `${realUser.name}'s Workspace`,
      plan: 'Enterprise',
      industry: 'Enterprise Software'
    };

    setIsDemo(false);
    setUser(realUser);
    setRole(userRole);
    setTenant(realTenant);
    setStatus('signed_in');
    setSession(res.session);

    localStorage.setItem('inkloom_active_user', JSON.stringify({
      id: u.id,
      name: realUser.name,
      fullName: realUser.name,
      email: u.email,
      role: userRole,
      workspace: realTenant.name,
      isDemo: false
    }));

    closeAuthModal();
    return res;
  };

  const signOut = async () => {
    try {
      await signOutUser();
    } catch (_) {}

    setUser(null);
    setTenant(null);
    setSession(null);
    setIsDemo(false);
    setStatus('signed_out');

    localStorage.removeItem('inkloom_active_user');
    localStorage.removeItem('inkloom_access_token');
    localStorage.removeItem('inkloom_refresh_token');
  };

  // =========================================================================
  // DEMO MODE ACTIONS
  // =========================================================================

  const enterDemo = (requestedRole = 'creator') => {
    const isAdm = requestedRole === 'admin';
    setIsDemo(true);
    setRole(isAdm ? 'admin' : 'creator');
    setUser(isAdm ? DEMO_ADMIN : DEMO_CREATOR);
    setTenant(DEMO_TENANT);
    setStatus('signed_in');

    localStorage.setItem('inkloom_active_user', JSON.stringify({
      id: isAdm ? DEMO_ADMIN.id : DEMO_CREATOR.id,
      name: isAdm ? DEMO_ADMIN.name : DEMO_CREATOR.name,
      fullName: isAdm ? DEMO_ADMIN.name : DEMO_CREATOR.name,
      email: isAdm ? DEMO_ADMIN.email : DEMO_CREATOR.email,
      role: isAdm ? 'admin' : 'creator',
      workspace: DEMO_TENANT.name,
      isDemo: true
    }));

    closeAuthModal();
  };

  const switchDemoRole = (newRole) => {
    if (!isDemo) return;
    const isAdm = newRole === 'admin';
    setRole(isAdm ? 'admin' : 'creator');
    setUser(isAdm ? DEMO_ADMIN : DEMO_CREATOR);

    localStorage.setItem('inkloom_active_user', JSON.stringify({
      id: isAdm ? DEMO_ADMIN.id : DEMO_CREATOR.id,
      name: isAdm ? DEMO_ADMIN.name : DEMO_CREATOR.name,
      fullName: isAdm ? DEMO_ADMIN.name : DEMO_CREATOR.name,
      email: isAdm ? DEMO_ADMIN.email : DEMO_CREATOR.email,
      role: isAdm ? 'admin' : 'creator',
      workspace: DEMO_TENANT.name,
      isDemo: true
    }));
  };

  // Modal helpers
  const openLoginModal = (portal = 'creator') => {
    setAuthPortal(portal);
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const openSignUpModal = (portal = 'creator') => {
    setAuthPortal(portal);
    setAuthModalMode('signup');
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  // Backward compatibility aliases
  const login = (email, password) => signIn({ email, password });
  const signup = (email, password, fullName, r = authPortal) => signUp({ email, password, fullName, role: r });
  const logout = () => signOut();
  const loginAsDemo = (portal = authPortal) => enterDemo(portal);
  const loginAsAdminDemo = () => enterDemo('admin');
  const switchRole = (newRole) => {
    if (isDemo) {
      switchDemoRole(newRole);
    } else {
      setRole(newRole);
    }
  };

  const isAdmin = role === 'admin';
  const isCreator = role === 'creator';

  const value = {
    // Single Source of Truth
    status,
    user,
    role,
    tenant,
    isDemo,
    session,
    signIn,
    signUp,
    signOut,
    enterDemo,
    switchDemoRole,

    // Modals
    authModalOpen,
    authModalMode,
    authPortal,
    setAuthPortal,
    setAuthModalMode,
    openLoginModal,
    openSignUpModal,
    closeAuthModal,

    // Backward compatibility
    loading: status === 'loading',
    isAdmin,
    isCreator,
    login,
    signup,
    logout,
    loginAsDemo,
    loginAsAdminDemo,
    switchRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
