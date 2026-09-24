import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Optional custom stored credentials for interactive preview configuration
const localUrl = typeof window !== 'undefined' ? localStorage.getItem('ph_supabase_url') : null;
const localKey = typeof window !== 'undefined' ? localStorage.getItem('ph_supabase_anon_key') : null;

export const isSupabaseConfigured: boolean = Boolean(
  (envSupabaseUrl &&
    envSupabaseUrl.startsWith('http') &&
    !envSupabaseUrl.includes('your-project-id') &&
    !envSupabaseUrl.includes('placeholder-project')) ||
  (localUrl &&
    localUrl.startsWith('http') &&
    !localUrl.includes('placeholder-project'))
);

export const SUPABASE_URL: string = (envSupabaseUrl && envSupabaseUrl.startsWith('http') && !envSupabaseUrl.includes('placeholder-project')) 
  ? envSupabaseUrl 
  : ((localUrl && localUrl.startsWith('http') && !localUrl.includes('placeholder-project')) 
      ? localUrl 
      : 'https://placeholder-project.supabase.co');

export const SUPABASE_ANON_KEY: string = (envSupabaseKey && envSupabaseKey.length > 10 && !envSupabaseKey.includes('placeholder')) 
  ? envSupabaseKey 
  : (localKey || 'placeholder-anon-key');

// Create Supabase singleton client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const setCustomSupabaseCredentials = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ph_supabase_url', url.trim());
    localStorage.setItem('ph_supabase_anon_key', anonKey.trim());
    window.location.reload();
  }
};

export const clearCustomSupabaseCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ph_supabase_url');
    localStorage.removeItem('ph_supabase_anon_key');
    window.location.reload();
  }
};
