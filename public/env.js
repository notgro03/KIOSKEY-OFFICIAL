// Variables de entorno disponibles cuando la app se ejecuta sin bundler.
// Sobrescribe estos valores en producción si es necesario.
window.__ENV__ = window.__ENV__ || {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
};
