import { STORAGE_KEYS } from './config.js';
import { saveToStorage, getFromStorage } from './storage.js';

export const BRANDS_DATA = {
  'Toyota': {
    models: {
      'Corolla': ['2020', '2021', '2022', '2023'],
      'Camry': ['2019', '2020', '2021', '2022', '2023'],
      'RAV4': ['2018', '2019', '2020', '2021', '2022', '2023']
    }
  },
  'Honda': {
    models: {
      'Civic': ['2019', '2020', '2021', '2022', '2023'],
      'CR-V': ['2018', '2019', '2020', '2021', '2022', '2023']
    }
  },
  'Volkswagen': {
    models: {
      'Golf': ['2018', '2019', '2020', '2021', '2022'],
      'Polo': ['2019', '2020', '2021', '2022', '2023']
    }
  }
};

export function getBrands() {
  return getFromStorage(STORAGE_KEYS.BRANDS) || BRANDS_DATA;
}

export function getModels(brand) {
  const brands = getBrands();
  return brands[brand]?.models || {};
}

export function getYears(brand, model) {
  const models = getModels(brand);
  return models[model] || [];
}

export function addBrand(brand, data) {
  try {
    const brands = getBrands();
    brands[brand] = data;
    saveToStorage(STORAGE_KEYS.BRANDS, brands);
    return true;
  } catch (error) {
    console.error('Error adding brand:', error);
    return false;
  }
}