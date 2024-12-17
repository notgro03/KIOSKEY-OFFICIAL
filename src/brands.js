import { brandsAPI } from './db.js';
import { showSuccess, showError } from './ui.js';

export class BrandsManager {
  constructor() {
    this.initializeEventListeners();
    this.loadBrands();
  }

  initializeEventListeners() {
    const form = document.getElementById('brandForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Initialize Uploadcare widget
    const uploader = document.querySelector('[role=uploadcare-uploader]');
    if (uploader) {
      const widget = uploadcare.Widget(uploader, {
        publicKey: '1985ca48f4d597426e30',
        imagesOnly: true,
        crop: '1:1'
      });

      widget.onUploadComplete((fileInfo) => {
        document.getElementById('brandLogo').value = fileInfo.cdnUrl;
        document.getElementById('logoPreview').src = fileInfo.cdnUrl;
      });
    }
  }

  async loadBrands() {
    try {
      const brands = await brandsAPI.getAll();
      this.renderBrands(brands);
    } catch (error) {
      showError('Error al cargar las marcas');
      console.error(error);
    }
  }

  renderBrands(brands) {
    const container = document.getElementById('brandsList');
    if (!container) return;

    container.innerHTML = brands.map(brand => `
      <div class="brand-card" data-id="${brand.id}">
        <img src="${brand.logo}" alt="${brand.name}" class="brand-logo">
        <div class="brand-info">
          <h3>${brand.name}</h3>
          <p>${brand.type}</p>
        </div>
        <div class="brand-actions">
          <button onclick="brandsManager.editBrand(${brand.id})" class="edit-btn">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="brandsManager.deleteBrand(${brand.id})" class="delete-btn">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  async handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const brandData = {
      name: formData.get('name'),
      type: formData.get('type'),
      logo: formData.get('logo')
    };

    try {
      if (formData.get('id')) {
        await brandsAPI.update(parseInt(formData.get('id')), brandData);
        showSuccess('Marca actualizada correctamente');
      } else {
        await brandsAPI.add(brandData);
        showSuccess('Marca agregada correctamente');
      }
      
      e.target.reset();
      this.loadBrands();
    } catch (error) {
      showError('Error al guardar la marca');
      console.error(error);
    }
  }

  async editBrand(id) {
    const brands = await brandsAPI.getAll();
    const brand = brands.find(b => b.id === id);
    if (!brand) return;

    const form = document.getElementById('brandForm');
    if (!form) return;

    form.elements['id'].value = brand.id;
    form.elements['name'].value = brand.name;
    form.elements['type'].value = brand.type;
    form.elements['logo'].value = brand.logo;
    document.getElementById('logoPreview').src = brand.logo;
  }

  async deleteBrand(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta marca?')) return;

    try {
      await brandsAPI.delete(id);
      showSuccess('Marca eliminada correctamente');
      this.loadBrands();
    } catch (error) {
      showError('Error al eliminar la marca');
      console.error(error);
    }
  }
}

// Initialize brands manager
window.brandsManager = new BrandsManager();