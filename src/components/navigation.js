const NAV_ITEMS = [
  {
    id: 'inicio',
    label: 'Inicio',
    href: '/',
    icon: 'fas fa-home',
  },
  {
    id: 'red-servicios',
    label: 'Red de Servicios',
    href: '/pages/red-servicios.html',
    icon: 'fas fa-map-marker-alt',
  },
  {
    id: 'planes',
    label: 'Planes',
    href: '/pages/planes.html',
    icon: 'fas fa-crown',
  },
  {
    id: 'productos',
    label: 'Productos',
    href: '/pages/productos.html',
    icon: 'fas fa-box',
  },
  {
    id: 'faq',
    label: 'FAQ',
    href: '/pages/faq.html',
    icon: 'fas fa-question-circle',
  },
  {
    id: 'contacto',
    label: 'Contacto',
    href: '/pages/contacto.html',
    icon: 'fas fa-envelope',
  },
  {
    id: 'descarga-app',
    label: 'Descarga App',
    href: '/pages/descarga-app.html',
    icon: 'fas fa-mobile-alt',
  },
];

const ACTIVE_ALIAS = {
  telemandos: 'productos',
  llaves: 'productos',
  accesorios: 'productos',
  carcasas: 'productos',
};

function buildNavLinks(activeId) {
  return NAV_ITEMS.map((item) => {
    const classes = ['shiny-text'];
    if (item.id === activeId) {
      classes.push('active');
    }

    const ariaCurrent = item.id === activeId ? ' aria-current="page"' : '';

    return `
      <a href="${item.href}" class="${classes.join(' ')}" data-page="${item.id}"${ariaCurrent}>
        <i class="${item.icon}" aria-hidden="true"></i>
        <span>${item.label}</span>
      </a>
    `;
  }).join('');
}

export function initNavigation(currentSection = '') {
  const nav = document.querySelector('nav');
  if (!nav) {
    console.warn('[Navigation] Elemento <nav> no encontrado en la página actual.');
    return;
  }

  const activeId = ACTIVE_ALIAS[currentSection] || currentSection;

  nav.innerHTML = `
    <div class="logo">
      <a href="/">
        <img data-logo src="/LOGO_KIOSKEYS.png" alt="Kioskeys" class="nav-logo-img">
      </a>
    </div>
    <div class="nav-links">
      ${buildNavLinks(activeId)}
    </div>
    <button class="menu-button" type="button" aria-label="Abrir menú de navegación">
      <i class="fas fa-bars" aria-hidden="true"></i>
    </button>
  `;
}
