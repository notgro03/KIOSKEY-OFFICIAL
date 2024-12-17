import Compressor from 'compressorjs';
import { IMAGE_COMPRESSION, STORAGE_KEYS } from './config.js';

// Comprimir imagen antes de subir
export const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: IMAGE_COMPRESSION.quality,
      maxWidth: IMAGE_COMPRESSION.maxWidth,
      maxHeight: IMAGE_COMPRESSION.maxHeight,
      success: resolve,
      error: reject
    });
  });
};

// Guardar en localStorage con manejo de errores
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to ${key}:`, error);
    return false;
  }
};

// Obtener de localStorage con manejo de errores
export const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting from ${key}:`, error);
    return null;
  }
};

// Generar ID único
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Validar imagen
export const validateImage = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Formato de imagen no válido. Use JPG, PNG o WebP.');
  }

  if (file.size > maxSize) {
    throw new Error('La imagen es demasiado grande. Máximo 5MB.');
  }

  return true;
};

// Formatear precio
export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(price);
};

// Validar producto
export const validateProduct = (product) => {
  const required = ['name', 'category', 'description', 'price'];
  const missing = required.filter(field => !product[field]);
  
  if (missing.length) {
    throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
  }

  if (isNaN(product.price) || product.price <= 0) {
    throw new Error('El precio debe ser un número mayor a 0');
  }

  return true;
};