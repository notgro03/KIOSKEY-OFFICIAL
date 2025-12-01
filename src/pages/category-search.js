import { supabase } from '../config/supabase.js';
import { bindZoomableMedia } from '../utils/media-modal.js';

const DEFAULT_WHATSAPP_NUMBER = '541157237390';

function renderMedia({ image_url, video_url, brand, model, fallbackIcon }) {
  const hasVideo = Boolean(video_url && video_url.trim());
  if (hasVideo) {
    return `<div class="result-media" data-type="video">
      <video autoplay loop muted playsinline>
        <source src="${video_url}" type="video/mp4">
      </video>
    </div>`;
  }

  if (image_url && image_url.trim()) {
    const altText = `Producto ${brand || ''} ${model || ''}`.trim() || 'Producto';
    return `<div class="result-media" data-type="image" data-image="${image_url}">
      <img src="${image_url}" alt="${altText}">
    </div>`;
  }

  return `<div class="result-media result-media--placeholder" data-type="placeholder">
    <i class="${fallbackIcon || 'fas fa-box-open'}"></i>
  </div>`;
}

function renderFeatures(featureConfig = []) {
  const items = typeof featureConfig === 'function'
    ? featureConfig()
    : featureConfig;

  if (!items?.length) {
    return '';
  }

  const list = items.map(({ icon, text }) => `
    <li class="result-feature">
      <i class="${icon}"></i>
      ${text}
    </li>
  `).join('');

  return `<ul class="result-features">${list}</ul>`;
}

function defaultWhatsappMessage({ brand, model, item, productLabel }) {
  const description = item?.description ? item.description : 'No disponible';
  return `Hola, me interesa obtener una cotización para el siguiente ${productLabel}:\n\nMarca: ${brand}\nModelo: ${model}\nDescripción: ${description}\n\n¿Podrían brindarme información sobre el precio y disponibilidad?`;
}

export function setupCategorySearch(options) {
  const {
    table,
    brandSelectId,
    modelSelectId,
    resultsContainerId,
    searchButtonSelector,
    whatsappNumber = DEFAULT_WHATSAPP_NUMBER,
    productLabel = 'producto',
    modelLabel = 'Modelo',
    emptyMessage = 'No se encontraron resultados para este modelo.',
    fallbackIcon,
    features = [],
    buildTitle,
    buildWhatsappMessage,
    buildMeta,
    buildFeatures
  } = options;

  const brandSelect = document.getElementById(brandSelectId);
  const modelSelect = document.getElementById(modelSelectId);
  const resultsContainer = document.getElementById(resultsContainerId);
  const searchButton = document.querySelector(searchButtonSelector);

  if (!brandSelect || !modelSelect || !resultsContainer || !searchButton) {
    console.warn('[setupCategorySearch] Missing required elements for category page');
    return;
  }

  const cache = new Map();
  async function loadBrands() {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('brand', { ascending: true });

    if (error) {
      console.error(`[setupCategorySearch] Error loading brands for ${table}:`, error);
      return;
    }

    const uniqueBrands = Array.from(new Set((data || [])
      .map(item => item.brand)
      .filter(Boolean)));

    uniqueBrands.forEach(brand => {
      const option = document.createElement('option');
      option.value = brand;
      option.textContent = brand;
      brandSelect.appendChild(option);
    });
  }

  async function loadModelsForBrand(brand) {
    try {
      const { data: rows, error } = await supabase
        .from(table)
        .select('*')
        .eq('brand', brand)
        .order('model', { ascending: true });

      if (error) {
        console.error(`[setupCategorySearch] Error loading models for ${table}:`, error.message || error);
        return;
      }

      const dataset = Array.isArray(rows) ? rows : [];
      const hasModelColumn = dataset.some(item => Object.prototype.hasOwnProperty.call(item, 'model'));

      if (!hasModelColumn) {
        console.error(`[setupCategorySearch] Missing "model" column in ${table} table response.`);
      }

      const orderedRows = hasModelColumn
        ? [...dataset].sort((a, b) => {
          const modelA = (a.model ?? '').toString();
          const modelB = (b.model ?? '').toString();
          return modelA.localeCompare(modelB, 'es', { sensitivity: 'base' });
        })
        : dataset;

      cache.clear();
      modelSelect.innerHTML = '<option value="">Seleccioná el modelo</option>';

      const models = orderedRows.reduce((acc, item) => {
        if (!item.model) {
          return acc;
        }

        if (!acc[item.model]) {
          acc[item.model] = [];
        }

        acc[item.model].push(item);
        return acc;
      }, {});

      const modelNames = Object.keys(models);

      modelNames.forEach(model => {
        cache.set(model, models[model]);
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
      });

      modelSelect.disabled = modelNames.length === 0;

      if (!modelNames.length) {
        resultsContainer.innerHTML = '<p class="search-message">Pronto agregaremos modelos para esta marca.</p>';
        resultsContainer.classList.add('active');
      }
    } catch (err) {
      console.error('[setupCategorySearch] Unexpected error loading models:', err);
    }
  }

  function renderResults(brand, model, items = []) {
    if (!items.length) {
      resultsContainer.innerHTML = `<p class="search-message">${emptyMessage}</p>`;
      resultsContainer.classList.add('active');
      return;
    }

    const cards = items.map(item => {
      const title = buildTitle
        ? buildTitle({ brand, model, item })
        : `${productLabel.charAt(0).toUpperCase()}${productLabel.slice(1)} ${brand} ${model}`;

      const meta = buildMeta
        ? buildMeta({ brand, model, item, modelLabel })
        : model;

      const brandValue = brand || 'Sin marca';
      const metaValue = meta || model || 'No disponible';

      const whatsappMessage = (buildWhatsappMessage || defaultWhatsappMessage)({
        brand,
        model,
        item,
        productLabel
      });

      const whatsappUrl = `https://api.whatsapp.com/send/?phone=${whatsappNumber}&text=${encodeURIComponent(whatsappMessage)}&type=phone_number&app_absent=0`;

      const featureMarkup = renderFeatures(() => {
        if (typeof buildFeatures === 'function') {
          return buildFeatures({ brand, model, item });
        }
        return features;
      });

      const detailsMarkup = `
        <div class="result-details">
          <p class="result-detail"><span>Marca:</span> ${brandValue}</p>
          <p class="result-detail"><span>${modelLabel}:</span> ${metaValue}</p>
        </div>
      `;

      return `
        <article class="result-item">
          ${renderMedia({ ...item, fallbackIcon })}
          <div class="result-info">
            <h3>${title}</h3>
            ${detailsMarkup}
            ${item.description ? `<p>${item.description}</p>` : ''}
            ${featureMarkup}
          </div>
          <a class="result-button" href="${whatsappUrl}" target="_blank" rel="noopener">
            <i class="fab fa-whatsapp"></i>
            Consultar
          </a>
        </article>
      `;
    }).join('');

    resultsContainer.innerHTML = cards;
    resultsContainer.classList.add('active');
    bindZoomableMedia(resultsContainer, '.result-media[data-type="image"]');
  }

  brandSelect.addEventListener('change', async () => {
    const brand = brandSelect.value;
    modelSelect.disabled = !brand;
    resultsContainer.innerHTML = '';
    resultsContainer.classList.remove('active');

    if (!brand) {
      modelSelect.innerHTML = '<option value="">Seleccioná el modelo</option>';
      cache.clear();
      return;
    }

    await loadModelsForBrand(brand);
  });

  searchButton.addEventListener('click', () => {
    const brand = brandSelect.value;
    const model = modelSelect.value;

    if (!brand || !model) {
      resultsContainer.innerHTML = '<p class="search-message">Seleccioná una marca y un modelo para iniciar la búsqueda.</p>';
      resultsContainer.classList.add('active');
      return;
    }

    const items = cache.get(model) || [];
    renderResults(brand, model, items);
  });

  loadBrands();
}
