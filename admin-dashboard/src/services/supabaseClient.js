import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;
let initPromise = null;

const DEFAULT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://aucxwdwiubevbmsprlhy.supabase.co';
const STATIC_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Initializes and returns the Supabase client.
 * First checks Vite environment variables, then falls back to fetching safe public config from FastAPI backend.
 */
export async function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    let url = DEFAULT_URL;
    let anonKey = STATIC_KEY;

    // If key not bundled in Vite build, dynamically fetch safe public key from backend
    if (!anonKey || anonKey.trim().length < 10) {
      try {
        const res = await fetch('/api/auth/config');
        if (res.ok) {
          const config = await res.json();
          if (config.supabase_url) url = config.supabase_url;
          if (config.supabase_anon_key && config.supabase_anon_key.trim().length > 10) {
            anonKey = config.supabase_anon_key.trim();
          }
        }
      } catch (err) {
        console.warn('[Inkloom Auth] Could not fetch backend auth config:', err);
      }
    }

    if (anonKey && anonKey.length > 10) {
      try {
        supabaseInstance = createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        console.log('[Inkloom Auth] Connected to Supabase Auth at', url);
        return supabaseInstance;
      } catch (e) {
        console.warn('[Inkloom Auth] Failed to initialize Supabase client:', e);
      }
    }

    return null;
  })();

  return initPromise;
}

/**
 * Sign up a new user with Email, Password, and Full Name.
 * Automatically tags role as 'creator'.
 */
export async function signUpUser({ email, password, fullName, role = 'creator' }) {
  const client = await getSupabaseClient();
  if (!client) {
    // Graceful offline/demo fallback
    const mockUser = {
      id: 'usr_' + Date.now().toString(36),
      email,
      fullName: fullName || email.split('@')[0],
      role,
      workspace: 'Acme Brand v2',
      isDemo: true
    };
    localStorage.setItem('inkloom_active_user', JSON.stringify(mockUser));
    return { user: mockUser, session: null, isFallback: true };
  }

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
        workspace: 'Acme Brand v2'
      }
    }
  });

  if (error) throw error;

  // Ensure user is auto-confirmed in database
  try {
    await fetch('/api/auth/confirm-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  } catch (_) {}

  // If session not returned directly on signup, sign in automatically
  let activeSession = data.session;
  let activeUser = data.user;

  if (!activeSession) {
    try {
      const signInRes = await client.auth.signInWithPassword({ email, password });
      if (signInRes.data?.session) {
        activeSession = signInRes.data.session;
        activeUser = signInRes.data.user;
      }
    } catch (_) {}
  }

  const userProfile = {
    id: activeUser?.id || 'usr_' + Date.now(),
    email: activeUser?.email || email,
    fullName: fullName || activeUser?.user_metadata?.full_name || email.split('@')[0],
    role: role || activeUser?.user_metadata?.role || 'creator',
    workspace: 'Acme Brand v2',
    isDemo: false
  };

  localStorage.setItem('inkloom_active_user', JSON.stringify(userProfile));
  return { user: userProfile, session: activeSession };
}

/**
 * Sign in an existing user with Email and Password.
 */
export async function signInUser({ email, password }) {
  const client = await getSupabaseClient();
  if (!client) {
    // Graceful demo fallback
    const mockUser = {
      id: 'usr_' + Date.now().toString(36),
      email,
      fullName: email.split('@')[0],
      role: 'creator',
      workspace: 'Acme Brand v2',
      isDemo: true
    };
    localStorage.setItem('inkloom_active_user', JSON.stringify(mockUser));
    return { user: mockUser, session: null, isFallback: true };
  }

  let { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  // If Supabase reports "Email not confirmed", trigger auto-confirm and retry once seamlessly!
  if (error && error.message && error.message.toLowerCase().includes('email not confirmed')) {
    try {
      const confirmRes = await fetch('/api/auth/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (confirmRes.ok) {
        const retry = await client.auth.signInWithPassword({ email, password });
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      }
    } catch (confirmErr) {
      console.warn('[Inkloom Auth] Auto-confirm retry error:', confirmErr);
    }
  }

  if (error) throw error;

  let role = data.user.user_metadata?.role || 'creator';
  let fullName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Content Creator';
  let workspace = data.user.user_metadata?.workspace || 'Acme Brand v2';

  // Consult the database public.profiles table as single source of truth for role
  try {
    const { data: dbProfile } = await client
      .from('profiles')
      .select('role, full_name, workspace')
      .eq('id', data.user.id)
      .single();

    if (dbProfile) {
      if (dbProfile.role) role = dbProfile.role;
      if (dbProfile.full_name) fullName = dbProfile.full_name;
      if (dbProfile.workspace) workspace = dbProfile.workspace;
    }
  } catch (pErr) {
    console.warn('[Inkloom Auth] Could not fetch public.profiles row:', pErr);
  }

  const userProfile = {
    id: data.user.id,
    email: data.user.email,
    fullName,
    role,
    workspace,
    isDemo: false
  };

  localStorage.setItem('inkloom_active_user', JSON.stringify(userProfile));
  return { user: userProfile, session: data.session };
}

/**
 * Sign out active user.
 */
export async function signOutUser() {
  localStorage.removeItem('inkloom_active_user');
  const client = await getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('[Inkloom Auth] Sign out error:', e);
    }
  }
}
