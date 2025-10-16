import { supabase } from '../config/supabase.js';

const WHATSAPP_NUMBER = '541157237390';

function renderLoading(message) {
  return `<div style="text-align: center; padding: 40px; color: white;">
    <i class="fas fa-spinner fa-spin" style="font-size: 32px;"></i>
    <p>${message}</p>
  </div>`;
}

function renderEmpty(message) {
  return `<div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.7); grid-column: 1/-1;">
    <i class="fas fa-car" style="font-size: 64px; margin-bottom: 20px; opacity: 0.5;"></i>
    <h3 style="font-size: 24px; margin-bottom: 12px;">${message}</h3>
    <p>Pronto agregaremos más productos a esta categoría</p>
  </div>`;
}

function createMedia({ image_url, video_url, brand, model }) {
  const hasVideo = video_url && video_url.trim() !== '';

  if (hasVideo) {
    return `<video class="result-logo result-video" autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover;">
      <source src="${video_url}" type="video/mp4">
    </video>`;
  }

  if (image_url && image_url.trim() !== '') {
    return `<img src="${image_url}" alt="Telemando ${brand} ${model}" style="width: 100%; height: 100%; object-fit: cover;">`;
  }

  return `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05);">
    <i class="fas fa-car" style="font-size: 64px; color: rgba(255,255,255,0.2);"></i>
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
        <div class="product-card" style="background: linear-gradient(135deg, rgba(15, 15, 15, 0.9), rgba(25, 25, 25, 0.8)); border-radius: 20px; overflow: hidden; border: 2px solid rgba(255,255,255,0.1); transition: all 0.4s ease;">
          <div class="product-image" style="height: 250px; overflow: hidden; position: relative; background: rgba(0,0,0,0.3);">
            ${createMedia(item)}
          </div>
          <div class="product-info" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
            <div>
              <h3 style="color: white; font-size: 20px; margin-bottom: 8px; font-weight: 600;">Telemando ${item.brand} ${item.model}</h3>
              ${item.description ? `<p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6;">${item.description}</p>` : ''}
            </div>
            <a href="${whatsappUrl}" target="_blank" rel="noopener" class="btn-add-cart" style="background: linear-gradient(135deg, rgba(0, 59, 142, 0.9), rgba(0, 114, 188, 0.9)); color: white; border: none; padding: 12px 20px; border-radius: 50px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; text-align: center; text-decoration: none;">
              <i class="fab fa-whatsapp"></i> Consultar
            </a>
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('#productsGrid .product-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
        card.style.boxShadow = '0 12px 40px rgba(0, 163, 255, 0.3)';
        card.style.borderColor = 'rgba(0, 163, 255, 0.5)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'none';
        card.style.borderColor = 'rgba(255,255,255,0.1)';
      });
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    container.innerHTML = renderEmpty('Error al cargar los telemandos');
  }
}
