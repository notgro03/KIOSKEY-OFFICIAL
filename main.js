// Navigation with scroll effect
let lastScrollY = window.scrollY;
const nav = document.querySelector('nav');
const hero = document.querySelector('.hero');

// Only add scroll listener if nav exists
if (nav) {
  window.addEventListener('scroll', () => {
    // Hide/show nav on scroll
    if (window.scrollY > lastScrollY) {
      nav.classList.add('nav-hidden');
    } else {
      nav.classList.remove('nav-hidden');
    }
    lastScrollY = window.scrollY;

    // Parallax effect on hero
    if (hero && window.scrollY > 50) {
      hero.classList.add('scrolled');
    } else if (hero) {
      hero.classList.remove('scrolled');
    }
  });

  // Mobile menu functionality
  const menuButton = document.querySelector('.menu-button');
  const navLinks = document.querySelector('.nav-links');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuButton.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        menuButton.classList.remove('active');
      }
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuButton.classList.remove('active');
      });
    });
  }
}

// Animation observer configuration
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

// Shared observer for all animations
const sharedObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Function to initialize animations
function initializeAnimations() {
  // Select all cards that need animation
  const cards = document.querySelectorAll('.feature-card, .product-card, .service-card, .tutorial-button, .step-card, .brand-card');
  
  // Observe each card
  cards.forEach((card, index) => {
    if (card) {
      // Apply staggered delay
      card.style.transitionDelay = `${index * 100}ms`;
      // Observe for animation
      sharedObserver.observe(card);
    }
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeAnimations);