import { supabase } from './config/supabase.js';

// Cargar GIFs del banner desde Supabase
const FALLBACK_GIFS = [
  {
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYmZlMGJxYzZ6cTU4Y2p6bngzcDhneW1ndTR3dXoyZG50Y3YwMm9mZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/pFgPDlQyE4pUI/giphy.gif',
    alt_text: 'Telemando inalámbrico en funcionamiento',
  },
  {
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGIwaGNzcnMxdXJjNWN4dnRxeWl1b2cxbmtzZjB6ZmZ3YnhqYmZwbCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/q5nX9XxId6R3u/giphy.gif',
    alt_text: 'Programación de llaves inteligentes',
  },
  {
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjI1NHVvODN3MmpvbGh3dTlucjh4bzFnd2M1OWtsY3RycjVhMGFhOCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oEduJ82h8xj6OrAv6/giphy.gif',
    alt_text: 'Automóvil conectándose a servicios digitales',
  },
];

async function loadBannerGifs() {
  const container = document.querySelector('.gif-gallery-grid');
  if (!container) return;

  let gifs = [];

  try {
    const { data, error } = await supabase
      .from('banner_gifs')
      .select('*')
      .eq('active', true)
      .order('order_position');

    if (error) {
      throw error;
    }

    gifs = data ?? [];
  } catch (error) {
    console.error('Error loading gifs:', error);
  }

  const hasRemoteGifs = Array.isArray(gifs) && gifs.length > 0;
  const gifSource = hasRemoteGifs ? gifs : FALLBACK_GIFS;

  if (!hasRemoteGifs) {
    console.info('[Banner] No hay GIFs activos en Supabase, se muestran ejemplos.');
  }

  container.innerHTML = gifSource.map((gif, index) => `
    <div class="gif-card gif-card-${index + 1}" data-aos="fade-up" data-aos-delay="${index * 100}">
      <div class="gif-card-content">
        <img src="${gif.url}" alt="${gif.alt_text || 'GIF de Kioskeys'}" loading="lazy">
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
