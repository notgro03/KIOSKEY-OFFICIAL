const SUPABASE_URL = 'https://ebezqrsgednjwhajddqu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXpxcnNnZWRuandoYWpkZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTEyNzYsImV4cCI6MjA1MDAyNzI3Nn0.6UpoIFJuEGDnLlD3_8w-fyQ2qMZ7uNDUttk-4Aeavgw';

const CDN_SPECIFIER = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

let createClientFn;

if (typeof window !== 'undefined') {
  if (window.Supabase?.createClient) {
    createClientFn = window.Supabase.createClient;
  } else if (window.__supabaseCreateClient) {
    createClientFn = window.__supabaseCreateClient;
  }
}

if (!createClientFn) {
  const module = await import(CDN_SPECIFIER);
  createClientFn = module.createClient;

  if (typeof window !== 'undefined') {
    window.__supabaseCreateClient = createClientFn;
  }
}

export const supabase = createClientFn(SUPABASE_URL, SUPABASE_KEY);

if (typeof window !== 'undefined') {
  window.supabase = supabase;
}

export default supabase;
