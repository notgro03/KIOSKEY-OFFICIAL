import { STORAGE_KEYS } from './config.js';
import { stateManager } from './state.js';
import { showSuccess, showError } from './ui.js';

class ProductsManager {
  constructor() {
    this.products = this.loadProducts();
  }

  loadProducts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || {
      keys: [],
      remotes: [],
      cases: []
    };
  }

  saveProducts() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    stateManager.updateState('products', this.products);
  }

  addProduct(type, product) {
    try {
      if (!this.products[type]) {
        throw new Error('Tipo de producto inválido');
      }

      const newProduct = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...product
      };

      this.products[type].push(newProduct);
      this.saveProducts();
      showSuccess('Producto agregado correctamente');
      return newProduct;
    } catch (error) {
      showError('Error al agregar el producto');
      console.error('Error adding product:', error);
      return null;
    }
  }

  updateProduct(type, id, updates) {
    try {
      const index = this.products[type].findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Producto no encontrado');
      }

      this.products[type][index] = {
        ...this.products[type][index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.saveProducts();
      showSuccess('Producto actualizado correctamente');
      return this.products[type][index];
    } catch (error) {
      showError('Error al actualizar el producto');
      console.error('Error updating product:', error);
      return null;
    }
  }

  deleteProduct(type, id) {
    try {
      this.products[type] = this.products[type].filter(p => p.id !== id);
      this.saveProducts();
      showSuccess('Producto eliminado correctamente');
      return true;
    } catch (error) {
      showError('Error al eliminar el producto');
      console.error('Error deleting product:', error);
      return false;
    }
  }

  getProducts(type) {
    return this.products[type] || [];
  }

  getAllProducts() {
    return this.products;
  }
}

export const productsManager = new ProductsManager();