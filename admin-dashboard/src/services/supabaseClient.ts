import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient | null> | null = null;

const DEFAULT_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://aucxwdwiubevbmsprlhy.supabase.co";
const STATIC_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (supabaseInstance) return supabaseInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    let url = DEFAULT_URL;
    let anonKey = STATIC_KEY;

    if (!anonKey || anonKey.trim().length < 10) {
      try {
        const res = await fetch("/api/auth/config");
        if (res.ok) {
          const config = await res.json();
          if (config.supabase_url) url = config.supabase_url;
          if (config.supabase_anon_key && config.supabase_anon_key.trim().length > 10) {
            anonKey = config.supabase_anon_key.trim();
          }
        }
      } catch (err) {
        console.warn("[Inkloom Auth] Could not fetch backend auth config:", err);
      }
    }

    if (anonKey && anonKey.length > 10) {
      try {
        supabaseInstance = createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });
        return supabaseInstance;
      } catch (e) {
        console.warn("[Inkloom Auth] Failed to initialize Supabase client:", e);
      }
    }

    return null;
  })();

  return initPromise;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: "CONTENT_CREATOR" | "BRAND_MANAGER" | "OWNER" | "SUPER_ADMIN";
    workspace: string;
    isDemo?: boolean;
  };
  sessionToken?: string;
}

export async function signInWithSupabase(credentials: { email: string; password: string }): Promise<AuthResult> {
  const client = await getSupabaseClient();
  
  // If Supabase not configured or offline, provide graceful fallback
  if (!client) {
    const isOwner = credentials.email.includes("admin") || credentials.email.includes("owner");
    return {
      user: {
        id: "usr_" + Date.now().toString(36),
        email: credentials.email,
        fullName: credentials.email.split("@")[0],
        role: isOwner ? "BRAND_MANAGER" : "CONTENT_CREATOR",
        workspace: "Acme Brand v2",
        isDemo: true,
      },
    };
  }

  let { data, error } = await client.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  // If email not confirmed, trigger backend auto-confirm helper and retry once
  if (error && error.message && error.message.toLowerCase().includes("email not confirmed")) {
    try {
      const confirmRes = await fetch("/api/auth/confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: credentials.email }),
      });
      if (confirmRes.ok) {
        const retry = await client.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      }
    } catch (cErr) {
      console.warn("[Inkloom Auth] Auto-confirm retry error:", cErr);
    }
  }

  if (error) {
    throw new Error(error.message);
  }

  let dbRole = data.user?.user_metadata?.role || "creator";
  let fullName = data.user?.user_metadata?.full_name || credentials.email.split("@")[0];
  let workspace = data.user?.user_metadata?.workspace || "Acme Brand v2";

  // Single Source of Truth: Consult PostgreSQL public.profiles table
  try {
    const { data: dbProfile } = await client
      .from("profiles")
      .select("role, full_name, workspace")
      .eq("id", data.user?.id)
      .single();

    if (dbProfile) {
      if (dbProfile.role) dbRole = dbProfile.role;
      if (dbProfile.full_name) fullName = dbProfile.full_name;
      if (dbProfile.workspace) workspace = dbProfile.workspace;
    }
  } catch (pErr) {
    console.warn("[Inkloom Auth] Could not query profiles table:", pErr);
  }

  const mappedRole: "CONTENT_CREATOR" | "BRAND_MANAGER" =
    dbRole === "admin" || dbRole === "owner" || dbRole === "brand_manager"
      ? "BRAND_MANAGER"
      : "CONTENT_CREATOR";

  return {
    user: {
      id: data.user?.id || "usr_" + Date.now(),
      email: data.user?.email || credentials.email,
      fullName,
      role: mappedRole,
      workspace,
      isDemo: false,
    },
    sessionToken: data.session?.access_token,
  };
}

export async function signUpWithSupabase(data: {
  email: string;
  password: string;
  fullName: string;
  role: "creator" | "admin";
  workspace?: string;
}): Promise<AuthResult> {
  const client = await getSupabaseClient();
  const workspace = data.workspace || "Acme Brand v2";

  if (!client) {
    return {
      user: {
        id: "usr_" + Date.now().toString(36),
        email: data.email,
        fullName: data.fullName,
        role: data.role === "admin" ? "BRAND_MANAGER" : "CONTENT_CREATOR",
        workspace,
        isDemo: true,
      },
    };
  }

  const { data: authData, error } = await client.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        role: data.role,
        workspace,
      },
    },
  });

  if (error) throw new Error(error.message);

  // Auto-confirm email so creator can use right away
  try {
    await fetch("/api/auth/confirm-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email }),
    });
  } catch (_) {}

  const mappedRole: "CONTENT_CREATOR" | "BRAND_MANAGER" =
    data.role === "admin" ? "BRAND_MANAGER" : "CONTENT_CREATOR";

  return {
    user: {
      id: authData.user?.id || "usr_" + Date.now(),
      email: data.email,
      fullName: data.fullName,
      role: mappedRole,
      workspace,
      isDemo: false,
    },
    sessionToken: authData.session?.access_token,
  };
}
