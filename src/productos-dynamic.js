import { supabase } from './config/supabase.js';

// Definición de constantes
const CATEGORY_ICONS = {
  llaves: 'fa-key',
  telemandos: 'fa-wifi', 
  carcasas: 'fa-car'
};

const CATEGORY_LABELS = {
  all: 'Todos',
  llaves: 'Llaves',
  telemandos: 'Controles',
  carcasas: 'Carcasas'
};

// Función para formatear productos según su categoría
function formatProduct(product, category) {
  const baseFeatures = [
    `Marca: ${product.brand}`,
    `Modelo: ${product.model}`,
    `Precio: $${product.price.toLocaleString()}`
  ];

  const formatConfig = {
    llaves: {
      title: `${product.brand} ${product.model}`,
      description: 'Llave de auto original',
      features: baseFeatures
    },
    telemandos: {
      title: `Control ${product.brand} ${product.model}`,
      description: 'Control remoto original',
      features: baseFeatures
    },
    carcasas: {
      title: `Carcasa ${product.brand} ${product.model}`,
      description: 'Carcasa de repuesto original',
      features: [...baseFeatures, `Color: ${product.color}`]
    }
  };

  const config = formatConfig[category];
  
  return {
    ...product,
    category,
    title: config.title,
    description: product.description || config.description,
    features: config.features
  };
}

// Función para renderizar productos
function renderProducts(products) {
  const productGrid = document.querySelector('.products-grid');
  if (!productGrid) return;

  productGrid.innerHTML = products.map(product => `
    <div class="product-item" data-category="${product.category}">
      <div class="product-icon-wrapper">
        <i class="fas ${CATEGORY_ICONS[product.category]}"></i>
      </div>
      <img src="${product.image_url}" alt="${product.title}" class="product-image">
      <h3>${product.title}</h3>
      <p>${product.description}</p>
      <ul class="product-features">
        ${product.features.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
      <div class="product-actions">
        <button class="contact-btn" onclick="window.location.href='contacto.html?product=${encodeURIComponent(product.title)}'">
          <i class="fas fa-envelope"></i>
          Consultar
        </button>
      </div>
    </div>
  `).join('');
}

// Función para actualizar categorías
function updateCategories(products) {
  const categories = ['all', ...new Set(products.map(p => p.category))];
  const filtersContainer = document.querySelector('.category-filters');
  
  if (!filtersContainer) return;

  filtersContainer.innerHTML = categories.map((cat, index) => `
    <button class="category-filter ${index === 0 ? 'active' : ''}" data-category="${cat}">
      ${CATEGORY_LABELS[cat]}
    </button>
  `).join('');

  setupFilters();
}

// Función para configurar los filtros
function setupFilters() {
  document.querySelectorAll('.category-filter').forEach(button => {
    button.addEventListener('click', () => {
      // Actualizar estados activos
      document.querySelectorAll('.category-filter').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filtrar productos
      const category = button.dataset.category;
      document.querySelectorAll('.product-item').forEach(card => {
        card.style.display = (category === 'all' || card.dataset.category === category) ? 'flex' : 'none';
      });
    });
  });
}

// Función de búsqueda
function setupSearch() {
  const searchInput = document.getElementById('productSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();

    document.querySelectorAll('.product-item').forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const description = card.querySelector('p').textContent.toLowerCase();
      const features = Array.from(card.querySelectorAll('.product-features li'))
        .map(li => li.textContent.toLowerCase())
        .join(' ');

      const matches = title.includes(searchTerm) || 
                     description.includes(searchTerm) || 
                     features.includes(searchTerm);
      
      card.style.display = matches ? 'flex' : 'none';
    });
  });
}

// Función principal para cargar productos
async function loadProducts() {
  try {
    console.log('Iniciando carga de productos...');
    // Cargar todos los tipos de productos
    const [llaves, telemandos, carcasas] = await Promise.all([
      supabase.from('llaves').select('*').order('brand'),
      supabase.from('telemandos').select('*').order('brand'),
      supabase.from('carcasas').select('*').order('brand')
    ]);
    
    console.log('Respuestas de Supabase:', { llaves, telemandos, carcasas });

    // Validar respuestas
    if (llaves.error) throw llaves.error;
    if (telemandos.error) throw telemandos.error;
    if (carcasas.error) throw carcasas.error;

    // Combinar y formatear todos los productos
    const products = [
      ...llaves.data.map(p => formatProduct(p, 'llaves')),
      ...telemandos.data.map(p => formatProduct(p, 'telemandos')),
      ...carcasas.data.map(p => formatProduct(p, 'carcasas'))
    ];

    // Renderizar productos y actualizar UI
    renderProducts(products);
    updateCategories(products);

  } catch (error) {
    console.error('Error loading products:', error);
    const container = document.querySelector('.products-grid');
    if (container) {
      container.innerHTML = '<div class="error-message">Error al cargar los productos. Por favor, intente nuevamente más tarde.</div>';
    }
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  setupSearch();
});
