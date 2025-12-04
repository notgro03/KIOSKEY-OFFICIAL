import { createClient } from '@supabase/supabase-js';

const runtimeEnv = typeof window !== 'undefined' ? window.__ENV__ : undefined;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || runtimeEnv?.SUPABASE_URL;
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || runtimeEnv?.SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Supabase configuration is missing URL or publishable key');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
