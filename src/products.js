import { supabase } from './config/supabase.js';

export class ProductsManager {
  constructor() {
    this.tableMap = {
      llaves: 'llaves',
      carcasas: 'carcasas',
      telemandos: 'telemandos',
      accesorios: 'accesorios',
    };

    this.typeSynonyms = {
      llave: 'llaves',
      llaves: 'llaves',
      carcasa: 'carcasas',
      carcasas: 'carcasas',
      telemando: 'telemandos',
      telemandos: 'telemandos',
      accesorio: 'accesorios',
      accesorios: 'accesorios',
    };

    this.fallbackProducts = [
      {
        id: 'fallback-1',
        nombre: 'Telemando universal',
        descripcion: 'Control remoto compatible con múltiples modelos.',
        marca: 'Kioskeys',
        modelo: 'MultiControl',
        tipo: 'telemandos',
        imagen: 'https://images.unsplash.com/photo-1582719478248-54e9f2a4a2aa?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'fallback-2',
        nombre: 'Llave codificada',
        descripcion: 'Llave de seguridad con corte y programación.',
        marca: 'Kioskeys',
        modelo: 'SecureKey',
        tipo: 'llaves',
        imagen: 'https://images.unsplash.com/photo-1503387821909-5e24c02c9b2b?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'fallback-3',
        nombre: 'Carcasa reforzada',
        descripcion: 'Carcasa de reemplazo para proteger tu llave.',
        marca: 'Kioskeys',
        modelo: 'ArmorShell',
        tipo: 'carcasas',
        imagen: 'https://images.unsplash.com/photo-1530047520930-dce1309622b4?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'fallback-4',
        nombre: 'Accesorio porta-llaves',
        descripcion: 'Accesorio metálico para llevar tus llaves con estilo.',
        marca: 'Kioskeys',
        modelo: 'KeyLink',
        tipo: 'accesorios',
        imagen: 'https://images.unsplash.com/photo-1605346132915-f099fd659337?auto=format&fit=crop&w=800&q=80',
      },
    ];

    this.products = [];
    this.initializeEventListeners();
    this.loadProducts();
  }

  normalizeType(type) {
    if (!type) return '';
    return this.typeSynonyms[type] || type;
  }

  mapProduct(item, tipo) {
    const nombreBase = `${item.brand || ''} ${item.model || ''}`.trim();
    return {
      id: item.id || crypto.randomUUID?.() || `${tipo}-${Date.now()}`,
      nombre: nombreBase || item.title || 'Producto',
      descripcion: item.description || item.details || 'Producto disponible',
      marca: item.brand || 'N/A',
      modelo: item.model || 'N/A',
      tipo,
      imagen: item.image_url || item.imagen || '/assets/no-image.png',
    };
  }

  initializeEventListeners() {
    const filterButtons = document.querySelectorAll('.category-filter');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.filterProducts(this.normalizeType(button.dataset.type));
      });
    });
  }

  async loadProducts() {
    try {
      const results = await Promise.all(
        Object.entries(this.tableMap).map(async ([tipo, table]) => {
          try {
            const { data, error } = await supabase.from(table).select('*').eq('active', true);
            if (error) throw error;
            return (data || []).map(item => this.mapProduct(item, tipo));
          } catch (err) {
            console.warn(`No se pudo cargar la categoría ${table}:`, err);
            return [];
          }
        })
      );

      const merged = results.flat().filter(Boolean);
      this.products = merged.length ? merged : this.fallbackProducts;
      this.renderProducts(this.products);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.products = this.fallbackProducts;
      this.renderProducts(this.products);
      this.showError('Mostrando catálogo base mientras recuperamos los productos.');
    }
  }

  filterProducts(type) {
    const targetType = this.normalizeType(type);
    const filtered = targetType ? this.products.filter(p => p.tipo === targetType) : this.products;
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
