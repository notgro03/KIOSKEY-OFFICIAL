// Import styles
import './style.css'
import { themeManager } from './src/theme-manager.js'
import { cartManager } from './src/cart-manager.js'

// Import dynamic loaders conditionally
const currentPath = window.location.pathname;

if (currentPath === '/' || currentPath === '/index.html') {
  import('./src/index-dynamic.js');
} else if (currentPath.includes('/productos.html')) {
  import('./src/productos-dynamic.js');
}

// Initialize modules
const initApp = () => {
  // Navigation menu
  const menuButton = document.querySelector('.menu-button')
  const navLinks = document.querySelector('.nav-links')

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', () => {
      navLinks.classList.toggle('active')
      menuButton.classList.toggle('active')
    })

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuButton.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active')
        menuButton.classList.remove('active')
      }
    })
  }

  // Add cart icon to nav
  addCartIconToNav();

  // Add auth links to nav
  addAuthLinksToNav();

  // Scroll effects
  const hero = document.querySelector('.hero')
  if (hero) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        hero.classList.add('scrolled')
      } else {
        hero.classList.remove('scrolled')
      }
    })
  }
}

// Add cart icon to navigation
function addCartIconToNav() {
  const nav = document.querySelector('nav');
  if (!nav || document.querySelector('.cart-icon')) return;

  const cartIcon = document.createElement('a');
  cartIcon.href = '/pages/carrito.html';
  cartIcon.className = 'cart-icon';
  cartIcon.innerHTML = `
    <i class="fas fa-shopping-cart"></i>
    <span class="cart-badge" style="display: none;">0</span>
  `;

  const navLinks = nav.querySelector('.nav-links');
  if (navLinks) {
    navLinks.appendChild(cartIcon);
  }

  cartManager.updateCartUI();
}

// Add auth links to navigation
function addAuthLinksToNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const navLinks = nav.querySelector('.nav-links');
  if (!navLinks) return;

  const session = localStorage.getItem('kioskeys_session');

  if (session) {
    try {
      const sessionData = JSON.parse(session);
      const user = sessionData.user;

      if (!document.querySelector('.user-menu')) {
        const userMenu = document.createElement('a');
        userMenu.href = '/pages/mi-cuenta.html';
        userMenu.className = 'user-menu shiny-text';
        userMenu.innerHTML = `
          <i class="fas fa-user-circle"></i>
          <span>${user.name || 'Mi Cuenta'}</span>
        `;
        navLinks.appendChild(userMenu);
      }
    } catch (e) {
      localStorage.removeItem('kioskeys_session');
    }
  } else {
    if (!document.querySelector('.login-link')) {
      const loginLink = document.createElement('a');
      loginLink.href = '/pages/login.html';
      loginLink.className = 'login-link shiny-text';
      loginLink.innerHTML = `<i class="fas fa-sign-in-alt"></i> <span>Ingresar</span>`;
      navLinks.appendChild(loginLink);
    }
  }
}

// Initialize theme manager
document.addEventListener('DOMContentLoaded', () => {
  // Theme manager is already initialized in its constructor
  console.log('Theme manager initialized');
});

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}

// Export for use in other modules
export { initApp, themeManager }