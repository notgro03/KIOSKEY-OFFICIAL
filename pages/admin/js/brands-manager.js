import { STORAGE_KEYS } from './config.js';
import { saveToStorage, getFromStorage } from './storage.js';
import { showSuccess, showError } from './ui.js';

class BrandsManager {
  constructor() {
    this.brands = this.loadBrands();
  }

  loadBrands() {
    return getFromStorage(STORAGE_KEYS.BRANDS) || {};
  }

  saveBrands() {
    return saveToStorage(STORAGE_KEYS.BRANDS, this.brands);
  }

  addBrand(brandData) {
    try {
      const { name, logo, type = 'car' } = brandData;
      
      if (!name || !logo) {
        throw new Error('Nombre y logo son requeridos');
      }

      if (this.brands[name]) {
        throw new Error('La marca ya existe');
      }

      this.brands[name] = {
        logo,
        type,
        models: {},
        createdAt: new Date().toISOString()
      };

      if (!this.saveBrands()) {
        throw new Error('Error al guardar la marca');
      }

      showSuccess('Marca agregada correctamente');
      return true;
    } catch (error) {
      showError(error.message || 'Error al agregar la marca');
      console.error('Error adding brand:', error);
      return false;
    }
  }

  updateBrand(name, updates) {
    try {
      if (!this.brands[name]) {
        throw new Error('Marca no encontrada');
      }

      this.brands[name] = {
        ...this.brands[name],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      if (!this.saveBrands()) {
        throw new Error('Error al guardar los cambios');
      }

      showSuccess('Marca actualizada correctamente');
      return true;
    } catch (error) {
      showError(error.message || 'Error al actualizar la marca');
      console.error('Error updating brand:', error);
      return false;
    }
  }

  addModel(brandName, modelData) {
    try {
      const { name, years } = modelData;
      
      if (!this.brands[brandName]) {
        throw new Error('Marca no encontrada');
      }

      if (!name || !years?.length) {
        throw new Error('Nombre y años son requeridos');
      }

      this.brands[brandName].models[name] = years;

      if (!this.saveBrands()) {
        throw new Error('Error al guardar el modelo');
      }

      showSuccess('Modelo agregado correctamente');
      return true;
    } catch (error) {
      showError(error.message || 'Error al agregar el modelo');
      console.error('Error adding model:', error);
      return false;
    }
  }

  getAllBrands() {
    return this.brands;
  }

  getBrand(name) {
    return this.brands[name];
  }

  getModels(brandName) {
    return this.brands[brandName]?.models || {};
  }

  deleteBrand(name) {
    try {
      if (!this.brands[name]) {
        throw new Error('Marca no encontrada');
      }

      delete this.brands[name];

      if (!this.saveBrands()) {
        throw new Error('Error al eliminar la marca');
      }

      showSuccess('Marca eliminada correctamente');
      return true;
    } catch (error) {
      showError(error.message || 'Error al eliminar la marca');
      console.error('Error deleting brand:', error);
      return false;
    }
  }
}

export const brandsManager = new BrandsManager();