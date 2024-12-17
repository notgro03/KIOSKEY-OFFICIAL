import { STORAGE_KEYS } from './config.js';
import { saveToStorage, getFromStorage } from './storage.js';
import { showSuccess, showError } from './ui.js';

class LogoManager {
  constructor() {
    this.defaultLogo = 'https://ucarecdn.com/bdf174c8-8731-47fa-a3f9-2443689099be/logokioskey.png';
    this.currentLogo = this.loadLogo();
  }

  loadLogo() {
    return getFromStorage(STORAGE_KEYS.LOGO) || this.defaultLogo;
  }

  initializeWidget() {
    const uploaderElement = document.querySelector('[role=uploadcare-uploader]');
    if (!uploaderElement) return;

    const widget = uploadcare.Widget(uploaderElement, {
      publicKey: '1985ca48f4d597426e30',
      tabs: 'file url',
      previewStep: true,
      clearable: true,
      multiple: false,
      imagesOnly: true,
      crop: '1:1'
    });

    widget.onUploadComplete((fileInfo) => {
      this.updateLogo(fileInfo.cdnUrl);
    });

    widget.onUploadFail((error) => {
      console.error('Upload failed:', error);
      showError('Error al subir el logo');
    });

    return widget;
  }

  updateLogo(logoUrl) {
    try {
      if (!logoUrl) {
        throw new Error('URL del logo no válida');
      }

      // Save to storage
      if (!saveToStorage(STORAGE_KEYS.LOGO, logoUrl)) {
        throw new Error('Error al guardar el logo');
      }

      // Update current logo
      this.currentLogo = logoUrl;

      // Update all logo elements
      document.querySelectorAll('[data-logo]').forEach(img => {
        img.src = logoUrl;
      });

      showSuccess('Logo actualizado correctamente');
      return true;
    } catch (error) {
      console.error('Error updating logo:', error);
      showError(error.message || 'Error al actualizar el logo');
      return false;
    }
  }

  getCurrentLogo() {
    return this.currentLogo;
  }

  resetLogo() {
    return this.updateLogo(this.defaultLogo);
  }
}

export const logoManager = new LogoManager();