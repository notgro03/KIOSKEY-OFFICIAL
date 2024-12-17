import { STORAGE_KEYS, DEFAULT_THEME, DEFAULT_LOGO } from './config.js';

class StateManager {
  constructor() {
    this.state = this.loadInitialState();
    this.subscribers = new Set();
  }

  loadInitialState() {
    return {
      logo: localStorage.getItem(STORAGE_KEYS.LOGO) || DEFAULT_LOGO,
      theme: JSON.parse(localStorage.getItem(STORAGE_KEYS.THEME)) || DEFAULT_THEME,
      products: JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || {},
      plans: JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANS)) || {}
    };
  }

  initialize(initialState = {}) {
    this.state = {
      ...this.state,
      ...initialState
    };
    this.saveState();
  }

  updateState(key, value) {
    this.state[key] = value;
    this.saveState();
    this.notifySubscribers();
  }

  saveState() {
    Object.entries(this.state).forEach(([key, value]) => {
      localStorage.setItem(STORAGE_KEYS[key.toUpperCase()], JSON.stringify(value));
    });
  }

  getState() {
    return this.state;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  applyCurrentState() {
    // Apply theme
    const { theme } = this.state;
    document.documentElement.style.setProperty('--primary-blue', theme.primaryColor);
    document.documentElement.style.setProperty('--secondary-blue', theme.secondaryColor);

    // Apply logo
    const { logo } = this.state;
    document.querySelectorAll('[data-logo]').forEach(img => {
      img.src = logo;
    });
  }
}

export const stateManager = new StateManager();