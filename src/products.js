import { supabase } from './config/supabase.js';

const WHATSAPP_NUMBER = '541157237390';

class ProductsShowcase {
  constructor() {
    this.container = document.getElementById('productsList');
    this.filterButtons = Array.from(document.querySelectorAll('.category-filter'));
    this.allProducts = [];
    this.currentType = '';

    this.handleFilterClick = this.handleFilterClick.bind(this);

    this.initializeEventListeners();
    this.loadProducts();
  }

  initializeEventListeners() {
    this.filterButtons.forEach((button) => {
      button.addEventListener('click', this.handleFilterClick);
    });
  }

  handleFilterClick(event) {
    const button = event.currentTarget;
    const type = (button.dataset.type || '').trim().toLowerCase();

    this.filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    this.currentType = type;
    this.applyFilter();
  }

  async loadProducts() {
    if (!this.container) {
      return;
    }

    this.showLoading();

    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        throw error;
      }

      this.allProducts = Array.isArray(data) ? data : [];
      this.applyFilter();
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.showError('Error al cargar los productos desde Supabase.');
    }
  }

  applyFilter() {
    if (!this.container) {
      return;
    }

    const filteredProducts = this.currentType
      ? this.allProducts.filter((product) => this.normalizeType(product?.tipo) === this.currentType)
      : this.allProducts;

    this.renderProducts(filteredProducts);
  }

  normalizeType(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
  }

  showLoading() {
    if (!this.container) {
      return;
    }

    this.container.innerHTML = `
      <div class="results-message results-message--loading">
        <i class="fas fa-spinner"></i>
        <p>Cargando productos...</p>
      </div>
    `;
  }

  showError(message) {
    if (!this.container) {
      return;
    }

    this.container.innerHTML = `
      <div class="results-message results-message--error">
        <i class="fas fa-triangle-exclamation"></i>
        <p>${this.escapeHtml(message)}</p>
      </div>
    `;
  }

  showEmpty() {
    if (!this.container) {
      return;
    }

    this.container.innerHTML = `
      <div class="results-message">
        <i class="fas fa-box-open"></i>
        <p>No hay productos disponibles en esta categoría por el momento.</p>
      </div>
    `;
  }

  renderProducts(products = []) {
    if (!this.container) {
      return;
    }

    if (!products.length) {
      this.showEmpty();
      return;
    }

    this.container.innerHTML = products
      .map((product) => this.createProductCard(product))
      .join('');

    this.attachCardInteractions();
  }

  createProductCard(product) {
    const productName = this.resolveName(product);
    const title = this.escapeHtml(productName);
    const description = product?.descripcion ? this.escapeHtml(product.descripcion) : '';
    const type = this.normalizeType(product?.tipo);
    const imageMarkup = this.createMediaMarkup(product);
    const featuresMarkup = this.buildFeaturesList(product);

    return `
      <article class="product-card" data-type="${type}">
        <div class="product-image">
          ${imageMarkup}
        </div>
        <div class="product-info">
          <h3>${title}</h3>
          ${description ? `<p class="product-description">${description}</p>` : ''}
          ${featuresMarkup}
          <button class="contact-btn" type="button">
            <i class="fab fa-whatsapp"></i>
            Consultar por WhatsApp
          </button>
        </div>
      </article>
    `;
  }

  createMediaMarkup(product) {
    const imageUrl = typeof product?.imagen === 'string' ? product.imagen.trim() : '';

    if (imageUrl) {
      return `<img src="${this.escapeAttribute(imageUrl)}" alt="${this.escapeAttribute(this.resolveName(product))}" />`;
    }

    return `
      <div class="product-placeholder">
        <i class="fas fa-image"></i>
      </div>
    `;
  }

  buildFeaturesList(product) {
    const features = [];

    if (product?.marca) {
      features.push({ icon: 'fa-tag', text: `Marca: ${product.marca}` });
    }

    if (product?.modelo) {
      features.push({ icon: 'fa-car-side', text: `Modelo: ${product.modelo}` });
    }

    if (product?.tipo) {
      features.push({ icon: 'fa-layer-group', text: `Tipo: ${product.tipo}` });
    }

    if (product?.precio) {
      features.push({ icon: 'fa-dollar-sign', text: `Precio: ${this.formatPrice(product.precio)}` });
    }

    if (!features.length) {
      return '';
    }

    return `
      <ul class="product-features">
        ${features
          .map(
            (feature) => `
              <li>
                <i class="fas ${feature.icon}"></i>
                <span>${this.escapeHtml(feature.text)}</span>
              </li>
            `,
          )
          .join('')}
      </ul>
    `;
  }

  attachCardInteractions() {
    const buttons = this.container.querySelectorAll('.contact-btn');

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const productName = button
          .closest('.product-card')
          ?.querySelector('h3')
          ?.textContent
          ?.trim()
          || 'producto Kioskeys';
        const message = `Hola, me interesa obtener información sobre ${productName}. ¿Podrían brindarme más detalles?`;
        const url = `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener');
      });
    });
  }

  resolveName(product) {
    if (product?.nombre) {
      return product.nombre;
    }

    const brand = product?.marca ? String(product.marca) : '';
    const model = product?.modelo ? String(product.modelo) : '';
    const fallback = `${brand} ${model}`.trim();
    return fallback || 'Producto Kioskeys';
  }

  formatPrice(value) {
    const numeric = Number(value);

    if (Number.isNaN(numeric) || numeric <= 0) {
      return value;
    }

    try {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
      }).format(numeric);
    } catch (error) {
      return `$${numeric.toLocaleString('es-AR')}`;
    }
  }

  escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  escapeAttribute(value) {
    return this.escapeHtml(value || '');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new ProductsShowcase();
});
