// Shared Supabase client that works both in the bundled build (Vite)
// and when serving the plain HTML files directly from the repo.
let createClient;

try {
  // Prefer the local dependency when the project is bundled.
  ({ createClient } = await import('@supabase/supabase-js'));
} catch (error) {
  // Fall back to the CDN build for plain-browser usage.
  ({ createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'));
}

const DEFAULT_SUPABASE_URL = 'https://ebezqrsgednjwhajddqu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXpxcnNnZWRuandoYWpkZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTEyNzYsImV4cCI6MjA1MDAyNzI3Nn0.6UpoIFJuEGDnLlD3_8w-fyQ2qMZ7uNDUttk-4Aeavgw';

const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const browserEnv = (typeof window !== 'undefined' && window.__ENV__) ? window.__ENV__ : {};

const supabaseUrl = viteEnv.VITE_SUPABASE_URL || browserEnv.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = viteEnv.VITE_SUPABASE_ANON_KEY || browserEnv.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Faltan credenciales. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (Vite) o crea env.js con window.__ENV__ = { SUPABASE_URL, SUPABASE_ANON_KEY }');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
