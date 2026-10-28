import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getSupabaseClient, 
  signInUser, 
  signUpUser, 
  signOutUser 
} from '../services/supabaseClient';

const AuthContext = createContext(null);

const DEMO_CREATOR = {
  id: 'demo-creator-marcus',
  email: 'marcus.vance@inkloom.internal',
  fullName: 'Marcus Vance',
  role: 'creator',
  workspace: 'Acme Brand v2',
  isDemo: true
};

const DEMO_ADMIN = {
  id: 'demo-admin-sarah',
  email: 'sarah.chen@inkloom.internal',
  fullName: 'Sarah Chen',
  role: 'admin',
  workspace: 'Acme Brand v2',
  isDemo: true
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('inkloom_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'
  const [authPortal, setAuthPortal] = useState('creator'); // 'creator' | 'admin'

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const client = await getSupabaseClient();
        if (client) {
          const { data } = await client.auth.getSession();
          if (mounted && data?.session?.user) {
            setSession(data.session);
            const u = data.session.user;
            let role = u.user_metadata?.role || 'creator';
            let fullName = u.user_metadata?.full_name || u.email?.split('@')[0] || 'Content Creator';
            let workspace = u.user_metadata?.workspace || 'Acme Brand v2';

            try {
              const { data: dbProfile } = await client
                .from('profiles')
                .select('role, full_name, workspace')
                .eq('id', u.id)
                .single();
              if (dbProfile) {
                if (dbProfile.role) role = dbProfile.role;
                if (dbProfile.full_name) fullName = dbProfile.full_name;
                if (dbProfile.workspace) workspace = dbProfile.workspace;
              }
            } catch (_) {}

            const profile = {
              id: u.id,
              email: u.email,
              fullName,
              role,
              workspace,
              isDemo: false
            };
            setUser(profile);
            localStorage.setItem('inkloom_active_user', JSON.stringify(profile));
          }

          client.auth.onAuthStateChange((_event, newSession) => {
            if (!mounted) return;
            setSession(newSession);
            if (newSession?.user) {
              const u = newSession.user;
              const profile = {
                id: u.id,
                email: u.email,
                fullName: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Content Creator',
                role: u.user_metadata?.role || 'creator',
                workspace: u.user_metadata?.workspace || 'Acme Brand v2',
                isDemo: false
              };
              setUser(profile);
              localStorage.setItem('inkloom_active_user', JSON.stringify(profile));
            } else if (!localStorage.getItem('inkloom_active_user')) {
              setUser(null);
            }
          });
        }
      } catch (err) {
        console.warn('[Inkloom AuthContext] Init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

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

  const login = async (email, password) => {
    const res = await signInUser({ email, password });
    setUser(res.user);
    setSession(res.session);
    closeAuthModal();
    return res;
  };

  const signup = async (email, password, fullName, role = authPortal) => {
    const res = await signUpUser({ email, password, fullName, role });
    setUser(res.user);
    setSession(res.session);
    closeAuthModal();
    return res;
  };

  const loginAsDemo = (portal = authPortal) => {
    const targetDemo = portal === 'admin' ? DEMO_ADMIN : DEMO_CREATOR;
    setUser(targetDemo);
    setSession(null);
    localStorage.setItem('inkloom_active_user', JSON.stringify(targetDemo));
    closeAuthModal();
    return targetDemo;
  };

  const loginAsAdminDemo = () => {
    return loginAsDemo('admin');
  };

  const switchRole = (newRole) => {
    if (!user) return;
    const isNowAdmin = newRole === 'admin';
    const updated = {
      ...user,
      role: newRole,
      fullName: isNowAdmin 
        ? (user.fullName === 'Marcus Vance' ? 'Sarah Chen' : user.fullName) 
        : (user.fullName === 'Sarah Chen' ? 'Marcus Vance' : user.fullName)
    };
    setUser(updated);
    localStorage.setItem('inkloom_active_user', JSON.stringify(updated));
  };

  const logout = async () => {
    try {
      await signOutUser();
    } catch (_) {}
    setUser(null);
    setSession(null);
    localStorage.removeItem('inkloom_active_user');
    localStorage.removeItem('inkloom_access_token');
    localStorage.removeItem('inkloom_refresh_token');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'reviewer';
  const isCreator = !isAdmin;

  const value = {
    user,
    session,
    loading,
    isAdmin,
    isCreator,
    authModalOpen,
    authModalMode,
    authPortal,
    setAuthPortal,
    setAuthModalMode,
    openLoginModal,
    openSignUpModal,
    closeAuthModal,
    login,
    signup,
    loginAsDemo,
    loginAsAdminDemo,
    switchRole,
    logout
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
