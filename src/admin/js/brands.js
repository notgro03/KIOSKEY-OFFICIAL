import { db } from './db.js';

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