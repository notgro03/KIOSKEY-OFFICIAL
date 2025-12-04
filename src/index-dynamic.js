import { supabase } from './config/supabase.js';

const fallbackCards = [
  {
    href: './pages/planes.html',
    icon: 'fa-crown',
    title: 'Elegí tu plan',
    description: 'Planes flexibles que se adaptan a tus necesidades',
  },
  {
    href: './pages/productos.html',
    icon: 'fa-car',
    title: 'Nuestros productos',
    description: 'Telemandos, llaves y carcasas de automóvil',
  },
  {
    href: './pages/red-servicios.html',
    icon: 'fa-map-marker-alt',
    title: 'Red de servicios',
    description: 'Encuentra el punto de servicio más cercano',
  },
  {
    href: './pages/planes.html#pagos',
    icon: 'fa-credit-card',
    title: 'Formas de pago',
    description: 'Múltiples opciones de pago disponibles',
  },
];

// Cargar productos para la página principal
async function loadHomeProducts() {
  const container = document.querySelector('.features-grid');
  if (!container) return;

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('order_position')
      .limit(4);

    if (error) throw error;

    const cardsToRender = (products?.length ? products : fallbackCards).map(
      product => ({
        href: product.link_url || product.href,
        icon: product.icon || 'fa-cube',
        title: product.title,
        description: product.description,
      })
    );

    container.innerHTML = cardsToRender
      .map(
        card => `
      <a href="${card.href}" class="feature-card shiny-button">
        <div>
          <i class="fas ${card.icon} feature-icon"></i>
          <h3 class="shiny-text">${card.title}</h3>
          <p>${card.description}</p>
        </div>
      </a>
    `
      )
      .join('');
  } catch (err) {
    console.error('Error loading products:', err);
    container.innerHTML = fallbackCards
      .map(
        card => `
      <a href="${card.href}" class="feature-card shiny-button">
        <div>
          <i class="fas ${card.icon} feature-icon"></i>
          <h3 class="shiny-text">${card.title}</h3>
          <p>${card.description}</p>
        </div>
      </a>
    `
      )
      .join('');
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  loadHomeProducts();
});
