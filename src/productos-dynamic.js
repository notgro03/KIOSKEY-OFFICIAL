import { supabase } from './config/supabase.js';

// Cargar productos desde Supabase
async function loadProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('order_position');

  if (error) {
    console.error('Error loading products:', error);
    return;
  }

  const container = document.querySelector('.features-grid');
  if (!container) return;

  container.innerHTML = products.map(product => {
    const features = typeof product.features === 'string' ? JSON.parse(product.features) : product.features;

    return `
      <a href="${product.link_url}" class="product-card" data-category="${product.category}">
        <i class="fas ${product.icon} feature-icon"></i>
        <h3>${product.title}</h3>
        <p class="product-description">${product.description}</p>
        <ul class="product-details">
          ${features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
        <span class="learn-more">${product.link_text} <i class="fas fa-arrow-right"></i></span>
      </a>
    `;
  }).join('');

  // Actualizar categorías dinámicamente
  updateCategories(products);
}

// Actualizar filtros de categorías
function updateCategories(products) {
  const categories = ['all', ...new Set(products.map(p => p.category))];
  const filtersContainer = document.querySelector('.category-filters');

  if (!filtersContainer) return;

  filtersContainer.innerHTML = categories.map((cat, index) => {
    const label = cat === 'all' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1);
    return `
      <button class="category-filter ${index === 0 ? 'active' : ''}" data-category="${cat}">
        ${label}
      </button>
    `;
  }).join('');

  // Reactivar event listeners
  setupFilters();
}

// Setup filtros
function setupFilters() {
  document.querySelectorAll('.category-filter').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('active');
      });
      button.classList.add('active');

      const category = button.dataset.category;
      document.querySelectorAll('.product-card').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Búsqueda
function setupSearch() {
  const searchInput = document.getElementById('productSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();

    document.querySelectorAll('.product-card').forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const description = card.querySelector('.product-description').textContent.toLowerCase();
      const details = Array.from(card.querySelectorAll('.product-details li'))
        .map(li => li.textContent.toLowerCase())
        .join(' ');

      if (title.includes(searchTerm) || description.includes(searchTerm) || details.includes(searchTerm)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  setupSearch();
});
