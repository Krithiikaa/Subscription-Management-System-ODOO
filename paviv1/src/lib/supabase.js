import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = rawSupabaseUrl ? rawSupabaseUrl.trim() : '';
const supabaseAnonKey = rawSupabaseAnonKey ? rawSupabaseAnonKey.trim() : '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabaseAnonKey.includes('your-anon-key')
);

// Fallback dummy client if credentials are not yet entered to prevent module initialization crashes
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase is not configured yet. Please configure your .env file.') }),
        signUp: async () => ({ data: null, error: new Error('Supabase is not configured yet. Please configure your .env file.') }),
        signOut: async () => ({ error: null }),
        resetPasswordForEmail: async () => ({ data: null, error: new Error('Supabase is not configured yet. Please configure your .env file.') }),
        updateUser: async () => ({ data: null, error: new Error('Supabase is not configured yet. Please configure your .env file.') }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error('Supabase is not configured yet.') }),
            order: () => Promise.resolve({ data: [], error: null }),
          }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
        insert: async () => ({ data: null, error: new Error('Supabase is not configured yet.') }),
        update: () => ({ eq: async () => ({ data: null, error: new Error('Supabase is not configured yet.') }) }),
        delete: () => ({ eq: async () => ({ data: null, error: new Error('Supabase is not configured yet.') }) }),
      }),
      rpc: async () => ({ data: null, error: new Error('Supabase is not configured yet.') }),
    };

/**
 * Returns the dynamically determined or explicitly configured application URL.
 * Guarantees that active Vite development URL & port (desktop or mobile network IP)
 * is used, without hardcoding an incorrect port.
 */
export const getAppBaseUrl = () => {
  // 1. Explicit environment override if developer sets VITE_APP_URL or VITE_SITE_URL in paviv1/.env
  const customUrl = import.meta.env.VITE_APP_URL || import.meta.env.VITE_SITE_URL;
  if (customUrl && typeof customUrl === 'string' && customUrl.trim().length > 0) {
    return customUrl.trim().replace(/\/+$/, '');
  }

  // 2. Active browser window origin (covers http://localhost:5174, http://localhost:5173, http://192.168.1.9:5174, etc.)
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  // 3. Fallback
  return 'http://localhost:5174';
};

/**
 * Constructs an absolute authentication redirect URL with the specified path.
 */
export const getAuthRedirectUrl = (path = '/login') => {
  const base = getAppBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};
