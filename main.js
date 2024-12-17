// Import styles
import './style.css'

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

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}

// Export for use in other modules
export { initApp }