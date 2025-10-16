import { fetchCategoryProducts } from '../scripts/loadProducts.js';

export async function loadCarcasas() {
  const container = document.getElementById('productsGrid');

  if (!container) return;

  container.innerHTML = '<div style="text-align: center; padding: 40px; color: white;"><i class="fas fa-spinner fa-spin" style="font-size: 32px;"></i><p>Cargando carcasas...</p></div>';

  try {
    const products = await fetchCategoryProducts('carcasas');

    if (!products || products.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.7); grid-column: 1/-1;">
          <i class="fas fa-shield-alt" style="font-size: 64px; margin-bottom: 20px; opacity: 0.5;"></i>
          <h3 style="font-size: 24px; margin-bottom: 12px;">No hay carcasas disponibles</h3>
          <p>Pronto agregaremos productos a esta categoría</p>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="product-card" style="background: linear-gradient(135deg, rgba(15, 15, 15, 0.9), rgba(25, 25, 25, 0.8)); border-radius: 20px; overflow: hidden; border: 2px solid rgba(255,255,255,0.1); transition: all 0.4s ease;">
        <div class="product-image" style="height: 250px; overflow: hidden; position: relative; background: rgba(0,0,0,0.3);">
          ${product.image_url
            ? `<img src="${product.image_url}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05);"><i class="fas fa-shield-alt" style="font-size: 64px; color: rgba(255,255,255,0.2);"></i></div>`
          }
          ${product.stock > 0
            ? '<span style="position: absolute; top: 12px; right: 12px; background: rgba(34, 197, 94, 0.9); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;"><i class="fas fa-check-circle"></i> Disponible</span>'
            : '<span style="position: absolute; top: 12px; right: 12px; background: rgba(239, 68, 68, 0.9); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;"><i class="fas fa-times-circle"></i> Agotado</span>'
          }
        </div>
        <div class="product-info" style="padding: 24px;">
          <h3 style="color: white; font-size: 20px; margin-bottom: 12px; font-weight: 600;">${product.title}</h3>
          ${product.brand || product.model ? `
            <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 12px;">
              <i class="fas fa-tag"></i> ${product.brand || ''} ${product.model || ''}
            </p>
          ` : ''}
          ${product.description ? `
            <p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6; margin-bottom: 16px;">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
          ` : ''}
          ${product.price > 0 ? `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #00a3ff; font-size: 24px; font-weight: 700;">$${parseFloat(product.price).toLocaleString('es-AR')}</span>
              <button class="btn-add-cart" data-product-id="${product.id}" style="background: linear-gradient(135deg, rgba(0, 59, 142, 0.9), rgba(0, 114, 188, 0.9)); color: white; border: none; padding: 10px 20px; border-radius: 50px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                <i class="fas fa-shopping-cart"></i> Consultar
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.productId;
        const product = products.find(p => String(p.id) === productId);
        if (product) {
          window.location.href = `https://api.whatsapp.com/send/?phone=541157237390&text=Hola,%20me%20interesa%20el%20producto:%20${encodeURIComponent(product.title)}`;
        }
      });
    });

    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
        card.style.boxShadow = '0 12px 40px rgba(0, 163, 255, 0.3)';
        card.style.borderColor = 'rgba(0, 163, 255, 0.5)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'none';
        card.style.borderColor = 'rgba(255,255,255,0.1)';
      });
    });

  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: white;"><p>Error al cargar los productos</p></div>';
  }
}
