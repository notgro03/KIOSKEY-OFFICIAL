// Admin configuration constants
export const API_BASE_URL = '/api';
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'kioskeys_auth_token',
  USER_DATA: 'kioskeys_user_data',
  THEME: 'kioskeys_theme',
  SETTINGS: 'kioskeys_settings'
};

export const DEFAULT_THEME = {
  primaryColor: '#003B8E',
  secondaryColor: '#00A3FF',
  textColor: '#1d1d1f',
  backgroundColor: '#ffffff'
};

export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

export const PERMISSIONS = {
  MANAGE_APPEARANCE: 'manage_appearance',
  MANAGE_PRODUCTS: 'manage_products',
  MANAGE_CONTENT: 'manage_content',
  MANAGE_USERS: 'manage_users',
  MANAGE_SETTINGS: 'manage_settings'
};