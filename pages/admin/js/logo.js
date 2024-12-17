import { STORAGE_KEYS, DEFAULT_LOGO } from './config.js';
import { saveToStorage, getFromStorage } from './storage.js';
import { showSuccess } from './ui.js';

export function saveLogo(url) {
  try {
    saveToStorage(STORAGE_KEYS.LOGO, url);
    
    document.querySelectorAll('[data-logo]').forEach(img => {
      img.src = url;
    });

    showSuccess('¡Logo actualizado!');
    return true;
  } catch (error) {
    console.error('Error saving logo:', error);
    return false;
  }
}

export function loadLogo() {
  return getFromStorage(STORAGE_KEYS.LOGO) || DEFAULT_LOGO;
}