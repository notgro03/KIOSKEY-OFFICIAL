// Main entry point for admin functionality
import { initializeAdmin } from './init.js';
import { stateManager } from './state.js';
import { plansManager } from './plans-manager.js';
import { logoManager } from './logo-manager.js';
import { productsManager } from './products-manager.js';

// Initialize all managers
document.addEventListener('DOMContentLoaded', () => {
  initializeAdmin();
  
  // Initialize state with default values
  stateManager.initialize({
    logo: 'https://ucarecdn.com/bdf174c8-8731-47fa-a3f9-2443689099be/logokioskey.png',
    theme: {
      primaryColor: '#003B8E',
      secondaryColor: '#00A3FF'
    }
  });

  // Apply initial state
  stateManager.applyCurrentState();
});

// Export managers for use in other modules
export {
  stateManager,
  plansManager,
  logoManager,
  productsManager
};