import { STORAGE_KEYS } from './config.js';
import { saveToStorage, getFromStorage } from './storage.js';
import { showSuccess, showError } from './ui.js';

export const PRODUCT_TYPES = {
  KEY: 'llaves',
  REMOTE: 'telemandos',
  CASE: 'carcasas',
  ACCESSORY: 'accesorios'
};

export function addProduct(data) {
  try {
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS) || [];
    const newProduct = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

export function updateProduct(id, data) {
  try {
    let products = getFromStorage(STORAGE_KEYS.PRODUCTS) || [];
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Producto no encontrado');
    }

    products[index] = {
      ...products[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    return products[index];
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export function deleteProduct(id) {
  try {
    let products = getFromStorage(STORAGE_KEYS.PRODUCTS) || [];
    products = products.filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export function getProducts(type = null) {
  try {
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS) || [];
    return type ? products.filter(p => p.type === type) : products;
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}