export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  export const formatSearchResults = (results) => {
    return results.map(item => ({
      ...item,
      displayName: `${item.brand} ${item.model} (${item.year})`,
      price: item.price ? `$${item.price.toFixed(2)}` : 'Consultar'
    }));
  };