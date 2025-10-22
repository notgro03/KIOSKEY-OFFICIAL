import { supabase } from './config/supabase.js';

const WHATSAPP_NUMBER = '541157237390';
class ProductsShowcase {
  constructor() {
    this.container = document.getElementById('productsList');
    this.filterButtons = Array.from(document.querySelectorAll('.category-filter'));
    this.categories = new Map();
    this.categoriesById = new Map();
    this.currentCategory = 'all';
    this.isLoading = false;

    this.handleFilterClick = this.handleFilterClick.bind(this);

    this.initializeEventListeners();
    this.init();
  }

  async init() {
    await this.loadCategories();
    await this.loadProducts();
  }

  initializeEventListeners() {
    this.filterButtons.forEach(button => {
      button.addEventListener('click', this.handleFilterClick);
    });
  }

  handleFilterClick(event) {
    const button = event.currentTarget;
    const category = button.dataset.category || 'all';

    this.filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    this.currentCategory = category;
    this.loadProducts(category);
  }

  async loadCategories() {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('id, name, slug')
        .order('display_order', { ascending: true });

      if (error) {
        throw error;
      }

      (data || []).forEach(category => {
        if (category?.slug) {
          this.categories.set(category.slug, category);
        }

        if (category?.id) {
          this.categoriesById.set(category.id, category);
        }
      });

      this.updateFilterStates();
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      this.showError('No se pudieron cargar las categorías disponibles.');
    }
  }

  updateFilterStates() {
    this.filterButtons.forEach(button => {
      const slug = button.dataset.category;

      if (!slug || slug === 'all') {
        button.disabled = false;
        button.classList.remove('disabled');
        return;
      }

      const hasCategory = this.categories.has(slug);
      button.disabled = !hasCategory;
      button.classList.toggle('disabled', !hasCategory);
    });
  }

  async loadProducts(categorySlug = 'all') {
    if (!this.container) {
      return;
    }

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.showLoading();

    try {
      let query = supabase
        .from('products')
        .select(`
          id,
          title,
          description,
          image_url,
          price,
          stock,
          brand,
          model,
          is_active,
          features,
          compatibility,
          display_order,
          category_id,
          product_categories ( slug, name )
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      const categoryId = this.getCategoryId(categorySlug);
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const products = (data || []).map(product => {
        const categoryInfo = product?.product_categories
          || this.categoriesById.get(product?.category_id ?? '')
          || null;

        return {
          ...product,
          categorySlug: categoryInfo?.slug || 'general',
          categoryName: categoryInfo?.name || ''
        };
      });

      this.renderProducts(products);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.showError('Error al cargar los productos desde Supabase.');
    } finally {
      this.isLoading = false;
    }
  }

  getCategoryId(slug) {
    if (!slug || slug === 'all') {
      return null;
    }

    const normalized = slug.toLowerCase();
    const category = this.categories.get(normalized);
    return category ? category.id : null;
  }

  showLoading() {
    this.container.innerHTML = `
      <div class="results-message results-message--loading">
        <i class="fas fa-spinner"></i>
        <p>Cargando productos...</p>
      </div>
    `;
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="results-message results-message--error">
        <i class="fas fa-triangle-exclamation"></i>
        <p>${this.escapeHtml(message)}</p>
      </div>
    `;
  }

  renderProducts(products) {
    if (!products.length) {
      this.container.innerHTML = `
        <div class="results-message">
          <i class="fas fa-box-open"></i>
          <p>No hay productos disponibles en esta categoría por el momento.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = products.map(product => this.createProductCard(product)).join('');
    this.attachCardInteractions();
  }

  createProductCard(product) {
    const title = this.resolveTitle(product);
    const description = this.escapeHtml(product?.description || '');
    const imageMarkup = this.createMediaMarkup(product);
    const featuresMarkup = this.buildFeaturesList(product);
    const category = product?.categorySlug || 'general';

    return `
      <article class="product-card" data-category="${this.escapeHtml(category)}">
        <div class="product-image">
          ${imageMarkup}
        </div>
        <div class="product-info">
          <h3>${title}</h3>
          ${description ? `<p class="product-description">${description}</p>` : ''}
          ${featuresMarkup}
          <button class="contact-btn" data-product="${title}">
            <i class="fab fa-whatsapp"></i>
            Consultar por WhatsApp
          </button>
        </div>
      </article>
    `;
  }

  createMediaMarkup(product) {
    if (product?.image_url && typeof product.image_url === 'string' && product.image_url.trim()) {
      return `<img src="${this.escapeAttribute(product.image_url)}" alt="${this.escapeAttribute(this.resolveTitle(product))}" style="width: 100%; height: 100%; object-fit: cover;">`;
    }

    return `
      <div class="product-placeholder">
        <i class="fas fa-image"></i>
      </div>
    `;
  }

  buildFeaturesList(product) {
    const features = [];

    if (product?.brand) {
      features.push({ icon: 'fa-tag', text: `Marca: ${product.brand}` });
    }

    if (product?.model) {
      features.push({ icon: 'fa-car-side', text: `Modelo: ${product.model}` });
    }

    if (typeof product?.price === 'number' && !Number.isNaN(product.price) && product.price > 0) {
      features.push({ icon: 'fa-dollar-sign', text: `Precio: ${this.formatPrice(product.price)}` });
    }

    if (typeof product?.stock === 'number') {
      const stockText = product.stock > 0 ? 'Disponible' : 'Sin stock';
      features.push({ icon: product.stock > 0 ? 'fa-check-circle' : 'fa-circle-xmark', text: `Stock: ${stockText}` });
    }

    if (Array.isArray(product?.features)) {
      product.features
        .map(item => typeof item === 'string' ? item : '')
        .filter(Boolean)
        .forEach(text => features.push({ icon: 'fa-circle-dot', text }));
    }

    if (Array.isArray(product?.compatibility) && product.compatibility.length) {
      const vehicles = product.compatibility
        .map(item => typeof item === 'string' ? item : '')
        .filter(Boolean);

      if (vehicles.length) {
        features.push({ icon: 'fa-car', text: `Compatibilidad: ${vehicles.join(', ')}` });
      }
    }

    if (!features.length) {
      return '';
    }

    return `
      <ul class="product-features">
        ${features.map(feature => `
          <li>
            <i class="fas ${feature.icon}"></i>
            <span>${this.escapeHtml(feature.text)}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  attachCardInteractions() {
    const buttons = this.container.querySelectorAll('.contact-btn');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const productName = button.dataset.product || 'producto Kioskeys';
        const message = `Hola, me interesa obtener información sobre ${productName}. ¿Podrían brindarme más detalles?`;
        const url = `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener');
      });
    });
  }

  resolveTitle(product) {
    const rawTitle = product?.title || '';
    if (rawTitle.trim()) {
      return this.escapeHtml(rawTitle.trim());
    }

    const brand = product?.brand ? String(product.brand) : '';
    const model = product?.model ? String(product.model) : '';
    const fallback = `${brand} ${model}`.trim();
    return this.escapeHtml(fallback || 'Producto Kioskeys');
  }

  formatPrice(value) {
    try {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
      }).format(value);
    } catch (error) {
      return `$${Number(value).toLocaleString('es-AR')}`;
    }
  }

  escapeHtml(value) {
    return value
      .toString()
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
