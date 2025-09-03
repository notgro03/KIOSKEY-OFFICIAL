class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('kioskeys-theme') || 'light';
    this.init();
  }

  init() {
    // Apply saved theme
    this.applyTheme(this.currentTheme);
    
    // Create toggle button
    this.createToggleButton();
    
    // Listen for system theme changes
    this.listenForSystemThemeChanges();
  }

  createToggleButton() {
    const toggle = document.createElement('button');
    toggle.className = 'theme-toggle';
    toggle.setAttribute('aria-label', 'Cambiar tema');
    toggle.innerHTML = `
      <i class="theme-toggle-icon ${this.currentTheme === 'dark' ? 'fas fa-sun sun' : 'fas fa-moon moon'}"></i>
    `;
    
    toggle.addEventListener('click', () => {
      this.toggleTheme();
    });

    document.body.appendChild(toggle);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    this.currentTheme = newTheme;
    localStorage.setItem('kioskeys-theme', newTheme);
    
    // Update toggle icon
    const icon = document.querySelector('.theme-toggle-icon');
    if (icon) {
      icon.className = `theme-toggle-icon ${newTheme === 'dark' ? 'fas fa-sun sun' : 'fas fa-moon moon'}`;
    }

    // Animate the transition
    this.animateThemeTransition();
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#003B8E');
    }
  }

  animateThemeTransition() {
    // Add a subtle animation when switching themes
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  listenForSystemThemeChanges() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('kioskeys-theme')) {
        const systemTheme = e.matches ? 'dark' : 'light';
        this.applyTheme(systemTheme);
        this.currentTheme = systemTheme;
        
        // Update toggle icon
        const icon = document.querySelector('.theme-toggle-icon');
        if (icon) {
          icon.className = `theme-toggle-icon ${systemTheme === 'dark' ? 'fas fa-sun sun' : 'fas fa-moon moon'}`;
        }
      }
    });
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  setTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
      this.applyTheme(theme);
      this.currentTheme = theme;
      localStorage.setItem('kioskeys-theme', theme);
      
      // Update toggle icon
      const icon = document.querySelector('.theme-toggle-icon');
      if (icon) {
        icon.className = `theme-toggle-icon ${theme === 'dark' ? 'fas fa-sun sun' : 'fas fa-moon moon'}`;
      }
    }
  }
}

export const themeManager = new ThemeManager();