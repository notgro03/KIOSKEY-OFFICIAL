import { api } from './api';
import { showSuccess, showError, showConfirm, showLoading, hideLoading } from './ui';

class UserManager {
  constructor() {
    this.users = [];
    this.initializeEventListeners();
    this.loadUsers();
  }

  initializeEventListeners() {
    const form = document.getElementById('userForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleUserSubmit(e);
      });
    }
  }

  async loadUsers() {
    try {
      showLoading();
      this.users = await api.getUsers();
      this.renderUsers();
    } catch (error) {
      showError('Error al cargar usuarios');
      console.error('Error loading users:', error);
    } finally {
      hideLoading();
    }
  }

  renderUsers() {
    const container = document.getElementById('usersList');
    if (!container) return;

    container.innerHTML = this.users.map(user => `
      <div class="user-card" data-user-id="${user.id}">
        <div class="user-info">
          <h3>${user.name}</h3>
          <p>${user.email}</p>
          <div class="user-role">${user.role}</div>
        </div>
        <div class="user-actions">
          <button onclick="userManager.editUser('${user.id}')" class="btn btn-primary">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button onclick="userManager.deleteUser('${user.id}')" class="btn btn-danger">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      </div>
    `).join('');
  }

  async handleUserSubmit(e) {
    try {
      showLoading();
      const formData = new FormData(e.target);
      const userData = Object.fromEntries(formData.entries());
      
      if (userData.id) {
        await api.updateUser(userData.id, userData);
        showSuccess('Usuario actualizado correctamente');
      } else {
        await api.createUser(userData);
        showSuccess('Usuario creado correctamente');
      }

      e.target.reset();
      this.loadUsers();
    } catch (error) {
      showError('Error al guardar el usuario');
      console.error('Error saving user:', error);
    } finally {
      hideLoading();
    }
  }

  async deleteUser(id) {
    if (await showConfirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        showLoading();
        await api.deleteUser(id);
        showSuccess('Usuario eliminado correctamente');
        this.loadUsers();
      } catch (error) {
        showError('Error al eliminar el usuario');
        console.error('Error deleting user:', error);
      } finally {
        hideLoading();
      }
    }
  }

  editUser(id) {
    const user = this.users.find(u => u.id === id);
    if (!user) return;

    const form = document.getElementById('userForm');
    if (!form) return;

    // Fill form fields
    Object.entries(user).forEach(([key, value]) => {
      const input = form.elements[key];
      if (input) {
        input.value = value;
      }
    });

    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });
  }
}

export const userManager = new UserManager();