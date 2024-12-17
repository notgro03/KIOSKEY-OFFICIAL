import { api } from './api';
import { showSuccess, showError, showLoading, hideLoading } from './ui';
import { DEFAULT_THEME } from './config';

class AppearanceManager {
  constructor() {
    this.theme = { ...DEFAULT_THEME };
    this.initializeThemeEditor();
    this.initializeLogoUploader();
  }

  initializeThemeEditor() {
    // Color pickers
    const colorInputs = document.querySelectorAll('[data-color-picker]');
    colorInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.updateThemePreview();
      });
    });

    // Save button
    const saveButton = document.getElementById('saveTheme');
    if (saveButton) {
      saveButton.addEventListener('click', () => this.saveTheme());
    }
  }

  initializeLogoUploader() {
    const logoUploader = document.getElementById('logoUploader');
    if (logoUploader) {
      logoUploader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.uploadLogo(file);
        }
      });
    }
  }

  updateThemePreview() {
    const theme = this.getThemeValues();
    document.documentElement.style.setProperty('--primary-blue', theme.primaryColor);
    document.documentElement.style.setProperty('--secondary-blue', theme.secondaryColor);
    document.documentElement.style.setProperty('--text-color', theme.textColor);
    document.body.style.backgroundColor = theme.backgroundColor;
  }

  getThemeValues() {
    return {
      primaryColor: document.getElementById('primaryColor').value,
      secondaryColor: document.getElementById('secondaryColor').value,
      textColor: document.getElementById('textColor').value,
      backgroundColor: document.getElementById('backgroundColor').value
    };
  }

  async saveTheme() {
    try {
      showLoading();
      const theme = this.getThemeValues();
      await api.updateTheme(theme);
      showSuccess('Tema actualizado correctamente');
    } catch (error) {
      showError('Error al actualizar el tema');
      console.error('Error saving theme:', error);
    } finally {
      hideLoading();
    }
  }

  async uploadLogo(file) {
    try {
      showLoading();
      const result = await api.uploadLogo(file);
      document.querySelectorAll('[data-logo]').forEach(img => {
        img.src = result.url;
      });
      showSuccess('Logo actualizado correctamente');
    } catch (error) {
      showError('Error al subir el logo');
      console.error('Error uploading logo:', error);
    } finally {
      hideLoading();
    }
  }
}

export const appearanceManager = new AppearanceManager();