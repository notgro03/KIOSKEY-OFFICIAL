import { UPLOADCARE_CONFIG } from './config.js';
import { stateManager } from './state.js';
import { showSuccess, showError } from './ui.js';

export function initializeUploader(element, options = {}) {
  const widget = uploadcare.Widget(element, {
    ...UPLOADCARE_CONFIG,
    ...options
  });

  widget.onUploadComplete((fileInfo) => {
    if (options.onSuccess) {
      options.onSuccess(fileInfo);
    }
  });

  return widget;
}

export function saveLogo(url) {
  try {
    stateManager.updateLogo(url);
    showSuccess('Logo actualizado correctamente');
    return true;
  } catch (error) {
    console.error('Error saving logo:', error);
    showError('Error al actualizar el logo');
    return false;
  }
}

export function loadLogo() {
  return stateManager.getState().logo;
}