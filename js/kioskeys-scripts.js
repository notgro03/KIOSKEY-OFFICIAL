// Navegación con efecto de scroll
jQuery(document).ready(function($) {
    let lastScrollY = window.scrollY;
    const nav = document.querySelector('nav');
    const hero = document.querySelector('.hero');

    // Manejar scroll
    $(window).scroll(function() {
        // Ocultar/mostrar nav al hacer scroll
        if (window.scrollY > lastScrollY) {
            nav.classList.add('nav-hidden');
        } else {
            nav.classList.remove('nav-hidden');
        }
        lastScrollY = window.scrollY;

        // Efecto parallax en hero
        if (hero && window.scrollY > 50) {
            hero.classList.add('scrolled');
        } else if (hero) {
            hero.classList.remove('scrolled');
        }
    });

    // Configuración del observador para animaciones
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    // Observador compartido para todas las animaciones
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Función para aplicar delays escalonados
    function applyStaggeredDelays(elements, baseDelay = 100) {
        elements.forEach((element, index) => {
            $(element).css('transition-delay', `${index * baseDelay}ms`);
        });
    }

    // Inicializar animaciones
    function initializeAnimations() {
        const selectors = [
            '.feature-card',
            '.product-card',
            '.service-card',
            '.tutorial-button',
            '.step-card',
            '.brand-card'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element) {
                    observer.observe(element);
                }
            });

            // Aplicar delays solo a las tarjetas de características
            if (selector === '.feature-card') {
                applyStaggeredDelays($(selector));
            }
        });
    }

    // Inicializar cuando el DOM esté listo
    initializeAnimations();
});