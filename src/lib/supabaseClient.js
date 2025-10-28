import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ebezqrsgednjwhajddqu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXpxcnNnZWRuandoYWpkZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTEyNzYsImV4cCI6MjA1MDAyNzI3Nn0.6UpoIFJuEGDnLlD3_8w-fyQ2qMZ7uNDUttk-4Aeavgw';

const PLACEHOLDER_VALUES = new Set(['', 'undefined', 'null', 'false', '0']);

function sanitizeEnvValue(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || PLACEHOLDER_VALUES.has(trimmed.toLowerCase())) {
    return null;
  }

  return trimmed;
}

function getEnvValue(keys) {
  for (const key of keys) {
    const fromProcess = typeof process !== 'undefined' ? sanitizeEnvValue(process.env?.[key]) : null;
    if (fromProcess) {
      return fromProcess;
    }

    const fromImportMeta = typeof import.meta !== 'undefined' ? sanitizeEnvValue(import.meta.env?.[key]) : null;
    if (fromImportMeta) {
      return fromImportMeta;
    }

    const fromWindow = typeof window !== 'undefined' ? sanitizeEnvValue(window.__ENV__?.[key]) : null;
    if (fromWindow) {
      return fromWindow;
    }
  }

  return null;
}

const supabaseUrl = getEnvValue(['NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL', 'SUPABASE_URL']) || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  getEnvValue(['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY']) ||
  DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
