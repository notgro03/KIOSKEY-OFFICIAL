import { logoManager } from './logo-manager.js';
import { brandsManager } from './brands-manager.js';
import { productsManager } from './products-manager.js';
import { plansManager } from './plans-manager.js';
import { stateManager } from './state.js';
import { initializeUploadcare } from './ui.js';

export function initializeAdmin() {
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize Uploadcare
    if (typeof uploadcare === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js';
      script.async = true;
      script.onload = () => {
        // Initialize logo management after Uploadcare loads
        logoManager.initializeWidget();
      };
      document.head.appendChild(script);
    } else {
      logoManager.initializeWidget();
    }

    // Apply current logo
    const currentLogo = logoManager.getCurrentLogo();
    document.querySelectorAll('[data-logo]').forEach(img => {
      img.src = currentLogo;
    });

    // Initialize state
    stateManager.initialize({
      logo: currentLogo,
      theme: {
        primaryColor: '#003B8E',
        secondaryColor: '#00A3FF'
      }
    });

    // Initialize forms
    initializeForms();
  });
}

function initializeForms() {
  // Brand form
  const brandForm = document.getElementById('brandForm');
  if (brandForm) {
    brandForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(brandForm);
      brandsManager.addBrand({
        name: formData.get('brandName'),
        logo: formData.get('brandLogo'),
        type: formData.get('brandType')
      });
    });
  }

  // Product form
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(productForm);
      productsManager.addProduct(formData.get('productType'), {
        name: formData.get('productName'),
        description: formData.get('productDescription'),
        price: parseFloat(formData.get('productPrice')),
        image: formData.get('productImage'),
        brand: formData.get('productBrand'),
        model: formData.get('productModel'),
        year: formData.get('productYear')
      });
    });
  }

  // Save buttons
  document.querySelectorAll('[data-save]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const type = button.dataset.save;
      
      switch (type) {
        case 'logo':
          const logoUrl = document.getElementById('logoPreview')?.src;
          if (logoUrl) {
            logoManager.updateLogo(logoUrl);
          }
          break;
        case 'theme':
          const primaryColor = document.getElementById('primaryColor')?.value;
          const secondaryColor = document.getElementById('secondaryColor')?.value;
          if (primaryColor && secondaryColor) {
            stateManager.updateState('theme', { primaryColor, secondaryColor });
          }
          break;
      }
    });
  });
}

// Initialize admin panel
initializeAdmin();