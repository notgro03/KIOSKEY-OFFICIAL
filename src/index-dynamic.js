import { supabase } from './config/supabase.js';

// Cargar GIFs del banner desde Supabase
async function loadBannerGifs() {
  const { data: gifs, error } = await supabase
    .from('banner_gifs')
    .select('*')
    .eq('active', true)
    .order('order_position');

  if (error) {
    console.error('Error loading gifs:', error);
    return;
  }

  const container = document.querySelector('.gif-gallery-grid');
  if (!container) return;

  container.innerHTML = gifs.map((gif, index) => `
    <div class="gif-card gif-card-${index + 1}" data-aos="fade-up" data-aos-delay="${index * 100}">
      <div class="gif-card-content">
        <img src="${gif.url}" alt="${gif.alt_text}" loading="lazy">
      </div>
    </div>
  `).join('');
}

// Cargar productos para la página principal
async function loadHomeProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('order_position')
    .limit(4);

  if (error) {
    console.error('Error loading products:', error);
    return;
  }

  const container = document.querySelector('.features-grid');
  if (!container) return;

  container.innerHTML = products.map(product => {
    return `
      <a href="${product.link_url}" class="feature-card shiny-button">
        <div>
          <i class="fas ${product.icon} feature-icon"></i>
          <h3 class="shiny-text">${product.title}</h3>
          <p>${product.description}</p>
        </div>
      </a>
    `;
  }).join('');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  loadBannerGifs();
  loadHomeProducts();
});
