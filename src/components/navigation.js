export function renderNavigation(currentPage = '') {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const navHTML = `
    <div class="logo">
      <a href="/index.html"><img src="/images/k logo.png" alt="Kioskeys" class="nav-logo-img"></a>
    </div>
    <div class="nav-links">
      <a href="/index.html" class="nav-link ${currentPage === 'inicio' ? 'active' : ''}">
        <i class="fas fa-home"></i> <span>Inicio</span>
      </a>
      <a href="/pages/red-servicios.html" class="nav-link ${currentPage === 'red-servicios' ? 'active' : ''}">
        <i class="fas fa-map-marker-alt"></i> <span>Red de Servicios</span>
      </a>
      <a href="/pages/planes.html" class="nav-link ${currentPage === 'planes' ? 'active' : ''}">
        <i class="fas fa-crown"></i> <span>Planes</span>
      </a>
      <a href="/pages/productos.html" class="nav-link ${currentPage === 'productos' ? 'active' : ''}">
        <i class="fas fa-box"></i> <span>Productos</span>
      </a>
      <a href="/pages/faq.html" class="nav-link ${currentPage === 'faq' ? 'active' : ''}">
        <i class="fas fa-question-circle"></i> <span>FAQ</span>
      </a>
      <a href="/pages/contacto.html" class="nav-link ${currentPage === 'contacto' ? 'active' : ''}">
        <i class="fas fa-envelope"></i> <span>Contacto</span>
      </a>
    </div>
    <a href="/pages/descarga-app.html" class="nav-cta-button">
      <i class="fas fa-mobile-alt"></i> <span>Descarga App</span>
    </a>
    <button class="menu-button">
      <i class="fas fa-bars"></i>
    </button>
  `;

  nav.innerHTML = navHTML;

  const menuButton = nav.querySelector('.menu-button');
  const navLinks = nav.querySelector('.nav-links');
  const ctaButton = nav.querySelector('.nav-cta-button');

  menuButton?.addEventListener('click', () => {
    menuButton.classList.toggle('active');
    navLinks?.classList.toggle('active');
  });

  if (window.innerWidth <= 768) {
    navLinks?.appendChild(ctaButton?.cloneNode(true));
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      const clonedButton = navLinks?.querySelector('.nav-cta-button');
      if (clonedButton && clonedButton.parentNode === navLinks) {
        clonedButton.remove();
      }
    }
  });
}

export function initNavigation(pageName) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderNavigation(pageName));
  } else {
    renderNavigation(pageName);
  }
}
