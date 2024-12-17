// Configuración de Uploadcare
export const UPLOADCARE_PUBLIC_KEY = '1985ca48f4d597426e30';

// Configuración de compresión de imágenes
export const IMAGE_COMPRESSION = {
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080
};

// Configuración de almacenamiento
export const STORAGE_KEYS = {
  PRODUCTS: 'kioskeys_products',
  COLORS: 'kioskeys_colors',
  IMAGES: 'kioskeys_images',
  LOGOS: 'kioskeys_logos'
};

// Configuración de autenticación
export const AUTH = {
  PASSWORD: 'kioskeys2024'
};

// Categorías de productos
export const PRODUCT_CATEGORIES = [
  { id: 'llaves', name: 'Llaves' },
  { id: 'carcasas', name: 'Carcasas' },
  { id: 'telemandos', name: 'Telemandos' },
  { id: 'accesorios', name: 'Accesorios' }
];