export function renderNavigation(currentPage = '') {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const navHTML = `
    <div class="logo">
      <a href="/index.html"><img src="https://ucarecdn.com/bdf174c8-8731-47fa-a3f9-2443689099be/logokioskey.png" alt="Kioskeys" class="nav-logo-img"></a>
    </div>
    <div class="nav-links">
      <a href="/index.html" class="shiny-text ${currentPage === 'inicio' ? 'active' : ''}">
        <i class="fas fa-home"></i> <span>Inicio</span>
      </a>
      <a href="/pages/red-servicios.html" class="shiny-text ${currentPage === 'red-servicios' ? 'active' : ''}">
        <i class="fas fa-map-marker-alt"></i> <span>Red de Servicios</span>
      </a>
      <a href="/pages/planes.html" class="shiny-text ${currentPage === 'planes' ? 'active' : ''}">
        <i class="fas fa-crown"></i> <span>Planes</span>
      </a>
      <a href="/pages/productos.html" class="shiny-text ${currentPage === 'productos' ? 'active' : ''}">
        <i class="fas fa-box"></i> <span>Productos</span>
      </a>
      <a href="/pages/faq.html" class="shiny-text ${currentPage === 'faq' ? 'active' : ''}">
        <i class="fas fa-question-circle"></i> <span>FAQ</span>
      </a>
      <a href="/pages/contacto.html" class="shiny-text ${currentPage === 'contacto' ? 'active' : ''}">
        <i class="fas fa-envelope"></i> <span>Contacto</span>
      </a>
      <a href="/pages/descarga-app.html" class="shiny-text ${currentPage === 'descarga-app' ? 'active' : ''}">
        <i class="fas fa-mobile-alt"></i> <span>Descarga App</span>
      </a>
    </div>
    <button class="menu-button">
      <i class="fas fa-bars"></i>
    </button>
  `;

  nav.innerHTML = navHTML;

  const menuButton = nav.querySelector('.menu-button');
  const navLinks = nav.querySelector('.nav-links');

  menuButton?.addEventListener('click', () => {
    menuButton.classList.toggle('active');
    navLinks?.classList.toggle('active');
  });
}

export function initNavigation(pageName) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderNavigation(pageName));
  } else {
    renderNavigation(pageName);
  }
}
