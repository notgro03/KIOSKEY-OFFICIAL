import { STORAGE_KEYS } from './config.js';
import { saveToStorage, getFromStorage } from './storage.js';

export function updateTheme(themeData) {
  try {
    saveToStorage(STORAGE_KEYS.THEME, themeData);
    applyTheme(themeData);
    return true;
  } catch (error) {
    console.error('Error updating theme:', error);
    return false;
  }
}

export function applyTheme(themeData) {
  const root = document.documentElement;
  
  if (themeData.primaryColor) {
    root.style.setProperty('--primary-blue', themeData.primaryColor);
  }
  
  if (themeData.secondaryColor) {
    root.style.setProperty('--secondary-blue', themeData.secondaryColor);
  }
  
  if (themeData.textColor) {
    root.style.setProperty('--text-color', themeData.textColor);
  }
  
  document.body.style.background = themeData.backgroundColor || '#ffffff';
}

export function getTheme() {
  return getFromStorage(STORAGE_KEYS.THEME) || {
    primaryColor: '#003B8E',
    secondaryColor: '#00A3FF',
    textColor: '#1d1d1f',
    backgroundColor: '#ffffff'
  };
}