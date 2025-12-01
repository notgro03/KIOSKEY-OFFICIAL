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
  if (typeof process === 'undefined') {
    return { raw: null, value: null };
  }

  const raw = process.env?.[key];
  return { raw, value: sanitizeEnvValue(raw) };
}

function readFromImportMeta(key) {
  try {
    if (typeof import.meta === 'undefined') {
      return { raw: null, value: null };
    }

    const raw = import.meta.env?.[key];
    return { raw, value: sanitizeEnvValue(raw) };
  } catch (error) {
    return { raw: null, value: null };
  }
}

function readFromWindow(key) {
  if (typeof window === 'undefined') {
    return { raw: null, value: null };
  }

  const raw = window.__ENV__?.[key];
  return { raw, value: sanitizeEnvValue(raw) };
}

function getEnvEntry(keys) {
  let fallback = { key: null, raw: null, value: null };

  for (const key of keys) {
    const candidates = [readFromProcess(key), readFromImportMeta(key), readFromWindow(key)];

    for (const candidate of candidates) {
      if (candidate.value) {
        return { key, ...candidate };
      }

      if (candidate.raw !== undefined && candidate.raw !== null && fallback.raw === null) {
        fallback = { key, ...candidate };
      }
    }
  }

  return fallback;
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
  if (urlEntry.raw) {
    const sourceKey = urlEntry.key || 'NEXT_PUBLIC_SUPABASE_URL';
    logEnvWarning(
      `[supabase] The configured Supabase URL from ${sourceKey} is invalid (value: "${urlEntry.raw}"). Falling back to the default project URL.`
    );
  } else {
    logEnvWarning(
      '[supabase] Environment variables NEXT_PUBLIC_SUPABASE_URL / VITE_SUPABASE_URL are not defined. Falling back to the default project URL.'
    );
  }
} else if (!normalizedUrl) {
  const sourceKey = urlEntry.key || 'NEXT_PUBLIC_SUPABASE_URL';
  logEnvWarning(
    `[supabase] The configured Supabase URL from ${sourceKey} is invalid (value: "${urlEntry.value}"). Falling back to the default project URL.`
  );
}

const resolvedSupabaseAnonKey = anonKeyEntry.value || DEFAULT_SUPABASE_ANON_KEY;

if (!anonKeyEntry.value) {
  if (anonKeyEntry.raw) {
    const sourceKey = anonKeyEntry.key || 'NEXT_PUBLIC_SUPABASE_ANON_KEY';
    logEnvWarning(
      `[supabase] The configured Supabase anon key from ${sourceKey} is invalid (value: "${anonKeyEntry.raw}"). Falling back to the default anon key.`
    );
  } else {
    logEnvWarning(
      '[supabase] Environment variables NEXT_PUBLIC_SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY are not defined. Falling back to the default anon key.'
    );
  }
}

export const supabase = createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey);

export default supabase;
