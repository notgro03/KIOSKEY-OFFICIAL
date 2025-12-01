import { supabase } from './config/supabase.js';

export class ProductsManager {
  constructor() {
    this.allProducts = [];
    this.initializeEventListeners();
    this.loadProducts();
  }

  initializeEventListeners() {
    const filterButtons = document.querySelectorAll('.category-filter');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.filterProducts(button.dataset.type);
      });
    });
  }

  async loadProducts() {
    try {
      const [llavesRes, telemandosRes, carcasasRes] = await Promise.all([
        supabase.from('llaves').select('*').eq('active', true),
        supabase.from('telemandos').select('*').eq('active', true),
        supabase.from('carcasas').select('*').eq('active', true)
      ]);

      if (llavesRes.error) throw llavesRes.error;
      if (telemandosRes.error) throw telemandosRes.error;
      if (carcasasRes.error) throw carcasasRes.error;

      const llaves = (llavesRes.data || []).map(p => ({ ...p, tipo: 'llave' }));
      const telemandos = (telemandosRes.data || []).map(p => ({ ...p, tipo: 'telemando' }));
      const carcasas = (carcasasRes.data || []).map(p => ({ ...p, tipo: 'carcasa' }));

      this.allProducts = [...llaves, ...telemandos, ...carcasas];
      this.renderProducts(this.allProducts);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.showError('Error al cargar productos');
    }
  }

  filterProducts(type) {
    if (!type) {
      this.renderProducts(this.allProducts);
      return;
    }

    const filtered = this.allProducts.filter(p => p.tipo === type);
    this.renderProducts(filtered);
  }

  renderProducts(products = []) {
    const container = document.getElementById('productsList');
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = `<p style="text-align:center;color:#999;">No hay productos disponibles.</p>`;
      return;
    }

    container.innerHTML = products.map(p => `
      <div class="product-card">
        <img src="${p.image_url || '/assets/no-image.png'}" alt="${p.brand} ${p.model}" class="product-media">
        <h3>${p.brand} ${p.model}</h3>
        <p class="product-description">${p.description || 'Sin descripción'}</p>
        <ul class="product-details">
          <li>Marca: ${p.brand || 'N/A'}</li>
          <li>Modelo: ${p.model || 'N/A'}</li>
          <li>Tipo: ${p.tipo || 'N/A'}</li>
          ${p.price ? `<li>Precio: $${p.price}</li>` : ''}
        </ul>
        <a href="https://api.whatsapp.com/send/?phone=541157237390&text=${encodeURIComponent(`Hola, me interesa el producto: ${p.brand} ${p.model}`)}"
           target="_blank"
           class="learn-more">
          Consultar <i class="fab fa-whatsapp"></i>
        </a>
      </div>
    `).join('');
  }

  showError(msg) {
    const container = document.getElementById('productsList');
    if (container) {
      container.innerHTML = `<p style="text-align:center;color:#ff6b6b;">${msg}</p>`;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => new ProductsManager());
