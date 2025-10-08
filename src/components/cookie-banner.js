export class CookieBanner {
  constructor() {
    this.COOKIE_CONSENT_KEY = 'kioskeys_cookie_consent';
    this.init();
  }

  init() {
    if (!this.hasConsent()) {
      this.createBanner();
      this.showBanner();
    }
  }

  hasConsent() {
    const consent = localStorage.getItem(this.COOKIE_CONSENT_KEY);
    return consent !== null;
  }

  getConsent() {
    const consent = localStorage.getItem(this.COOKIE_CONSENT_KEY);
    return consent ? JSON.parse(consent) : null;
  }

  saveConsent(preferences) {
    localStorage.setItem(this.COOKIE_CONSENT_KEY, JSON.stringify({
      ...preferences,
      timestamp: new Date().toISOString()
    }));
  }

  createBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'cookie-banner';
    banner.innerHTML = `
      <div class="cookie-banner-content">
        <div class="cookie-banner-icon">
          <i class="fas fa-cookie-bite"></i>
        </div>
        <div class="cookie-banner-text">
          <h3>Este sitio utiliza cookies</h3>
          <p>Utilizamos cookies esenciales para el funcionamiento del sitio y cookies opcionales para mejorar tu experiencia. Puedes aceptar todas o configurar tus preferencias.</p>
          <a href="/pages/cookies.html" class="cookie-banner-learn-more">Más información sobre cookies</a>
        </div>
        <div class="cookie-banner-actions">
          <button id="cookie-banner-configure" class="cookie-btn cookie-btn-secondary">
            <i class="fas fa-cog"></i> Configurar
          </button>
          <button id="cookie-banner-reject" class="cookie-btn cookie-btn-secondary">
            <i class="fas fa-times"></i> Rechazar opcionales
          </button>
          <button id="cookie-banner-accept" class="cookie-btn cookie-btn-primary">
            <i class="fas fa-check"></i> Aceptar todas
          </button>
        </div>
      </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'cookie-modal';
    modal.className = 'cookie-modal';
    modal.innerHTML = `
      <div class="cookie-modal-content">
        <div class="cookie-modal-header">
          <h2><i class="fas fa-cookie-bite"></i> Configuración de Cookies</h2>
          <button id="cookie-modal-close" class="cookie-modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="cookie-modal-body">
          <p class="cookie-modal-intro">Personaliza tus preferencias de cookies. Las cookies esenciales no pueden desactivarse ya que son necesarias para el funcionamiento del sitio.</p>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <div class="cookie-category-title">
                <span class="cookie-badge cookie-badge-essential">Esencial</span>
                <h3>Cookies Esenciales</h3>
              </div>
              <div class="cookie-toggle">
                <input type="checkbox" id="cookie-essential" checked disabled>
                <label for="cookie-essential" class="cookie-toggle-label">
                  <span class="cookie-toggle-inner"></span>
                  <span class="cookie-toggle-switch"></span>
                </label>
                <span class="cookie-status">Siempre activas</span>
              </div>
            </div>
            <p class="cookie-category-description">Estas cookies son necesarias para el funcionamiento básico del sitio web y no pueden desactivarse. Incluyen autenticación, sesión y seguridad.</p>
          </div>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <div class="cookie-category-title">
                <span class="cookie-badge cookie-badge-functional">Funcional</span>
                <h3>Cookies Funcionales</h3>
              </div>
              <div class="cookie-toggle">
                <input type="checkbox" id="cookie-functional">
                <label for="cookie-functional" class="cookie-toggle-label">
                  <span class="cookie-toggle-inner"></span>
                  <span class="cookie-toggle-switch"></span>
                </label>
              </div>
            </div>
            <p class="cookie-category-description">Permiten recordar tus preferencias (como el tema oscuro/claro, idioma) y proporcionar funciones mejoradas.</p>
          </div>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <div class="cookie-category-title">
                <span class="cookie-badge cookie-badge-analytics">Análisis</span>
                <h3>Cookies de Análisis</h3>
              </div>
              <div class="cookie-toggle">
                <input type="checkbox" id="cookie-analytics">
                <label for="cookie-analytics" class="cookie-toggle-label">
                  <span class="cookie-toggle-inner"></span>
                  <span class="cookie-toggle-switch"></span>
                </label>
              </div>
            </div>
            <p class="cookie-category-description">Nos ayudan a entender cómo los visitantes interactúan con el sitio web, recopilando y reportando información de forma anónima.</p>
          </div>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <div class="cookie-category-title">
                <span class="cookie-badge cookie-badge-marketing">Marketing</span>
                <h3>Cookies de Marketing</h3>
              </div>
              <div class="cookie-toggle">
                <input type="checkbox" id="cookie-marketing">
                <label for="cookie-marketing" class="cookie-toggle-label">
                  <span class="cookie-toggle-inner"></span>
                  <span class="cookie-toggle-switch"></span>
                </label>
              </div>
            </div>
            <p class="cookie-category-description">Se utilizan para rastrear a los visitantes en los sitios web y mostrar anuncios relevantes y atractivos.</p>
          </div>
        </div>
        <div class="cookie-modal-footer">
          <button id="cookie-modal-save" class="cookie-btn cookie-btn-primary">
            <i class="fas fa-save"></i> Guardar Preferencias
          </button>
          <button id="cookie-modal-accept-all" class="cookie-btn cookie-btn-secondary">
            <i class="fas fa-check-double"></i> Aceptar Todas
          </button>
        </div>
      </div>
    `;

    this.injectStyles();
    document.body.appendChild(banner);
    document.body.appendChild(modal);
    this.attachEventListeners();
  }

  injectStyles() {
    if (document.getElementById('cookie-banner-styles')) return;

    const style = document.createElement('style');
    style.id = 'cookie-banner-styles';
    style.textContent = `
      .cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(20, 20, 20, 0.98);
        backdrop-filter: blur(12px);
        color: white;
        padding: 24px;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideUp 0.3s ease-out;
        border-top: 2px solid rgba(0, 163, 255, 0.3);
      }

      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .cookie-banner-content {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 24px;
        align-items: center;
      }

      .cookie-banner-icon {
        font-size: 48px;
        color: #ff9500;
      }

      .cookie-banner-text h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
        color: white;
      }

      .cookie-banner-text p {
        margin: 0 0 8px 0;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.85);
        font-size: 14px;
      }

      .cookie-banner-learn-more {
        color: #00a3ff;
        text-decoration: none;
        font-size: 13px;
        font-weight: 500;
        transition: color 0.2s;
      }

      .cookie-banner-learn-more:hover {
        color: #0088cc;
        text-decoration: underline;
      }

      .cookie-banner-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .cookie-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
      }

      .cookie-btn-primary {
        background: linear-gradient(135deg, #00a3ff, #003b8e);
        color: white;
      }

      .cookie-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 163, 255, 0.4);
      }

      .cookie-btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .cookie-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      .cookie-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
        z-index: 10001;
        padding: 20px;
        overflow-y: auto;
      }

      .cookie-modal.active {
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .cookie-modal-content {
        background: white;
        border-radius: 16px;
        max-width: 700px;
        width: 100%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        animation: scaleIn 0.3s ease-out;
      }

      @keyframes scaleIn {
        from {
          transform: scale(0.9);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .cookie-modal-header {
        padding: 24px;
        border-bottom: 1px solid rgba(0, 59, 142, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .cookie-modal-header h2 {
        margin: 0;
        font-size: 22px;
        color: #003b8e;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .cookie-modal-close {
        background: none;
        border: none;
        font-size: 24px;
        color: #6e6e73;
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        transition: all 0.2s;
      }

      .cookie-modal-close:hover {
        background: rgba(0, 59, 142, 0.05);
        color: #003b8e;
      }

      .cookie-modal-body {
        padding: 24px;
        max-height: 60vh;
        overflow-y: auto;
      }

      .cookie-modal-intro {
        color: #6e6e73;
        line-height: 1.6;
        margin-bottom: 24px;
      }

      .cookie-category {
        margin-bottom: 24px;
        padding: 20px;
        background: rgba(0, 59, 142, 0.02);
        border-radius: 12px;
        border: 1px solid rgba(0, 59, 142, 0.1);
      }

      .cookie-category-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .cookie-category-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .cookie-category-title h3 {
        margin: 0;
        font-size: 18px;
        color: #003b8e;
      }

      .cookie-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .cookie-badge-essential {
        background: rgba(52, 199, 89, 0.1);
        color: #34c759;
      }

      .cookie-badge-functional {
        background: rgba(0, 122, 255, 0.1);
        color: #007aff;
      }

      .cookie-badge-analytics {
        background: rgba(255, 149, 0, 0.1);
        color: #ff9500;
      }

      .cookie-badge-marketing {
        background: rgba(175, 82, 222, 0.1);
        color: #af52de;
      }

      .cookie-category-description {
        color: #6e6e73;
        line-height: 1.6;
        font-size: 14px;
        margin: 0;
      }

      .cookie-toggle {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .cookie-toggle input[type="checkbox"] {
        display: none;
      }

      .cookie-toggle-label {
        position: relative;
        display: inline-block;
        width: 54px;
        height: 28px;
        background: #e0e0e0;
        border-radius: 14px;
        cursor: pointer;
        transition: background 0.3s;
      }

      input[type="checkbox"]:checked + .cookie-toggle-label {
        background: #34c759;
      }

      input[type="checkbox"]:disabled + .cookie-toggle-label {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .cookie-toggle-switch {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 22px;
        height: 22px;
        background: white;
        border-radius: 50%;
        transition: transform 0.3s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      input[type="checkbox"]:checked + .cookie-toggle-label .cookie-toggle-switch {
        transform: translateX(26px);
      }

      .cookie-status {
        font-size: 13px;
        color: #6e6e73;
        font-weight: 500;
      }

      .cookie-modal-footer {
        padding: 24px;
        border-top: 1px solid rgba(0, 59, 142, 0.1);
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      @media (max-width: 768px) {
        .cookie-banner-content {
          grid-template-columns: 1fr;
          text-align: center;
        }

        .cookie-banner-icon {
          justify-self: center;
        }

        .cookie-banner-actions {
          justify-content: center;
        }

        .cookie-btn {
          flex: 1;
          justify-content: center;
        }

        .cookie-modal-footer {
          flex-direction: column;
        }

        .cookie-modal-footer .cookie-btn {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  showBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.style.display = 'block';
    }
  }

  hideBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.style.display = 'none';
    }
  }

  showModal() {
    const modal = document.getElementById('cookie-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  hideModal() {
    const modal = document.getElementById('cookie-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  attachEventListeners() {
    document.getElementById('cookie-banner-accept')?.addEventListener('click', () => {
      this.acceptAll();
    });

    document.getElementById('cookie-banner-reject')?.addEventListener('click', () => {
      this.rejectOptional();
    });

    document.getElementById('cookie-banner-configure')?.addEventListener('click', () => {
      this.showModal();
    });

    document.getElementById('cookie-modal-close')?.addEventListener('click', () => {
      this.hideModal();
    });

    document.getElementById('cookie-modal-save')?.addEventListener('click', () => {
      this.savePreferences();
    });

    document.getElementById('cookie-modal-accept-all')?.addEventListener('click', () => {
      this.acceptAll();
      this.hideModal();
    });

    document.getElementById('cookie-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'cookie-modal') {
        this.hideModal();
      }
    });
  }

  acceptAll() {
    this.saveConsent({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true
    });
    this.hideBanner();
    this.applyConsent();
  }

  rejectOptional() {
    this.saveConsent({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false
    });
    this.hideBanner();
    this.applyConsent();
  }

  savePreferences() {
    const preferences = {
      essential: true,
      functional: document.getElementById('cookie-functional')?.checked || false,
      analytics: document.getElementById('cookie-analytics')?.checked || false,
      marketing: document.getElementById('cookie-marketing')?.checked || false
    };
    this.saveConsent(preferences);
    this.hideBanner();
    this.hideModal();
    this.applyConsent();
  }

  applyConsent() {
    const consent = this.getConsent();
    if (!consent) return;

    if (consent.analytics) {
      console.log('Analytics cookies enabled');
    }

    if (consent.marketing) {
      console.log('Marketing cookies enabled');
    }

    if (consent.functional) {
      console.log('Functional cookies enabled');
    }
  }
}

export function initCookieBanner() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new CookieBanner();
    });
  } else {
    new CookieBanner();
  }
}
