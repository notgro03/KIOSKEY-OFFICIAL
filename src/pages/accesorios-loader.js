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
    <i class="fas fa-tools" style="font-size: 56px; margin-bottom: 16px; display: block; opacity: 0.55;"></i>
    ${message}
  </div>`;
}

function createMedia({ image_url }) {
  if (image_url && image_url.trim() !== '') {
    return `<img src="${image_url}" alt="Accesorio Kioskeys" data-image="${image_url}">`;
  }

  return `<div class="catalog-card__placeholder">
    <i class="fas fa-toolbox"></i>
  </div>`;
}

function createWhatsappUrl(product) {
  const details = [product.title, product.brand, product.model]
    .filter(Boolean)
    .join(' ');
  const message = `Hola, me interesa el siguiente accesorio: ${details}. ¿Podrían brindarme información sobre precio y disponibilidad?`;
  return `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
}

export async function loadAccesorios() {
  const container = document.getElementById('productsGrid');

  if (!container) return;

  container.innerHTML = renderLoading('Cargando accesorios...');

  try {
    const { data: category } = await supabase
      .from('product_categories')
      .select('*')
      .eq('slug', 'accesorios')
      .maybeSingle();

    if (!category) {
      container.innerHTML = renderEmpty('No se encontró la categoría de accesorios.');
      return;
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', category.id)
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.error('Error loading products:', error);
      container.innerHTML = renderEmpty('Error al cargar los accesorios.');
      return;
    }

    if (!products || products.length === 0) {
      container.innerHTML = renderEmpty('No hay accesorios disponibles en este momento.');
      return;
    }

    container.innerHTML = products.map(product => {
      const whatsappUrl = createWhatsappUrl(product);
      const hasStock = typeof product.stock === 'number' ? product.stock > 0 : true;
      const price = Number(product.price || 0);

      return `
        <article class="catalog-card">
          <div class="catalog-card__media">
            ${createMedia(product)}
            <span class="catalog-card__status ${hasStock ? 'catalog-card__status--available' : 'catalog-card__status--soldout'}">
              <i class="fas ${hasStock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
              ${hasStock ? 'Disponible' : 'Agotado'}
            </span>
          </div>
          <div class="catalog-card__body">
            <h3 class="catalog-card__title">${product.title}</h3>
            ${product.brand || product.model ? `<p class="catalog-card__meta"><i class="fas fa-tag"></i>${product.brand || ''} ${product.model || ''}</p>` : ''}
            ${product.description ? `<p class="catalog-card__description">${product.description}</p>` : ''}
            <div class="catalog-card__footer">
              ${price > 0 ? `<span class="catalog-card__price">$${price.toLocaleString('es-AR')}</span>` : '<span class="catalog-card__meta"><i class="fas fa-comment"></i> Consultar precio</span>'}
              <a href="${whatsappUrl}" target="_blank" rel="noopener" class="catalog-card__cta">
                <i class="fab fa-whatsapp"></i>
                Consultar
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    bindZoomableMedia(container, '.catalog-card__media img');
  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = renderEmpty('Error al cargar los accesorios.');
  }
}
