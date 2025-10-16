import { logoManager } from './logo-manager';
import { showSuccess, showError } from './ui';

// Initialize admin interface
document.addEventListener('DOMContentLoaded', () => {
  // Load current logo
  const currentLogo = logoManager.getCurrentLogo();
  document.querySelectorAll('[data-logo]').forEach(img => {
    img.src = currentLogo;
  });

  // Initialize menu toggle
  const menuButton = document.querySelector('.menu-button');
  const navLinks = document.querySelector('.nav-links');
  const navBar = document.querySelector('nav');

  if (navBar) {
    const toggleNavAppearance = () => {
      if (window.scrollY > 24) {
        navBar.classList.add('nav-scrolled');
      } else {
        navBar.classList.remove('nav-scrolled');
      }
    };

    toggleNavAppearance();
    window.addEventListener('scroll', toggleNavAppearance, { passive: true });
  }

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuButton.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuButton.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        menuButton.classList.remove('active');
      }
    });
  }

  // Initialize tooltips
  const tooltips = document.querySelectorAll('[data-tooltip]');
  tooltips.forEach(tooltip => {
    tooltip.addEventListener('mouseenter', (e) => {
      const text = e.target.dataset.tooltip;
      showTooltip(e.target, text);
    });

    tooltip.addEventListener('mouseleave', () => {
      hideTooltip();
    });
  });
});

// Tooltip functionality
let tooltipElement = null;

function showTooltip(target, text) {
  if (!tooltipElement) {
    tooltipElement = document.createElement('div');
    tooltipElement.className = 'tooltip';
    document.body.appendChild(tooltipElement);
  }

  tooltipElement.textContent = text;
  const rect = target.getBoundingClientRect();
  
  tooltipElement.style.top = `${rect.bottom + 10}px`;
  tooltipElement.style.left = `${rect.left + (rect.width / 2)}px`;
  tooltipElement.style.transform = 'translateX(-50%)';
  tooltipElement.style.opacity = '1';
}

function hideTooltip() {
  if (tooltipElement) {
    tooltipElement.style.opacity = '0';
  }
}

// Handle file uploads
document.querySelectorAll('[data-upload]').forEach(input => {
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const uploadType = e.target.dataset.upload;
      let result;

      switch (uploadType) {
        case 'logo':
          result = await logoManager.updateLogo(file);
          break;
        // Add other upload types here
      }

      if (result) {
        showSuccess('Archivo subido correctamente');
      }
    } catch (error) {
      showError('Error al subir el archivo');
      console.error('Upload error:', error);
    }
  });
});