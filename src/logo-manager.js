import { api } from './api';
import { showSuccess, showError, showLoading, hideLoading } from './ui';
import { compressImage, validateImage } from './utils';

const STORAGE_KEY = 'kioskeys_logo';
const LEGACY_LOGOS = new Set(['/logo.svg', '/LOGO_KIOSKEYS.png']);
const DEFAULT_LOGO = 'https://ucarecdn.com/bdf174c8-8731-47fa-a3f9-2443689099be/logokioskey.png';
const FALLBACK_LOGO_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 48" width="180" height="48">
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#003B8E" />
        <stop offset="100%" stop-color="#00A3FF" />
      </linearGradient>
    </defs>
    <rect width="180" height="48" rx="12" fill="url(#gradient)" />
    <text x="90" y="31" fill="#FFFFFF" font-family="'Poppins', 'Arial', sans-serif" font-size="24" font-weight="700" text-anchor="middle">
      Kioskeys
    </text>
  </svg>
`.trim();
const FALLBACK_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(FALLBACK_LOGO_SVG)}`;

class LogoManager {
  constructor() {
    this.fallbackWarningShown = false;

    let storedLogo = null;
    try {
      storedLogo = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.warn('[LogoManager] No se pudo leer el logo guardado:', error);
    }

    if (storedLogo && !LEGACY_LOGOS.has(storedLogo)) {
      this.logoUrl = storedLogo;
    } else {
      this.logoUrl = DEFAULT_LOGO;
      try {
        localStorage.setItem(STORAGE_KEY, DEFAULT_LOGO);
      } catch (error) {
        console.warn('[LogoManager] No se pudo persistir el logo por defecto:', error);
      }
    }
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
      this.persistLogo(url);
      this.logoUrl = url;

      // Update all logo elements
      this.updateLogoElements(url);

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
      if (!preview || !preview.src || preview.src === DEFAULT_LOGO || preview.src === FALLBACK_LOGO) {
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
      const result = await this.updateLogo(DEFAULT_LOGO);
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

  persistLogo(url) {
    try {
      localStorage.setItem(STORAGE_KEY, url);
    } catch (error) {
      console.warn('[LogoManager] No se pudo guardar el logo actualizado:', error);
    }
  }

  updateLogoElements(url) {
    document.querySelectorAll('[data-logo]').forEach(img => {
      img.src = url;
      img.onerror = () => {
        this.handleLogoError(img, url);
      };
    });
  }

  handleLogoError(img, attemptedSource) {
    if (attemptedSource === FALLBACK_LOGO) {
      return;
    }

    img.onerror = null;
    img.src = FALLBACK_LOGO;
    this.logoUrl = FALLBACK_LOGO;
    this.persistLogo(FALLBACK_LOGO);

    if (!this.fallbackWarningShown) {
      showError('Error al cargar el logo');
      this.fallbackWarningShown = true;
    }
  }
}

export const logoManager = new LogoManager();