import { supabase } from './config/supabase.js';

const grid = document.querySelector('[data-product-grid]');
const filtersContainer = document.querySelector('[data-category-filters]');
const emptyState = document.querySelector('[data-empty-state]');
const loadingState = document.querySelector('[data-loading-state]');
const searchInput = document.getElementById('productSearch');
const defaultEmptyMarkup = emptyState ? emptyState.innerHTML : '';

const state = {
  products: [],
  categories: [],
  activeCategory: 'all',
  searchTerm: '',
};

function escapeHtml(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseFeatureList(input) {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.map(String).map(item => item.trim()).filter(Boolean);
  }

  if (typeof input === 'object') {
    return Object.values(input).map(String).map(item => item.trim()).filter(Boolean);
  }

  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        return parsed.map(String).map(item => item.trim()).filter(Boolean);
      }
    } catch (error) {
      // Ignore JSON parse errors and fall back to string splitting
    }

    return input
      .split(/\r?\n|•|-|,/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
}

function formatPrice(value) {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return numeric.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function setLoading(isLoading) {
  if (!loadingState) return;
  loadingState.hidden = !isLoading;

  if (grid) {
    grid.setAttribute('aria-busy', String(isLoading));
    if (isLoading) {
      grid.innerHTML = '';
    }
  }
}

function showEmpty(message) {
  if (!emptyState) return;

  if (typeof message === 'string' && message.length) {
    emptyState.innerHTML = message;
  } else if (defaultEmptyMarkup) {
    emptyState.innerHTML = defaultEmptyMarkup;
  }

  emptyState.hidden = false;
}

function hideEmpty() {
  if (!emptyState) return;
  emptyState.hidden = true;
  if (defaultEmptyMarkup) {
    emptyState.innerHTML = defaultEmptyMarkup;
  }
}

function mapProduct(row) {
  const categoryData = row.category ?? {};
  const features = parseFeatureList(row.features);
  const compatibility = parseFeatureList(row.compatibility);
  const featurePool = features.length ? features : compatibility;
  const highlightedFeatures = featurePool.slice(0, 4);

  const searchIndex = [
    row.title,
    row.description,
    row.brand,
    row.model,
    categoryData.name,
    ...featurePool,
  ]
    .map(fragment => (fragment ? String(fragment).toLowerCase() : ''))
    .filter(Boolean)
    .join(' ');

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    imageUrl: row.image_url ?? '',
    price: row.price ?? null,
    brand: row.brand ?? '',
    model: row.model ?? '',
    features: highlightedFeatures,
    category: {
      slug: categoryData.slug || 'otros',
      name: categoryData.name || 'Otros',
      icon: categoryData.icon || 'fa-box',
    },
    searchIndex,
  };
}

function renderProductCard(product) {
  const brandModel = [product.brand, product.model]
    .map(part => part.trim())
    .filter(Boolean)
    .join(' • ');

  const featuresList = product.features.length
    ? `<ul class="product-details">${product.features
        .map(feature => `<li>${escapeHtml(feature)}</li>`)
        .join('')}</ul>`
    : '';

  const price = formatPrice(product.price);
  const whatsappMessage = `Hola, me interesa el producto ${product.title}`;
  const contactUrl = `https://api.whatsapp.com/send/?phone=541157237390&text=${encodeURIComponent(whatsappMessage)}`;

  return `
    <article class="product-card" data-category="${escapeHtml(product.category.slug)}">
      <div class="product-card-header">
        <span class="product-category-tag">
          <i class="fas ${escapeHtml(product.category.icon)}" aria-hidden="true"></i>
          ${escapeHtml(product.category.name)}
        </span>
        ${price ? `<span class="product-price">$${price}</span>` : ''}
      </div>
      <div class="product-card-media">
        ${product.imageUrl
          ? `<img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.title)}" loading="lazy">`
          : '<div class="product-placeholder"><i class="fas fa-image" aria-hidden="true"></i></div>'}
      </div>
      <h3>${escapeHtml(product.title)}</h3>
      ${brandModel ? `<p class="product-brand">${escapeHtml(brandModel)}</p>` : ''}
      ${product.description ? `<p class="product-description">${escapeHtml(product.description)}</p>` : ''}
      ${featuresList}
      <a class="learn-more" href="${contactUrl}" target="_blank" rel="noopener">
        Consultar <i class="fas fa-arrow-right" aria-hidden="true"></i>
      </a>
    </article>
  `;
}

function renderProducts(products) {
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = '';
    showEmpty();
    return;
  }

  hideEmpty();
  grid.innerHTML = products.map(renderProductCard).join('');
}

function applyFilters() {
  if (!state.products.length) {
    renderProducts([]);
    return;
  }

  const activeCategory = state.activeCategory;
  const searchTokens = state.searchTerm
    .split(/\s+/)
    .map(token => token.trim().toLowerCase())
    .filter(Boolean);

  const filtered = state.products.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category.slug === activeCategory;
    if (!matchesCategory) return false;

    if (!searchTokens.length) return true;

    return searchTokens.every(token => product.searchIndex.includes(token));
  });

  renderProducts(filtered);
}

function renderFilters() {
  if (!filtersContainer) return;

  const availableFilters = [
    { slug: 'all', name: 'Todos' },
    ...state.categories,
  ];

  filtersContainer.innerHTML = availableFilters
    .map(filter => `
      <button type="button" class="category-filter ${state.activeCategory === filter.slug ? 'active' : ''}" data-category="${escapeHtml(filter.slug)}">
        ${escapeHtml(filter.name)}
      </button>
    `)
    .join('');

  filtersContainer.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      state.activeCategory = button.dataset.category ?? 'all';

      filtersContainer.querySelectorAll('button').forEach(btn => {
        btn.classList.toggle('active', btn === button);
      });

      applyFilters();
    });
  });
}

async function loadCatalog() {
  if (!grid) return;

  setLoading(true);
  hideEmpty();

  try {
    const [{ data: categoriesData, error: categoriesError }, { data: productsData, error: productsError }] = await Promise.all([
      supabase
        .from('product_categories')
        .select('id, name, slug, icon, display_order')
        .order('display_order', { ascending: true }),
      supabase
        .from('products')
        .select(`
          id,
          title,
          description,
          image_url,
          price,
          brand,
          model,
          features,
          compatibility,
          display_order,
          category:product_categories (slug, name, icon)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true }),
    ]);

    if (categoriesError) throw categoriesError;
    if (productsError) throw productsError;

    const mappedProducts = (productsData ?? [])
      .map(mapProduct)
      .filter(product => Boolean(product.title));

    const availableCategorySlugs = new Set(mappedProducts.map(product => product.category.slug));

    state.products = mappedProducts;
    state.categories = (categoriesData ?? [])
      .filter(category => availableCategorySlugs.has(category.slug))
      .map(category => ({
        slug: category.slug,
        name: category.name,
      }));

    state.activeCategory = 'all';
    state.searchTerm = '';

    if (searchInput) {
      searchInput.value = '';
    }

    renderFilters();
    applyFilters();
  } catch (error) {
    console.error('Error loading product catalog:', error);
    const message = `
      <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
      <h3>Ocurrió un error al cargar el catálogo</h3>
      <p>Intentá nuevamente en unos segundos.</p>
    `;
    showEmpty(message);
  } finally {
    setLoading(false);
  }
}

function setupSearch() {
  if (!searchInput) return;

  searchInput.addEventListener('input', event => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    applyFilters();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!grid) return;

  loadCatalog();
  setupSearch();
});
