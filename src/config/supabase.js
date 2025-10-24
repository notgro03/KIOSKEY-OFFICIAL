import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined'
  ? process.env.NEXT_PUBLIC_SUPABASE_URL
  : 'https://ebezqrsgednjwhajddqu.supabase.co';

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'undefined'
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXpxcnNnZWRuandoYWpkZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTEyNzYsImV4cCI6MjA1MDAyNzI3Nn0.6UpoIFJuEGDnLlD3_8w-fyQ2qMZ7uNDUttk-4Aeavgw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verificar que la conexión funcione correctamente
(async () => {
  const { data, error } = await supabase.from('productos').select('*').limit(1);
  if (error) {
    console.error('Error al conectar con Supabase:', error.message);
  } else {
    console.log('Conexión Supabase OK. Producto de prueba:', data);
  }
})();
