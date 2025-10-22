import { createProductGridLoader } from './product-grid.js';

export const loadAccesorios = createProductGridLoader({
  table: 'accesorios',
  loadingMessage: 'Cargando accesorios...',
  emptyIcon: 'fas fa-toolbox',
  emptyTitle: 'No hay accesorios disponibles',
  emptySubtitle: 'Estamos renovando el catálogo. Volvé a consultar más tarde.',
  placeholderIcon: 'fas fa-toolbox',
});
