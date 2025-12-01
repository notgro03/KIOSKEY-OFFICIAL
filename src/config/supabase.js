import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ukwnvcxzhremqvtzsgpt.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd252Y3h6aHJlbXF2dHpzZ3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDEwOTYsImV4cCI6MjA4MDE3NzA5Nn0._-gTkfmflBcdDiHqXX_9aINIC4p5eAtLnWC_cFA3BYU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
