import { supabase } from './config/supabase.js';

export class ProductsManager {
  constructor() {
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
      const { data: products, error } = await supabase
        .from('productos')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      this.renderProducts(products);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.showError('Error al cargar productos desde Supabase');
    }
  }

  async filterProducts(type) {
    try {
      let query = supabase.from('productos').select('*');
      if (type) query = query.eq('tipo', type);

      const { data: products, error } = await query;
      if (error) throw error;

      this.renderProducts(products);
    } catch (error) {
      console.error('Error al filtrar productos:', error);
      this.showError('Error al filtrar productos');
    }
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
        <img src="${p.imagen || '/assets/no-image.png'}" alt="${p.nombre}" class="product-media">
        <h3>${p.nombre}</h3>
        <p class="product-description">${p.descripcion || 'Sin descripción'}</p>
        <ul class="product-details">
          <li>Marca: ${p.marca || 'N/A'}</li>
          <li>Modelo: ${p.modelo || 'N/A'}</li>
          <li>Tipo: ${p.tipo || 'N/A'}</li>
        </ul>
        <a class="learn-more">Ver más <i class="fas fa-arrow-right"></i></a>
      </div>
    `).join('');
  }

  showError(msg) {
    alert(msg);
  }
}

window.addEventListener('DOMContentLoaded', () => new ProductsManager());
