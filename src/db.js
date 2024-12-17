import Dexie from 'dexie';

export const db = new Dexie('kioskeysDB');

db.version(1).stores({
  brands: '++id, name, type, logo',
  products: '++id, name, brandId, category, price, description, image, type, features',
  categories: '++id, name, description',
  settings: 'key, value'
});

// Brand API
export const brandsAPI = {
  async getAll() {
    return await db.brands.toArray();
  },
  async add(brand) {
    return await db.brands.add(brand);
  },
  async update(id, brand) {
    return await db.brands.update(id, brand);
  },
  async delete(id) {
    return await db.brands.delete(id);
  }
};

// Product API
export const productsAPI = {
  async getAll() {
    return await db.products.toArray();
  },
  async getByType(type) {
    return await db.products.where('type').equals(type).toArray();
  },
  async getByBrand(brandId) {
    return await db.products.where('brandId').equals(brandId).toArray();
  },
  async add(product) {
    return await db.products.add(product);
  },
  async update(id, product) {
    return await db.products.update(id, product);
  },
  async delete(id) {
    return await db.products.delete(id);
  }
};

// Categories API
export const categoriesAPI = {
  async getAll() {
    return await db.categories.toArray();
  },
  async add(category) {
    return await db.categories.add(category);
  },
  async update(id, category) {
    return await db.categories.update(id, category);
  },
  async delete(id) {
    return await db.categories.delete(id);
  }
};