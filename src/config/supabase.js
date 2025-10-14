// Support both Vite (bundled) and plain browser via CDN
let createClient;
try {
  // Try local dependency (Vite / bundlers)
  ({ createClient } = await import('@supabase/supabase-js'));
} catch (e) {
  // Fallback to CDN when running without bundler
  ({ createClient } = await import('https://esm.sh/@supabase/supabase-js@2'));
}

// Resolve env from Vite or window.__ENV__ (env.js)
const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const browserEnv = (typeof window !== 'undefined' && window.__ENV__) ? window.__ENV__ : {};

const supabaseUrl = viteEnv.VITE_SUPABASE_URL || browserEnv.SUPABASE_URL;
const supabaseKey = viteEnv.VITE_SUPABASE_ANON_KEY || browserEnv.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.warn('[Supabase] Faltan credenciales. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (Vite) o crea env.js con window.__ENV__ = { SUPABASE_URL, SUPABASE_ANON_KEY }');
}

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;
