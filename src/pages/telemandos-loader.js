import { createProductGridLoader } from './product-grid.js';

export const loadTelemandos = createProductGridLoader({
  table: 'telemandos',
  loadingMessage: 'Cargando telemandos...',
  emptyIcon: 'fas fa-car',
  emptyTitle: 'No hay telemandos disponibles',
  emptySubtitle: 'Estamos sumando nuevos modelos. Consultanos para más información.',
  placeholderIcon: 'fas fa-car',
});
