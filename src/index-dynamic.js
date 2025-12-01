import { supabase } from './config/supabase.js';

async function loadHomeProducts() {
  try {
    console.log('Iniciando carga de productos...');

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('order_position')
      .limit(4);

    console.log('Respuesta de Supabase:', { products, error });

    if (error) {
      console.error('Error loading products:', error);
      return;
    }

    if (!products || products.length === 0) {
      console.log('No products found, keeping static content');
      return;
    }

    const container = document.querySelector('.features-grid');
    if (!container) {
      console.error('Container .features-grid not found');
      return;
    }

    console.log(`Renderizando ${products.length} productos...`);

    container.innerHTML = products.map(product => {
      return `
        <a href="${product.link_url}" class="feature-card shiny-button">
          <div>
            <i class="fas ${product.icon} feature-icon"></i>
            <h3 class="shiny-text">${product.title}</h3>
            <p>${product.description}</p>
          </div>
        </a>
      `;
    }).join('');

    console.log('Productos cargados exitosamente');
  } catch (err) {
    console.error('Error in loadHomeProducts:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadHomeProducts);
} else {
  loadHomeProducts();
}
