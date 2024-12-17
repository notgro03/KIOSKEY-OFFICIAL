import { api } from './api';
import { showSuccess, showError, showLoading, hideLoading } from './ui';
import { compressImage, validateImage } from './utils';

class LogoManager {
  constructor() {
    this.logoUrl = localStorage.getItem('kioskeys_logo') || '/logo.svg';
    this.initializeUploader();
    this.initializeEventListeners();
  }

  initializeUploader() {
    const uploader = document.getElementById('logoUploader');
    if (!uploader) return;

    const widget = uploadcare.Widget(uploader, {
      publicKey: '1985ca48f4d597426e30',
      tabs: 'file url',
      previewStep: true,
      clearable: true,
      multiple: false,
      crop: '1:1',
      imageShrink: '1024x1024',
      imageQuality: 0.8,
      validators: [
        function(fileInfo) {
          if (fileInfo.size > 5 * 1024 * 1024) {
            throw new Error('El archivo es demasiado grande. Máximo 5MB.');
          }
        }
      ]
    });

    widget.onUploadComplete(async (fileInfo) => {
      try {
        await this.updateLogo(fileInfo.cdnUrl);
      } catch (error) {
        showError('Error al actualizar el logo');
        console.error('Logo update error:', error);
      }
    });

    widget.onUploadFail((error) => {
      showError('Error al subir el archivo');
      console.error('Upload error:', error);
    });
  }

  initializeEventListeners() {
    const saveButton = document.getElementById('saveLogo');
    if (saveButton) {
      saveButton.addEventListener('click', () => this.saveLogo());
    }

    const resetButton = document.getElementById('resetLogo');
    if (resetButton) {
      resetButton.addEventListener('click', () => this.resetLogo());
    }

    // Preview image on drag and drop
    const dropZone = document.getElementById('logoDropZone');
    if (dropZone) {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      });

      dropZone.addEventListener('drop', async (e) => {
        const file = e.dataTransfer.files[0];
        if (file) {
          try {
            validateImage(file);
            const compressed = await compressImage(file);
            const preview = document.getElementById('logoPreview');
            if (preview) {
              preview.src = URL.createObjectURL(compressed);
            }
          } catch (error) {
            showError(error.message);
          }
        }
      });
    }
  }

  async updateLogo(url) {
    try {
      showLoading();

      if (!url || typeof url !== 'string') {
        throw new Error('URL de logo inválida');
      }

      // Update storage
      localStorage.setItem('kioskeys_logo', url);
      this.logoUrl = url;

      // Update all logo elements
      document.querySelectorAll('[data-logo]').forEach(img => {
        img.src = url;
        img.onerror = () => {
          img.src = '/logo.svg';
          showError('Error al cargar el logo');
        };
      });

      // Update preview
      const preview = document.getElementById('logoPreview');
      if (preview) {
        preview.src = url;
      }

      showSuccess('Logo actualizado correctamente');
      return true;
    } catch (error) {
      showError('Error al actualizar el logo');
      console.error('Logo update error:', error);
      return false;
    } finally {
      hideLoading();
    }
  }

  async saveLogo() {
    try {
      const preview = document.getElementById('logoPreview');
      if (!preview || !preview.src || preview.src === '/logo.svg') {
        throw new Error('No hay un nuevo logo para guardar');
      }

      return await this.updateLogo(preview.src);
    } catch (error) {
      showError(error.message);
      return false;
    }
  }

  async resetLogo() {
    try {
      const result = await this.updateLogo('/logo.svg');
      if (result) {
        showSuccess('Logo restablecido correctamente');
      }
      return result;
    } catch (error) {
      showError('Error al restablecer el logo');
      return false;
    }
  }

  getCurrentLogo() {
    return this.logoUrl;
  }
}

export const logoManager = new LogoManager();