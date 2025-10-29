import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ebezqrsqednjwhajddqu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXpxcnNnZWRuandoYWpkZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTEyNzYsImV4cCI6MjA1MDAyNzI3Nn0.6UpoIFJuEGDnLlD3_8w-fyQ2qMZ7uNDUttk-4Aeavgw';

const PLACEHOLDER_VALUES = new Set(['', 'undefined', 'null', 'false', '0']);
const INVALID_HOSTNAME_PATTERN = /(?:^|\.|-)(?:undefined|null|false)(?:\.|-|$)/i;

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

function readFromProcess(key) {
  return typeof process !== 'undefined' ? sanitizeEnvValue(process.env?.[key]) : null;
}

function readFromImportMeta(key) {
  try {
    return typeof import.meta !== 'undefined' ? sanitizeEnvValue(import.meta.env?.[key]) : null;
  } catch (error) {
    return null;
  }
}

function readFromWindow(key) {
  return typeof window !== 'undefined' ? sanitizeEnvValue(window.__ENV__?.[key]) : null;
}

function getEnvEntry(keys) {
  for (const key of keys) {
    const candidates = [readFromProcess(key), readFromImportMeta(key), readFromWindow(key)];

    for (const candidate of candidates) {
      if (candidate) {
        return { key, value: candidate };
      }
    }
  }

  return { key: null, value: null };
}

function normalizeSupabaseUrl(value) {
  const sanitized = sanitizeEnvValue(value);
  if (!sanitized) {
    return null;
  }

  try {
    const url = new URL(sanitized);

    if (!url.hostname || INVALID_HOSTNAME_PATTERN.test(url.hostname)) {
      return null;
    }

    let pathname = url.pathname || '';
    if (pathname.endsWith('/rest/v1')) {
      pathname = pathname.slice(0, -('/rest/v1'.length));
    }

    pathname = pathname.replace(/\/$/, '');

    const normalized = pathname && pathname !== '/' ? `${url.origin}${pathname}` : url.origin;
    return normalized;
  } catch (error) {
    return null;
  }
}

function logEnvWarning(message) {
  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(message);
  }
}

const urlEntry = getEnvEntry(['NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL', 'SUPABASE_URL']);
const anonKeyEntry = getEnvEntry(['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY']);

const normalizedUrl = normalizeSupabaseUrl(urlEntry.value);
const resolvedSupabaseUrl = normalizedUrl || DEFAULT_SUPABASE_URL;

if (!urlEntry.value) {
  logEnvWarning(
    '[supabase] Environment variables NEXT_PUBLIC_SUPABASE_URL / VITE_SUPABASE_URL are not defined. Falling back to the default project URL.'
  );
} else if (!normalizedUrl) {
  const sourceKey = urlEntry.key || 'NEXT_PUBLIC_SUPABASE_URL';
  logEnvWarning(
    `[supabase] The configured Supabase URL from ${sourceKey} is invalid (value: "${urlEntry.value}"). Falling back to the default project URL.`
  );
}

const resolvedSupabaseAnonKey = anonKeyEntry.value || DEFAULT_SUPABASE_ANON_KEY;

if (!anonKeyEntry.value) {
  logEnvWarning(
    '[supabase] Environment variables NEXT_PUBLIC_SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY are not defined. Falling back to the default anon key.'
  );
}

export const supabase = createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey);

export default supabase;
