import { supabase } from './config/supabase.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadBannerVideos);
} else {
  loadBannerVideos();
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  loadHomeProducts();
});
