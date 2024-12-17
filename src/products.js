import { productsAPI, brandsAPI } from './db.js';
import { showSuccess, showError } from './ui.js';

export class ProductsManager {
  constructor() {
    this.initializeEventListeners();
    this.loadProducts();
    this.loadBrands();
  }

  initializeEventListeners() {
    const form = document.getElementById('productForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Initialize image uploader
    const uploader = document.querySelector('[role=uploadcare-uploader]');
    if (uploader) {
      const widget = uploadcare.Widget(uploader, {
        publicKey: '1985ca48f4d597426e30',
        imagesOnly: true,
        crop: '16:9'
      });

      widget.onUploadComplete((fileInfo) => {
        document.getElementById('productImage').value = fileInfo.cdnUrl;
        document.getElementById('imagePreview').src = fileInfo.cdnUrl;
      });
    }

    // Filter by type
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
      typeFilter.addEventListener('change', () => this.filterProducts());
    }
  }

  async loadProducts() {
    try {
      const products = await productsAPI.getAll();
      this.renderProducts(products);
    } catch (error) {
      showError('Error al cargar productos');
      console.error(error);
    }
  }

  async loadBrands() {
    try {
      const brands = await brandsAPI.getAll();
      const select = document.getElementById('productBrand');
      if (select) {
        select.innerHTML = `
          <option value="">Seleccionar marca</option>
          ${brands.map(brand => `
            <option value="${brand.id}">${brand.name}</option>
          `).join('')}
        `;
      }
    } catch (error) {
      showError('Error al cargar marcas');
      console.error(error);
    }
  }

  async filterProducts() {
    const type = document.getElementById('typeFilter').value;
    try {
      const products = type ? await productsAPI.getByType(type) : await productsAPI.getAll();
      this.renderProducts(products);
    } catch (error) {
      showError('Error al filtrar productos');
      console.error(error);
    }
  }

  renderProducts(products) {
    const container = document.getElementById('productsList');
    if (!container) return;

    container.innerHTML = products.map(product => `
      <div class="product-card" data-id="${product.id}">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="product-meta">
            <span class="product-type">${product.type}</span>
            <span class="product-price">$${product.price}</span>
          </div>
        </div>
        <div class="product-actions">
          <button onclick="productsManager.editProduct(${product.id})" class="edit-btn">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="productsManager.deleteProduct(${product.id})" class="delete-btn">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  async handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = {
      name: formData.get('name'),
      type: formData.get('type'),
      brandId: parseInt(formData.get('brandId')),
      price: parseFloat(formData.get('price')),
      description: formData.get('description'),
      image: formData.get('image'),
      features: formData.get('features').split('\n').filter(f => f.trim())
    };

    try {
      if (formData.get('id')) {
        await productsAPI.update(parseInt(formData.get('id')), productData);
        showSuccess('Producto actualizado correctamente');
      } else {
        await productsAPI.add(productData);
        showSuccess('Producto agregado correctamente');
      }
      
      e.target.reset();
      this.loadProducts();
    } catch (error) {
      showError('Error al guardar el producto');
      console.error(error);
    }
  }

  async editProduct(id) {
    const products = await productsAPI.getAll();
    const product = products.find(p => p.id === id);
    if (!product) return;

    const form = document.getElementById('productForm');
    if (!form) return;

    form.elements['id'].value = product.id;
    form.elements['name'].value = product.name;
    form.elements['type'].value = product.type;
    form.elements['brandId'].value = product.brandId;
    form.elements['price'].value = product.price;
    form.elements['description'].value = product.description;
    form.elements['image'].value = product.image;
    form.elements['features'].value = product.features.join('\n');
    document.getElementById('imagePreview').src = product.image;
  }

  async deleteProduct(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    try {
      await productsAPI.delete(id);
      showSuccess('Producto eliminado correctamente');
      this.loadProducts();
    } catch (error) {
      showError('Error al eliminar el producto');
      console.error(error);
    }
  }
}

// Initialize products manager
window.productsManager = new ProductsManager();