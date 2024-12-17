import Compressor from 'compressorjs';

export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      convertSize: 5000000, // Convert images > 5MB to JPEG
      ...options,
      success: resolve,
      error: reject
    });
  });
};

export const validateImage = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Formato de imagen no válido. Use JPG, PNG o WebP.');
  }

  if (file.size > maxSize) {
    throw new Error('La imagen es demasiado grande. Máximo 5MB.');
  }

  return true;
};

export const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export const resizeImage = async (file, maxWidth = 1920, maxHeight = 1080) => {
  const img = await loadImage(URL.createObjectURL(file));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  let width = img.width;
  let height = img.height;

  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.8);
  });
};