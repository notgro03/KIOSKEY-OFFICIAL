import { supabase } from '../config/supabase.js';
import { bindZoomableMedia } from '../utils/media-modal.js';

const WHATSAPP_NUMBER = '541157237390';

function renderLoading(message) {
  return `<div class="search-message" style="grid-column: 1/-1; padding: 40px;">
    <i class="fas fa-spinner fa-spin" style="font-size: 28px; margin-bottom: 12px; display: block;"></i>
    ${message}
  </div>`;
}

function renderEmpty(message) {
  return `<div class="search-message" style="grid-column: 1/-1; padding: 48px 20px;">
    <i class="fas fa-car" style="font-size: 56px; margin-bottom: 16px; display: block; opacity: 0.55;"></i>
    ${message}
  </div>`;
}

function createMedia({ image_url, video_url, brand, model }) {
  const hasVideo = video_url && video_url.trim() !== '';

  if (hasVideo) {
    return `<video autoplay loop muted playsinline>
      <source src="${video_url}" type="video/mp4">
    </video>`;
  }

  if (image_url && image_url.trim() !== '') {
    return `<img src="${image_url}" alt="Telemando ${brand} ${model}" data-image="${image_url}">`;
  }

  return `<div class="catalog-card__placeholder">
    <i class="fas fa-car"></i>
  </div>`;
}

function createWhatsappUrl({ brand, model, description }) {
  const message = `Hola, me interesa obtener una cotización para el siguiente producto: ${brand} ${model} ${description || ''}`;
  return `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
}

export async function loadTelemandos() {
  const container = document.getElementById('productsGrid');

  if (!container) return;

  container.innerHTML = renderLoading('Cargando telemandos...');

  try {
    const { data, error } = await supabase
      .from('telemandos')
      .select('id, brand, model, description, image_url, video_url')
      .order('brand', { ascending: true })
      .order('model', { ascending: true });

    if (error) {
      console.error('Error loading telemandos:', error);
      container.innerHTML = renderEmpty('Error al cargar los telemandos');
      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML = renderEmpty('No hay telemandos disponibles');
      return;
    }

    container.innerHTML = data.map(item => {
      const whatsappUrl = createWhatsappUrl(item);
      return `
        <article class="catalog-card">
          <div class="catalog-card__media">
            ${createMedia(item)}
          </div>
          <div class="catalog-card__body">
            <h3 class="catalog-card__title">Telemando ${item.brand} ${item.model}</h3>
            ${item.description ? `<p class="catalog-card__description">${item.description}</p>` : ''}
            <a href="${whatsappUrl}" target="_blank" rel="noopener" class="catalog-card__cta">
              <i class="fab fa-whatsapp"></i>
              Consultar
            </a>
          </div>
        </article>
      `;
    }).join('');

    bindZoomableMedia(container, '.catalog-card__media img');
  } catch (err) {
    console.error('Unexpected error:', err);
    container.innerHTML = renderEmpty('Error al cargar los telemandos');
  }
}
