const NAV_SELECTOR = 'nav';

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

function renderNavigation(nav, activeId, section) {
  if (!nav) return;

  nav.dataset.section = section || '';
  nav.dataset.navRendered = 'true';
  nav.setAttribute('data-active-link', activeId || '');

  nav.innerHTML = `
    <div class="logo">
      <a href="/">
        <img data-logo src="https://ucarecdn.com/bdf174c8-8731-47fa-a3f9-2443689099be/logokioskey.png" alt="Kioskeys" class="nav-logo-img">
      </a>
    </div>
    <div class="nav-links">
      ${buildNavLinks(activeId)}
    </div>
    <button class="menu-button" type="button" aria-label="Abrir menú de navegación">
      <i class="fas fa-bars" aria-hidden="true"></i>
    </button>
  `;

  nav.dispatchEvent(new CustomEvent('navigation:rendered', {
    bubbles: true,
    detail: {
      activeId,
      section,
    },
  }));
}

export function initNavigation(currentSection = '', options = {}) {
  const { root } = options;
  const nav = root ?? document.querySelector(NAV_SELECTOR);

  if (!nav) {
    console.warn('[Navigation] Elemento <nav> no encontrado en la página actual.');
    return;
  }

  const sectionFromDataset = nav.dataset.section || nav.getAttribute('data-section') || '';
  const section = typeof currentSection === 'string' && currentSection
    ? currentSection
    : sectionFromDataset;

  const activeId = ACTIVE_ALIAS[section] || section || '';

  renderNavigation(nav, activeId, section);
}

function autoInitNavigation() {
  const nav = document.querySelector(NAV_SELECTOR);
  if (!nav) return;

  if (nav.dataset.navRendered === 'true' && !nav.dataset.section) {
    return;
  }

  initNavigation(nav.dataset.section || '');
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitNavigation);
  } else {
    autoInitNavigation();
  }
}
