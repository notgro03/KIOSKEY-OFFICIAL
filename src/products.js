import { supabase } from './config/supabase.js';

const WHATSAPP_NUMBER = '541157237390';

const sections = [
  {
    name: 'telemandos',
    brandSelectId: 'telemandosBrand',
    modelSelectId: 'telemandosModel',
    searchButtonId: 'telemandosSearchBtn',
    resultsContainerId: 'telemandosResults',
    emptyMessage: 'No se encontraron telemandos para este modelo.',
    noModelsMessage: 'No hay modelos disponibles para esta marca.',
    async fetchBrands() {
      const { data, error } = await supabase
        .from('telemandos')
        .select('brand')
        .order('brand', { ascending: true });

      if (error) {
        throw error;
      }

      return extractUniqueStrings(data?.map((item) => item?.brand));
    },
    async fetchModels(brand) {
      const { data, error } = await supabase
        .from('telemandos')
        .select('model, description, image_url, video_url')
        .eq('brand', brand)
        .order('model', { ascending: true });

      if (error) {
        throw error;
      }

      return groupByModel(data);
    },
    buildResults({ brand, model, items }) {
      return items
        .map((item) => {
          const description = item?.description?.trim() || '';
          const whatsappMessage = encodeURIComponent(
            `Hola, me interesa obtener una cotización para el siguiente telemando:\n\n` +
              `Marca: ${brand}\n` +
              `Modelo: ${model}\n` +
              `Descripción: ${description || 'No disponible'}\n\n` +
              `Por favor, ¿podrían brindarme información sobre el precio y disponibilidad?`
          );
          const whatsappUrl = escapeAttribute(
            `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${whatsappMessage}&type=phone_number&app_absent=0`
          );
          const mediaMarkup = buildMediaMarkup({
            brand,
            model,
            imageUrl: item?.image_url,
            videoUrl: item?.video_url,
          });

          return `
            <div class="result-item">
              ${mediaMarkup}
              <div class="result-info">
                <h3>Telemando ${escapeHtml(brand)} ${description ? escapeHtml(description) : ''}</h3>
                <p><strong>Modelo:</strong> ${escapeHtml(model)}</p>
                <div class="result-features">
                  <span class="result-feature"><i class="fas fa-check-circle"></i> Alta compatibilidad</span>
                  <span class="result-feature"><i class="fas fa-shield-alt"></i> Garantía 1 año</span>
                  <span class="result-feature"><i class="fas fa-tools"></i> Programación incluida</span>
                </div>
              </div>
              <a href="${whatsappUrl}" target="_blank" rel="noopener" class="result-button">
                <i class="fab fa-whatsapp"></i> Consultar
              </a>
            </div>
          `;
        })
        .join('');
    },
  },
  {
    name: 'carcasas',
    brandSelectId: 'carcasasBrand',
    modelSelectId: 'carcasasModel',
    searchButtonId: 'carcasasSearchBtn',
    resultsContainerId: 'carcasasResults',
    emptyMessage: 'No se encontraron carcasas para este modelo.',
    noModelsMessage: 'No hay modelos disponibles para esta marca.',
    async fetchBrands() {
      const { data, error } = await supabase
        .from('carcasas')
        .select('brand')
        .order('brand', { ascending: true });

      if (error) {
        throw error;
      }

      return extractUniqueStrings(data?.map((item) => item?.brand));
    },
    async fetchModels(brand) {
      const { data, error } = await supabase
        .from('carcasas')
        .select('model, description, image_url, video_url')
        .eq('brand', brand)
        .order('model', { ascending: true });

      if (error) {
        throw error;
      }

      return groupByModel(data);
    },
    buildResults({ brand, model, items }) {
      return items
        .map((item) => {
          const description = item?.description?.trim() || '';
          const whatsappMessage = encodeURIComponent(
            `Hola, me interesa obtener una cotización para la siguiente carcasa:\n\n` +
              `Marca: ${brand}\n` +
              `Modelo: ${model}\n` +
              `Descripción: ${description || 'No disponible'}\n\n` +
              `Por favor, ¿podrían brindarme información sobre el precio y disponibilidad?`
          );
          const whatsappUrl = escapeAttribute(
            `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${whatsappMessage}&type=phone_number&app_absent=0`
          );
          const mediaMarkup = buildMediaMarkup({
            brand,
            model,
            imageUrl: item?.image_url,
            videoUrl: item?.video_url,
            labelPrefix: 'Carcasa',
          });

          return `
            <div class="result-item">
              ${mediaMarkup}
              <div class="result-info">
                <h3>Carcasa ${escapeHtml(brand)} ${description ? escapeHtml(description) : ''}</h3>
                <p><strong>Modelo:</strong> ${escapeHtml(model)}</p>
                <div class="result-features">
                  <span class="result-feature"><i class="fas fa-shield-alt"></i> Protección reforzada</span>
                  <span class="result-feature"><i class="fas fa-tools"></i> Instalación profesional</span>
                </div>
              </div>
              <a href="${whatsappUrl}" target="_blank" rel="noopener" class="result-button">
                <i class="fab fa-whatsapp"></i> Consultar
              </a>
            </div>
          `;
        })
        .join('');
    },
  },
  {
    name: 'llaves',
    brandSelectId: 'llavesBrand',
    modelSelectId: 'llavesModel',
    searchButtonId: 'llavesSearchBtn',
    resultsContainerId: 'llavesResults',
    emptyMessage: 'No se encontraron llaves para este modelo.',
    noModelsMessage: 'No hay modelos disponibles para esta marca.',
    async fetchBrands() {
      const { data, error } = await supabase
        .from('llaves')
        .select('brand')
        .order('brand', { ascending: true });

      if (error) {
        throw error;
      }

      return extractUniqueStrings(data?.map((item) => item?.brand));
    },
    async fetchModels(brand) {
      const { data, error } = await supabase
        .from('llaves')
        .select('model, description, image_url, video_url')
        .eq('brand', brand)
        .order('model', { ascending: true });

      if (error) {
        throw error;
      }

      return groupByModel(data);
    },
    buildResults({ brand, model, items }) {
      return items
        .map((item) => {
          const description = item?.description?.trim() || '';
          const whatsappMessage = encodeURIComponent(
            `Hola, me interesa obtener una cotización para la siguiente llave:\n\n` +
              `Marca: ${brand}\n` +
              `Modelo: ${model}\n` +
              `Descripción: ${description || 'No disponible'}\n\n` +
              `Por favor, ¿podrían brindarme información sobre el precio y disponibilidad?`
          );
          const whatsappUrl = escapeAttribute(
            `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${whatsappMessage}&type=phone_number&app_absent=0`
          );
          const mediaMarkup = buildMediaMarkup({
            brand,
            model,
            imageUrl: item?.image_url,
            videoUrl: item?.video_url,
            labelPrefix: 'Llave',
          });

          return `
            <div class="result-item">
              ${mediaMarkup}
              <div class="result-info">
                <h3>Llave ${escapeHtml(brand)} ${description ? escapeHtml(description) : ''}</h3>
                <p><strong>Modelo:</strong> ${escapeHtml(model)}</p>
                <div class="result-features">
                  <span class="result-feature"><i class="fas fa-check-circle"></i> Original de fábrica</span>
                  <span class="result-feature"><i class="fas fa-shield-alt"></i> Garantía 1 año</span>
                </div>
              </div>
              <a href="${whatsappUrl}" target="_blank" rel="noopener" class="result-button">
                <i class="fab fa-whatsapp"></i> Consultar
              </a>
            </div>
          `;
        })
        .join('');
    },
  },
  {
    name: 'accesorios',
    brandSelectId: 'accesoriosBrand',
    modelSelectId: 'accesoriosModel',
    searchButtonId: 'accesoriosSearchBtn',
    resultsContainerId: 'accesoriosResults',
    emptyMessage: 'No se encontraron accesorios para esta selección.',
    noModelsMessage: 'No hay modelos disponibles para esta marca.',
    async fetchBrands() {
      const categoryId = await ensureAccesoriosCategory();
      if (!categoryId) {
        return [];
      }

      const { data, error } = await supabase
        .from('products')
        .select('brand')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('brand', { ascending: true });

      if (error) {
        throw error;
      }

      return extractUniqueStrings(data?.map((item) => item?.brand));
    },
    async fetchModels(brand) {
      const categoryId = await ensureAccesoriosCategory();
      if (!categoryId) {
        return [];
      }

      const { data, error } = await supabase
        .from('products')
        .select('model, title, description, image_url, price, brand')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .eq('brand', brand)
        .order('model', { ascending: true });

      if (error) {
        throw error;
      }

      const grouped = new Map();

      data?.forEach((item = {}) => {
        const rawModel = typeof item.model === 'string' && item.model.trim() ? item.model.trim() : 'General';
        if (!grouped.has(rawModel)) {
          grouped.set(rawModel, []);
        }
        grouped.get(rawModel).push({
          title: item.title,
          description: item.description,
          image_url: item.image_url,
          price: item.price,
          model: rawModel,
          brand: item.brand,
        });
      });

      return Array.from(grouped.entries()).map(([value, items]) => ({
        value,
        label: value,
        items,
      }));
    },
    buildResults({ brand, model, items }) {
      return items
        .map((item) => {
          const title = item?.title?.trim() || `Accesorio ${brand}`;
          const description = item?.description?.trim() || '';
          const whatsappMessage = encodeURIComponent(
            `Hola, me interesa obtener una cotización para el siguiente accesorio:\n\n` +
              `Marca: ${brand || 'Sin marca'}\n` +
              `Modelo: ${model || 'General'}\n` +
              `Producto: ${title}\n\n` +
              `¿Podrían brindarme información sobre el precio y disponibilidad?`
          );
          const whatsappUrl = escapeAttribute(
            `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${whatsappMessage}&type=phone_number&app_absent=0`
          );
          const mediaMarkup = buildMediaMarkup({
            brand,
            model,
            imageUrl: item?.image_url,
            labelPrefix: title,
          });
          const priceLabel = formatPrice(item?.price);

          return `
            <div class="result-item">
              ${mediaMarkup}
              <div class="result-info">
                <h3>${escapeHtml(title)}</h3>
                <p><strong>Modelo:</strong> ${escapeHtml(model)}</p>
                ${description ? `<p class="result-description">${escapeHtml(description)}</p>` : ''}
                <div class="result-features">
                  ${priceLabel ? `<span class="result-feature"><i class="fas fa-tag"></i> ${escapeHtml(priceLabel)}</span>` : ''}
                  <span class="result-feature"><i class="fas fa-tools"></i> Accesorios oficiales</span>
                </div>
              </div>
              <a href="${whatsappUrl}" target="_blank" rel="noopener" class="result-button">
                <i class="fab fa-whatsapp"></i> Consultar
              </a>
            </div>
          `;
        })
        .join('');
    },
  },
];

class SearchSection {
  constructor(config) {
    this.config = config;
    this.brandSelect = null;
    this.modelSelect = null;
    this.searchButton = null;
    this.resultsContainer = null;
    this.modelData = new Map();
  }

  async init() {
    this.brandSelect = document.getElementById(this.config.brandSelectId);
    this.modelSelect = document.getElementById(this.config.modelSelectId);
    this.searchButton = document.getElementById(this.config.searchButtonId);
    this.resultsContainer = document.getElementById(this.config.resultsContainerId);

    if (!this.brandSelect || !this.modelSelect || !this.searchButton || !this.resultsContainer) {
      return;
    }

    this.attachListeners();
    await this.loadBrands();
  }

  attachListeners() {
    this.brandSelect.addEventListener('change', () => {
      void this.handleBrandChange();
    });

    this.searchButton.addEventListener('click', () => {
      this.handleSearch();
    });
  }

  async loadBrands() {
    try {
      const brands = await this.config.fetchBrands();

      if (!Array.isArray(brands) || brands.length === 0) {
        this.showMessage('No hay marcas disponibles por el momento.');
        this.brandSelect.disabled = true;
        this.searchButton.disabled = true;
        return;
      }

      const optionsMarkup = brands
        .map((brand) => `<option value="${escapeAttribute(brand)}">${escapeHtml(brand)}</option>`)
        .join('');

      this.brandSelect.insertAdjacentHTML('beforeend', optionsMarkup);
    } catch (error) {
      console.error(`Error al cargar marcas para ${this.config.name}:`, error);
      this.showMessage('Error al cargar las marcas. Intenta nuevamente más tarde.');
      this.brandSelect.disabled = true;
      this.searchButton.disabled = true;
    }
  }

  async handleBrandChange() {
    const brand = (this.brandSelect.value || '').trim();

    this.modelSelect.innerHTML = '<option value="">Seleccionar modelo</option>';
    this.modelSelect.disabled = true;
    this.modelData.clear();
    this.resetResults();

    if (!brand) {
      return;
    }

    this.showMessage('Cargando modelos...');

    try {
      const modelOptions = await this.config.fetchModels(brand);

      if (!Array.isArray(modelOptions) || modelOptions.length === 0) {
        this.showMessage(this.config.noModelsMessage || 'No hay modelos disponibles.');
        return;
      }

      const optionsMarkup = modelOptions
        .map((option) => `<option value="${escapeAttribute(option.value)}">${escapeHtml(option.label)}</option>`)
        .join('');

      this.modelSelect.insertAdjacentHTML('beforeend', optionsMarkup);
      this.modelSelect.disabled = false;
      this.modelData = new Map(modelOptions.map((option) => [option.value, option.items || []]));
      this.showMessage('Seleccioná un modelo y presioná buscar para ver los resultados.');
    } catch (error) {
      console.error(`Error al cargar modelos para ${this.config.name}:`, error);
      this.showMessage('Error al cargar los modelos. Intenta nuevamente.');
    }
  }

  handleSearch() {
    const brand = (this.brandSelect.value || '').trim();
    const model = (this.modelSelect.value || '').trim();

    if (!brand || !model) {
      alert('Seleccioná una marca y modelo');
      return;
    }

    const items = this.modelData.get(model) || [];

    if (!items.length) {
      this.showMessage(this.config.emptyMessage || 'No hay resultados disponibles.');
      return;
    }

    try {
      const resultsMarkup = this.config.buildResults({ brand, model, items });
      this.resultsContainer.innerHTML = resultsMarkup;
      this.resultsContainer.classList.add('active');
      activateMediaPreview(this.resultsContainer);
    } catch (error) {
      console.error(`Error al renderizar resultados para ${this.config.name}:`, error);
      this.showMessage('Ocurrió un error al mostrar los resultados.');
    }
  }

  resetResults() {
    this.resultsContainer.innerHTML = '';
    this.resultsContainer.classList.remove('active');
  }

  showMessage(message) {
    const safeMessage = escapeHtml(message);
    this.resultsContainer.innerHTML = `<p class="search-message">${safeMessage}</p>`;
    this.resultsContainer.classList.add('active');
  }
}

function groupByModel(data = []) {
  const grouped = new Map();

  data.forEach((item = {}) => {
    const model = typeof item.model === 'string' && item.model.trim() ? item.model.trim() : '';
    if (!model) {
      return;
    }

    if (!grouped.has(model)) {
      grouped.set(model, []);
    }

    grouped.get(model).push({
      description: item.description,
      image_url: item.image_url,
      video_url: item.video_url,
    });
  });

  return Array.from(grouped.entries()).map(([value, items]) => ({
    value,
    label: value,
    items,
  }));
}

function buildMediaMarkup({ brand, model, imageUrl, videoUrl }) {
  const cleanImage = typeof imageUrl === 'string' ? imageUrl.trim() : '';
  const cleanVideo = typeof videoUrl === 'string' ? videoUrl.trim() : '';

  if (cleanVideo) {
    return `
      <video class="result-logo result-video" autoplay loop muted playsinline>
        <source src="${escapeAttribute(cleanVideo)}" type="video/mp4">
      </video>
    `;
  }

  if (cleanImage) {
    const safeSrc = escapeAttribute(cleanImage);
    const altText = `Imagen del producto ${brand || ''} ${model || ''}`.trim();
    return `<img src="${safeSrc}" alt="${escapeAttribute(altText)}" class="result-logo" data-media-src="${safeSrc}">`;
  }

  return `
    <div class="result-logo result-placeholder">
      <i class="fas fa-image"></i>
    </div>
  `;
}

let accesoriosCategoryId = null;

async function ensureAccesoriosCategory() {
  if (accesoriosCategoryId !== null) {
    return accesoriosCategoryId;
  }

  const { data, error } = await supabase
    .from('product_categories')
    .select('id')
    .eq('slug', 'accesorios')
    .maybeSingle();

  if (error) {
    console.error('Error al obtener la categoría de accesorios:', error);
    accesoriosCategoryId = null;
    return null;
  }

  accesoriosCategoryId = data?.id ?? null;
  return accesoriosCategoryId;
}

function extractUniqueStrings(values = []) {
  return [...new Set(values.filter((value) => typeof value === 'string' && value.trim()))]
    .map((value) => value.trim())
    .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value = '') {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function formatPrice(value) {
  const number = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(number)) {
    return '';
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(number);
}

function activateMediaPreview(container) {
  const modal = document.getElementById('productMediaModal');
  const modalImage = document.getElementById('productMediaModalImage');

  if (!modal || !modalImage) {
    return;
  }

  const images = container.querySelectorAll('.result-logo[data-media-src]');

  images.forEach((image) => {
    image.addEventListener('click', () => {
      const source = image.getAttribute('data-media-src');
      if (!source) {
        return;
      }

      modalImage.src = source;
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    });
  });
}

function setupModalDismiss() {
  const modal = document.getElementById('productMediaModal');
  const modalImage = document.getElementById('productMediaModalImage');

  if (!modal || !modalImage) {
    return;
  }

  modal.addEventListener('click', () => {
    modalImage.src = '';
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupModalDismiss();
  sections.forEach((config) => {
    const section = new SearchSection(config);
    void section.init();
  });
});
