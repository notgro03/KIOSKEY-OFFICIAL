import { supabase } from '../config/supabase.js';

const DEFAULT_WHATSAPP_PHONE = '541157237390';

export function createProductGridLoader({
  table,
  containerId = 'productsGrid',
  loadingMessage = 'Cargando productos...',
  emptyIcon = 'fas fa-box-open',
  emptyTitle = 'No hay productos disponibles',
  emptySubtitle = 'Vuelve a intentarlo más tarde.',
  placeholderIcon = 'fas fa-box',
  consultLabel = 'Consultar',
  previewLabel = 'Ver imagen',
  whatsappPhone = DEFAULT_WHATSAPP_PHONE,
  enablePreview = true,
} = {}) {
  return async function loadProducts() {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    container.innerHTML = renderStatus('fas fa-spinner fa-spin', loadingMessage);

    try {
      const { data, error } = await supabase
        .from(table)
        .select('*');

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        container.innerHTML = renderEmptyState(emptyIcon, emptyTitle, emptySubtitle);
        return;
      }

      console.log('✅ Supabase conectado correctamente');

      const sorted = [...data].sort((a, b) =>
        compareText(a?.brand, b?.brand) ||
        compareText(a?.model, b?.model) ||
        compareText(a?.title, b?.title)
      );

      container.innerHTML = sorted
        .map((product) => renderProductCard(product, {
          placeholderIcon,
          consultLabel,
          previewLabel,
          whatsappPhone,
          enablePreview,
        }))
        .join('');

      bindPreviewHandlers(container, enablePreview);
    } catch (err) {
      console.error(`Error al cargar ${table}:`, err);
      container.innerHTML = renderErrorState('No pudimos cargar los productos. Intentá nuevamente más tarde.');
    }
  };
}

function renderProductCard(product, options) {
  const {
    placeholderIcon,
    consultLabel,
    previewLabel,
    whatsappPhone,
    enablePreview,
  } = options;

  const { raw: rawName, html: safeName } = buildName(product);
  const safeDescription = sanitizeHTML(product?.description);
  const safeBrand = sanitizeHTML(product?.brand);
  const safeModel = sanitizeHTML(product?.model);
  const productId = sanitizeAttribute(product?.id ?? '');

  const imageUrl = sanitizeAttribute(product?.image_url);
  const videoUrl = sanitizeAttribute(product?.video_url);

  const media = videoUrl
    ? `<video class="product-card__video" src="${videoUrl}" autoplay loop muted playsinline></video>`
    : imageUrl
      ? `<img class="product-card__image" src="${imageUrl}" alt="${safeName}" data-preview="${imageUrl}">`
      : `<div class="product-card__placeholder"><i class="${placeholderIcon}"></i></div>`;

  const metaLine = buildMetaLine(safeBrand, safeModel);
  const whatsappUrl = buildWhatsappUrl(product?.whatsapp_phone, product?.whatsapp_message, rawName, whatsappPhone);

  const priceHtml = buildPrice(product?.price);

  return `
    <article class="product-card product-card--grid" data-product-id="${productId}">
      <div class="product-card__media">
        ${media}
      </div>
      <div class="product-card__body">
        <h3 class="product-card__title">${safeName}</h3>
        ${metaLine ? `<p class="product-card__meta">${metaLine}</p>` : ''}
        ${safeDescription ? `<p class="product-card__description">${safeDescription}</p>` : ''}
        ${priceHtml}
        <div class="product-card__actions">
          ${enablePreview && imageUrl ? `<button type="button" class="product-card__preview" data-preview="${imageUrl}"><i class="fas fa-search-plus"></i> ${previewLabel}</button>` : ''}
          <a class="product-card__whatsapp" href="${whatsappUrl}" target="_blank" rel="noopener">
            <i class="fab fa-whatsapp"></i> ${consultLabel}
          </a>
        </div>
      </div>
    </article>
  `;
}

function buildName(product) {
  const brand = toText(product?.brand);
  const model = toText(product?.model);
  const title = toText(product?.title);
  const fallback = toText(product?.name);

  const raw = [brand, model].filter(Boolean).join(' ') || title || fallback || 'Producto sin nombre';
  return {
    raw,
    html: sanitizeHTML(raw),
  };
}

function buildMetaLine(brand, model) {
  const parts = [brand, model].filter(Boolean);
  return parts.length ? parts.join(' • ') : '';
}

function buildPrice(price) {
  if (price === null || price === undefined || price === '') {
    return '';
  }

  const numeric = typeof price === 'number' ? price : parseFloat(price);
  if (!Number.isFinite(numeric)) {
    return '';
  }

  return `<div class="product-card__price">${numeric.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })}</div>`;
}

function renderStatus(icon, message) {
  return `
    <div class="product-grid-message">
      <i class="${icon}"></i>
      <p>${message}</p>
    </div>
  `;
}

function renderEmptyState(icon, title, subtitle) {
  return `
    <div class="product-grid-message">
      <i class="${icon}"></i>
      <h3>${sanitizeHTML(title)}</h3>
      <p>${sanitizeHTML(subtitle)}</p>
    </div>
  `;
}

function renderErrorState(message) {
  return `
    <div class="product-grid-message">
      <i class="fas fa-exclamation-triangle"></i>
      <p>${sanitizeHTML(message)}</p>
    </div>
  `;
}

function bindPreviewHandlers(container, enablePreview) {
  if (!enablePreview) {
    return;
  }

  const targets = container.querySelectorAll('[data-preview]');
  if (!targets.length) {
    return;
  }

  const { modal, modalContent } = ensureModal();

  targets.forEach((target) => {
    target.addEventListener('click', () => {
      const previewSrc = target.getAttribute('data-preview');
      if (!previewSrc) {
        return;
      }
      modalContent.src = previewSrc;
      modal.classList.add('active');
    });
  });
}

function ensureModal() {
  let modal = document.querySelector('.modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  let modalContent = modal.querySelector('.modal-content');
  if (!modalContent) {
    modalContent = document.createElement('img');
    modalContent.className = 'modal-content';
    modal.appendChild(modalContent);
  }

  if (!modal.dataset.bound) {
    modal.addEventListener('click', () => {
      modal.classList.remove('active');
    });
    modal.dataset.bound = 'true';
  }

  return { modal, modalContent };
}

function buildWhatsappUrl(productPhone, customMessage, productName, fallbackPhone) {
  const phone = sanitizePhone(productPhone) || sanitizePhone(fallbackPhone) || DEFAULT_WHATSAPP_PHONE;
  const message = customMessage || `Hola, me interesa el producto ${productName}. ¿Podrían brindarme más información?`;

  const params = new URLSearchParams({
    phone,
    text: message,
  });

  return `https://api.whatsapp.com/send/?${params.toString()}`;
}

function sanitizePhone(phone) {
  if (!phone) {
    return '';
  }
  return String(phone).replace(/\D+/g, '');
}

function sanitizeHTML(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function sanitizeAttribute(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function toText(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const trimmed = String(value).trim();
  return trimmed;
}

function compareText(a, b) {
  const textA = toText(a);
  const textB = toText(b);
  if (!textA && !textB) {
    return 0;
  }
  if (!textA) {
    return 1;
  }
  if (!textB) {
    return -1;
  }
  return textA.localeCompare(textB, 'es', { sensitivity: 'base' });
}
