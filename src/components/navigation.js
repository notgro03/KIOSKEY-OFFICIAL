const NAV_ITEMS = [
  {
    id: 'inicio',
    label: 'Inicio',
    href: '../index.html',
    rootHref: './index.html',
    icon: 'fas fa-home',
  },
  {
    id: 'red-servicios',
    label: 'Red de Servicios',
    href: '../pages/red-servicios.html',
    rootHref: './pages/red-servicios.html',
    icon: 'fas fa-map-marker-alt',
  },
  {
    id: 'planes',
    label: 'Planes',
    href: '../pages/planes.html',
    rootHref: './pages/planes.html',
    icon: 'fas fa-crown',
  },
  {
    id: 'productos',
    label: 'Productos',
    href: '../pages/productos.html',
    rootHref: './pages/productos.html',
    icon: 'fas fa-box',
  },
  {
    id: 'faq',
    label: 'FAQ',
    href: '../pages/faq.html',
    rootHref: './pages/faq.html',
    icon: 'fas fa-question-circle',
  },
  {
    id: 'contacto',
    label: 'Contacto',
    href: '../pages/contacto.html',
    rootHref: './pages/contacto.html',
    icon: 'fas fa-envelope',
  },
  {
    id: 'descarga-app',
    label: 'Descarga App',
    href: '../pages/descarga-app.html',
    rootHref: './pages/descarga-app.html',
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
  const isRootPath = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
  const logoPath = isRootPath ? './images/LOGO_KIOSKEYS.png' : '../images/LOGO_KIOSKEYS.png';

  // Función para obtener la ruta correcta según la ubicación
  const getNavHref = (item) => isRootPath ? item.rootHref : item.href;

  nav.innerHTML = `
    <div class="logo">
      <a href="${isRootPath ? './index.html' : '../index.html'}">
        <img data-logo src="${logoPath}" alt="Kioskeys" class="nav-logo-img">
      </a>
    </div>
    <div class="nav-links">
      ${NAV_ITEMS.map(item => {
        const classes = ['shiny-text'];
        if (item.id === activeId) {
          classes.push('active');
        }
        const ariaCurrent = item.id === activeId ? ' aria-current="page"' : '';
        return `
          <a href="${getNavHref(item)}" class="${classes.join(' ')}" data-page="${item.id}"${ariaCurrent}>
            <i class="${item.icon}" aria-hidden="true"></i>
            <span>${item.label}</span>
          </a>
        `;
      }).join('')}
    </div>
    <button class="menu-button" type="button" aria-label="Abrir menú de navegación">
      <i class="fas fa-bars" aria-hidden="true"></i>
    </button>
  `;

  // Inicializar menú móvil
  const menuButton = nav.querySelector('.menu-button');
  const navLinks = nav.querySelector('.nav-links');
  
  if (menuButton && navLinks) {
    menuButton.addEventListener('click', () => {
      menuButton.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en un enlace
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        menuButton.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
  }

  // Cerrar menú al hacer scroll
  let lastScroll = window.scrollY;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > lastScroll && currentScroll > 100) {
      nav.classList.add('nav-hidden');
      menuButton.classList.remove('active');
      navLinks.classList.remove('active');
    } else {
      nav.classList.remove('nav-hidden');
    }
    lastScroll = currentScroll;
  });
}
