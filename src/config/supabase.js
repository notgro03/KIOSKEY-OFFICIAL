import { createClient } from '@supabase/supabase-js';

const PLACEHOLDER_VALUES = new Set(['', 'undefined', 'null', 'false']);

function sanitizeRaw(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  return PLACEHOLDER_VALUES.has(trimmed.toLowerCase()) ? '' : trimmed;
}

function buildNormalizedUrl(raw) {
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  const cleaned = withProtocol
    .replace(/\s+/g, '')
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/g, '');

  const url = new URL(cleaned);
  const hostname = url.hostname.toLowerCase();
  const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost');
  const hasDomain = hostname.includes('.');

  if (!isLocalhost && !hasDomain) {
    throw new Error(`placeholder host "${hostname}"`);
  }

  const pathname = url.pathname.replace(/\/$/, '');
  const basePath = pathname && pathname !== '/' ? pathname : '';

  return `${url.origin}${basePath}`;
}

function normalizeUrl(value, fallback) {
  const candidates = [sanitizeRaw(value), sanitizeRaw(fallback)].filter(Boolean);

  for (const candidate of candidates) {
    try {
      return buildNormalizedUrl(candidate);
    } catch (error) {
      console.warn('[supabase] Invalid URL provided, falling back to next candidate:', candidate, error.message);
    }
  }

  return '';
}

function normalizeKey(value, fallback) {
  const raw = (value || fallback || '').trim();
  return raw;
}

const DEFAULT_URL = 'https://ebezqrsgegdnjwhajddqu.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXpxcnNnZWRuandoYWpkZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTEyNzYsImV4cCI6MjA1MDAyNzI3Nn0.6UpoIFJuEGDnLlD3_8w-fyQ2qMZ7uNDUttk-4Aeavgw';

const SUPABASE_URL = normalizeUrl(import.meta.env.VITE_SUPABASE_URL, DEFAULT_URL) || DEFAULT_URL;
const SUPABASE_ANON_KEY = normalizeKey(import.meta.env.VITE_SUPABASE_ANON_KEY, DEFAULT_ANON_KEY);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
