import { supabase } from './config/supabase.js';

// Cargar videos/GIFs del banner desde Supabase
const FALLBACK_MEDIA = [
  {
    url: 'https://cdn.pixabay.com/video/2021/08/07/84749-585778679_large.mp4',
    alt_text: 'Programación de un control remoto',
  },
  {
    url: 'https://cdn.pixabay.com/video/2020/04/21/36847-412684201_large.mp4',
    alt_text: 'Técnico de llaves trabajando en un vehículo',
  },
  {
    url: 'https://cdn.pixabay.com/video/2019/10/21/28466-368181311_large.mp4',
    alt_text: 'Llaves inteligentes listas para la entrega',
  },
];

function isVideo(url = '') {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

async function loadBannerMedia() {
  const container = document.querySelector('[data-video-gallery]');
  if (!container) return;

  let mediaItems = [];

  try {
    const { data, error } = await supabase
      .from('banner_gifs')
      .select('*')
      .eq('active', true)
      .order('order_position');

    if (error) {
      throw error;
    }

    mediaItems = data ?? [];
  } catch (error) {
    console.error('Error loading banner media:', error);
  }

  const hasRemoteMedia = Array.isArray(mediaItems) && mediaItems.length > 0;
  const mediaSource = hasRemoteMedia ? mediaItems : FALLBACK_MEDIA;

  if (!hasRemoteMedia) {
    console.info('[Banner] No hay medios activos en Supabase, se muestran ejemplos.');
  }

  container.innerHTML = mediaSource.map((item, index) => {
    const url = item.url || '';
    const alt = item.alt_text || 'Contenido multimedia de Kioskeys';
    const delay = index * 100;
    const isVideoMedia = isVideo(url);

    const mediaContent = isVideoMedia
      ? `<video autoplay loop muted playsinline preload="metadata" poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23111' width='400' height='300'/%3E%3C/svg%3E'>
            <source src="${url}" type="video/mp4">
          </video>`
      : `<img src="${url}" alt="${alt}" loading="lazy">`;

    return `
      <div class="video-card video-card-${index + 1}" data-aos="fade-up" data-aos-delay="${delay}">
        <div class="video-card-content">
          ${mediaContent}
        </div>
      </div>
    `;
  }).join('');
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

function initHome() {
  loadBannerMedia();
  loadHomeProducts();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHome, { once: true });
} else {
  initHome();
}
