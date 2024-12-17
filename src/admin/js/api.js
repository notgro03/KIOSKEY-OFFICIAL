import { auth } from './auth';
import { API_BASE_URL } from './config';

class API {
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(auth.getToken() ? { 'Authorization': `Bearer ${auth.getToken()}` } : {}),
      ...options.headers
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Appearance Management
  async updateTheme(themeData) {
    return this.request('/appearance/theme', {
      method: 'PUT',
      body: JSON.stringify(themeData)
    });
  }

  async uploadLogo(file) {
    const formData = new FormData();
    formData.append('logo', file);

    return this.request('/appearance/logo', {
      method: 'POST',
      headers: {},
      body: formData
    });
  }

  // Product Management
  async getProducts(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/products?${params}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  // Content Management
  async updateContent(pageId, content) {
    return this.request(`/content/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify(content)
    });
  }

  // User Management
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }
}

export const api = new API();