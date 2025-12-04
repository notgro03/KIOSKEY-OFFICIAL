import { supabase } from './config/supabase.js';

async function loadBannerGifs() {
  const container = document.querySelector('.gif-gallery-grid');
  if (!container) return;

  try {
    const { data: gifs, error } = await supabase
      .from('banner_gifs')
      .select('id, url, alt_text, order_position')
      .eq('active', true)
      .order('order_position');

    if (error) throw error;

    if (!gifs?.length) {
      container.innerHTML = '<p class="empty-state">No hay GIFs disponibles por el momento.</p>';
      return;
    }

    container.innerHTML = gifs
      .map(
        (gif, index) => `
        <div class="gif-card gif-card-${index + 1}" data-aos="fade-up" data-aos-delay="${index * 100}">
          <div class="gif-card-content">
            <img src="${gif.url}" alt="${gif.alt_text || 'GIF destacado'}" loading="lazy">
          </div>
        </div>
      `
      )
      .join('');
  } catch (err) {
    console.error('Error loading banner GIFs:', err);
    container.innerHTML = '<p class="empty-state">No pudimos cargar los GIFs. Intenta nuevamente más tarde.</p>';
  }
}

async function loadBannerVideos() {
  const container = document.querySelector('.video-gallery-grid');
  if (!container) return;

  try {
    const { data: videos, error } = await supabase
      .from('banner_videos')
      .select('id, url, alt_text, order_num')
      .eq('active', true)
      .order('order_num');

    if (error) throw error;

    if (!videos?.length) {
      container.innerHTML = '<p class="empty-state">No hay videos disponibles por el momento.</p>';
      return;
    }

    container.innerHTML = videos
      .map(
        (video, index) => `
        <div class="video-card video-card-${index + 1}" data-aos="fade-up" data-aos-delay="${index * 100}">
          <div class="video-card-content">
            <video autoplay loop muted playsinline preload="metadata">
              <source src="${video.url}" type="video/mp4">
            </video>
          </div>
        </div>
      `
      )
      .join('');
  } catch (err) {
    console.error('Error loading banner videos:', err);
    container.innerHTML = '<p class="empty-state">No pudimos cargar los videos. Intenta nuevamente más tarde.</p>';
  }
}

const fallbackCards = [
  {
    href: './pages/planes.html',
    icon: 'fa-crown',
    title: 'Elegí tu plan',
    description: 'Planes flexibles que se adaptan a tus necesidades',
  },
  {
    href: './pages/productos.html',
    icon: 'fa-car',
    title: 'Nuestros productos',
    description: 'Telemandos, llaves y carcasas de automóvil',
  },
  {
    href: './pages/red-servicios.html',
    icon: 'fa-map-marker-alt',
    title: 'Red de servicios',
    description: 'Encuentra el punto de servicio más cercano',
  },
  {
    href: './pages/planes.html#pagos',
    icon: 'fa-credit-card',
    title: 'Formas de pago',
    description: 'Múltiples opciones de pago disponibles',
  },
];

// Cargar productos para la página principal
async function loadHomeProducts() {
  const container = document.querySelector('.features-grid');
  if (!container) return;

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('order_position')
      .limit(4);

    if (error) throw error;

    const cardsToRender = (products?.length ? products : fallbackCards).map((product) => ({
      href: product.link_url || product.href,
      icon: product.icon || 'fa-cube',
      title: product.title,
      description: product.description,
    }));

    container.innerHTML = cardsToRender
      .map(
        (card) => `
      <a href="${card.href}" class="feature-card shiny-button">
        <div>
          <i class="fas ${card.icon} feature-icon"></i>
          <h3 class="shiny-text">${card.title}</h3>
          <p>${card.description}</p>
        </div>
      </a>
    `
      )
      .join('');
  } catch (err) {
    console.error('Error loading products:', err);
    container.innerHTML = fallbackCards
      .map(
        (card) => `
      <a href="${card.href}" class="feature-card shiny-button">
        <div>
          <i class="fas ${card.icon} feature-icon"></i>
          <h3 class="shiny-text">${card.title}</h3>
          <p>${card.description}</p>
        </div>
      </a>
    `
      )
      .join('');
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  loadBannerVideos();
  loadBannerGifs();
  loadHomeProducts();
});
