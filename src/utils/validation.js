export const validators = {
    required: (value) => {
      if (value === undefined || value === null || value === '') {
        throw new Error('Este campo es requerido');
      }
      return true;
    },
  
    email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Email inválido');
      }
      return true;
    },
  
    minLength: (length) => (value) => {
      if (value.length < length) {
        throw new Error(`Mínimo ${length} caracteres`);
      }
      return true;
    },
  
    maxLength: (length) => (value) => {
      if (value.length > length) {
        throw new Error(`Máximo ${length} caracteres`);
      }
      return true;
    },
  
    image: (file) => {
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
  };
  
  export const validate = (value, rules = []) => {
    try {
      rules.forEach(rule => {
        if (typeof rule === 'function') {
          rule(value);
        }
      });
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  };