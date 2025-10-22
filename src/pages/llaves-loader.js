import { createProductGridLoader } from './product-grid.js';

export const loadLlaves = createProductGridLoader({
  table: 'llaves',
  loadingMessage: 'Cargando llaves...',
  emptyIcon: 'fas fa-key',
  emptyTitle: 'No encontramos llaves disponibles',
  emptySubtitle: 'Pronto agregaremos nuevos modelos. Vuelve a intentarlo más tarde.',
  placeholderIcon: 'fas fa-key',
});
