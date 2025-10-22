import { createProductGridLoader } from './product-grid.js';

export const loadCarcasas = createProductGridLoader({
  table: 'carcassas',
  loadingMessage: 'Cargando carcasas...',
  emptyIcon: 'fas fa-car-side',
  emptyTitle: 'No hay carcasas disponibles',
  emptySubtitle: 'Estamos actualizando el catálogo. Visitános nuevamente en unos minutos.',
  placeholderIcon: 'fas fa-car-side',
});
