import { STORAGE_KEYS } from './config';

class Auth {
  constructor() {
    this.token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    this.userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA));
  }

  isAuthenticated() {
    return !!this.token;
  }

  hasPermission(permission) {
    return this.userData?.permissions?.includes(permission);
  }

  login(token, userData) {
    this.token = token;
    this.userData = userData;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }

  logout() {
    this.token = null;
    this.userData = null;
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    window.location.href = '/admin/login';
  }

  getToken() {
    return this.token;
  }

  getUserData() {
    return this.userData;
  }
}

export const auth = new Auth();