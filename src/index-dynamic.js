import { supabase, isSupabaseConfigured } from './config/supabase.js';

const supabaseClient = isSupabaseConfigured ? supabase : null;

const FALLBACK_VIDEOS = [
  {
    url: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4',
    mimeType: 'video/mp4',
    alt: 'Video institucional de Kioskeys',
    poster: 'https://storage.googleapis.com/coverr-main/poster/Mt_Baker.jpg'
  },
  {
    url: 'https://storage.googleapis.com/coverr-main/mp4/Night_Drive.mp4',
    mimeType: 'video/mp4',
    alt: 'Automóvil con telemando inteligente',
    poster: 'https://storage.googleapis.com/coverr-main/poster/Night_Drive.jpg'
  },
  {
    url: 'https://storage.googleapis.com/coverr-main/mp4/Typing_on_Laptop.mp4',
    mimeType: 'video/mp4',
    alt: 'Gestión digital de llaves',
    poster: 'https://storage.googleapis.com/coverr-main/poster/Typing_on_Laptop.jpg'
  }
];

function renderHeroMedia(items) {
  const container = document.querySelector('.video-gallery-grid');
  if (!container) return;

  container.innerHTML = items.map((item, index) => {
    const delay = index * 100;
    const isVideo = item.type === 'video' || item.media_type === 'video' ||
      (item.mimeType ? item.mimeType.startsWith('video/') : /\.(mp4|webm|ogg)$/i.test(item.url));

    const mediaContent = isVideo
      ? `<video autoplay loop muted playsinline preload="metadata"${item.poster ? ` poster="${item.poster}"` : ''}>
          <source src="${item.url}" type="${item.mimeType || item.media_type || 'video/mp4'}">
        </video>`
      : `<img src="${item.url}" alt="${item.alt || 'Banner multimedia'}" loading="lazy">`;

    return `
      <div class="video-card video-card-${index + 1}" data-aos="fade-up" data-aos-delay="${delay}">
        <div class="video-card-content">
          ${mediaContent}
        </div>
      </div>
    `;
  }).join('');
}

// Cargar GIFs/Videos del banner desde Supabase
async function loadBannerGifs() {
  if (!supabaseClient) {
    console.warn('[Supabase] Cliente no configurado. Se muestran videos predefinidos.');
    renderHeroMedia(FALLBACK_VIDEOS);
    return;
  }

  const { data: gifs, error } = await supabaseClient
    .from('banner_gifs')
    .select('*')
    .eq('active', true)
    .order('order_position');

  if (error) {
    console.error('Error loading gifs:', error);
    renderHeroMedia(FALLBACK_VIDEOS);
    return;
  }

  if (!gifs || gifs.length === 0) {
    renderHeroMedia(FALLBACK_VIDEOS);
    return;
  }

  const normalizedMedia = gifs.map((gif, index) => ({
    url: gif.url,
    mimeType: gif.mime_type || gif.media_type,
    media_type: gif.media_type,
    type: gif.type,
    alt: gif.alt_text || `Banner ${index + 1}`,
    poster: gif.poster_url || gif.thumbnail_url
  }));

  renderHeroMedia(normalizedMedia);
}

// Cargar productos para la página principal
async function loadHomeProducts() {
  if (!supabaseClient) {
    console.warn('[Supabase] Cliente no configurado. Se muestran productos predefinidos.');
    return;
  }

  const { data: products, error } = await supabaseClient
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
