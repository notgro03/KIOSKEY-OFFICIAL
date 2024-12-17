export function validateProduct(data) {
  const required = ['category', 'brand', 'model', 'year', 'price'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length) {
    throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
  }

  if (isNaN(data.price) || data.price <= 0) {
    throw new Error('El precio debe ser un número mayor a 0');
  }

  return true;
}

export function validateImage(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Formato de imagen no válido. Use JPG, PNG o WebP.');
  }

  if (file.size > maxSize) {
    throw new Error('La imagen es demasiado grande. Máximo 5MB.');
  }

  return true;
}

export function validateTheme(data) {
  const required = ['primaryColor', 'secondaryColor'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length) {
    throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
  }

  return true;
}