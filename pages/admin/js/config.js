// Configuration constants
export const UPLOADCARE_PUBLIC_KEY = '1985ca48f4d597426e30';

export const STORAGE_KEYS = {
  PRODUCTS: 'kioskeys_products',
  IMAGES: 'kioskeys_images',
  SETTINGS: 'kioskeys_settings',
  THEME: 'kioskeys_theme',
  LOGO: 'kioskeys_logo',
  BRANDS: 'kioskeys_brands',
  PLANS: 'kioskeys_plans'
};

export const DEFAULT_LOGO = 'https://ucarecdn.com/bdf174c8-8731-47fa-a3f9-2443689099be/logokioskey.png';

export const DEFAULT_THEME = {
  primaryColor: '#003B8E',
  secondaryColor: '#00A3FF',
  textColor: '#1d1d1f',
  backgroundColor: '#ffffff'
};

export const UPLOADCARE_CONFIG = {
  publicKey: UPLOADCARE_PUBLIC_KEY,
  tabs: 'file url',
  previewStep: true,
  clearable: true,
  multiple: false,
  imagesOnly: true,
  crop: '16:9'
};