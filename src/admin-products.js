import { supabase } from './config/supabase.js';

let categories = [];
let currentEditingProduct = null;

export async function initProductsAdmin() {
  await loadCategories();
  await loadProducts();
  setupEventListeners();
}

async function loadCategories() {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('display_order');

  if (error) {
    console.error('Error loading categories:', error);
    showNotification('Error al cargar categorías', 'error');
    return;
  }

  categories = data;
  populateCategorySelects();
}

function populateCategorySelects() {
  const selects = document.querySelectorAll('.category-select');
  selects.forEach(select => {
    select.innerHTML = '<option value="">Seleccionar categoría</option>';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      select.appendChild(option);
    });
  });
}

async function loadProducts(categoryFilter = null) {
  let query = supabase
    .from('products')
    .select(`
      *,
      product_categories (
        name,
        slug,
        icon
      )
    `)
    .order('display_order');

  if (categoryFilter) {
    query = query.eq('category_id', categoryFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error loading products:', error);
    showNotification('Error al cargar productos', 'error');
    return;
  }

  displayProducts(data);
}

function displayProducts(products) {
  const container = document.getElementById('productsList');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">
        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px;"></i>
        <p>No hay productos. Agrega tu primer producto.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="item-card" data-product-id="${product.id}">
      <div class="item-image">
        ${product.image_url
          ? `<img src="${product.image_url}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`
          : `<div style="width: 100%; height: 100%; background: rgba(255,255,255,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image" style="font-size: 32px; color: rgba(255,255,255,0.3);"></i></div>`
        }
      </div>
      <div class="item-info">
        <h4>${product.title}</h4>
        <p>
          <i class="fas ${product.product_categories?.icon || 'fa-tag'}"></i>
          ${product.product_categories?.name || 'Sin categoría'}
          ${product.price ? ` - $${parseFloat(product.price).toLocaleString('es-AR')}` : ''}
        </p>
        <p style="font-size: 12px; opacity: 0.6;">
          ${product.brand || ''} ${product.model || ''}
          ${product.is_active ? '<span style="color: #22c55e;">● Activo</span>' : '<span style="color: #ef4444;">● Inactivo</span>'}
        </p>
      </div>
      <div class="item-actions">
        <button class="btn-icon" onclick="window.editProduct('${product.id}')" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon delete" onclick="window.deleteProduct('${product.id}')" title="Eliminar">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function setupEventListeners() {
  const filterCategory = document.getElementById('filterCategory');
  if (filterCategory) {
    filterCategory.addEventListener('change', (e) => {
      const categoryId = e.target.value;
      loadProducts(categoryId || null);
    });
  }

  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', handleProductSubmit);
  }

  const btnNewProduct = document.getElementById('btnNewProduct');
  if (btnNewProduct) {
    btnNewProduct.addEventListener('click', openNewProductModal);
  }

  const btnCancelProduct = document.getElementById('btnCancelProduct');
  if (btnCancelProduct) {
    btnCancelProduct.addEventListener('click', closeProductModal);
  }
}

function openNewProductModal() {
  currentEditingProduct = null;
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');

  if (form) form.reset();
  document.getElementById('modalTitle').textContent = 'Nuevo Producto';

  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (modal) {
    modal.style.display = 'none';
  }
  currentEditingProduct = null;
}

async function handleProductSubmit(e) {
  e.preventDefault();

  const formData = {
    category_id: document.getElementById('productCategory').value,
    title: document.getElementById('productTitle').value,
    description: document.getElementById('productDescription').value,
    image_url: document.getElementById('productImage').value,
    price: parseFloat(document.getElementById('productPrice').value) || 0,
    stock: parseInt(document.getElementById('productStock').value) || 0,
    brand: document.getElementById('productBrand').value,
    model: document.getElementById('productModel').value,
    is_active: document.getElementById('productActive').checked,
    display_order: parseInt(document.getElementById('productOrder').value) || 0,
    features: [],
    compatibility: []
  };

  try {
    if (currentEditingProduct) {
      const { error } = await supabase
        .from('products')
        .update(formData)
        .eq('id', currentEditingProduct);

      if (error) throw error;
      showNotification('Producto actualizado correctamente', 'success');
    } else {
      const { error } = await supabase
        .from('products')
        .insert([formData]);

      if (error) throw error;
      showNotification('Producto creado correctamente', 'success');
    }

    closeProductModal();
    await loadProducts();
  } catch (error) {
    console.error('Error saving product:', error);
    showNotification('Error al guardar el producto', 'error');
  }
}

window.editProduct = async function(productId) {
  currentEditingProduct = productId;

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) {
    console.error('Error loading product:', error);
    showNotification('Error al cargar el producto', 'error');
    return;
  }

  document.getElementById('modalTitle').textContent = 'Editar Producto';
  document.getElementById('productCategory').value = product.category_id || '';
  document.getElementById('productTitle').value = product.title || '';
  document.getElementById('productDescription').value = product.description || '';
  document.getElementById('productImage').value = product.image_url || '';
  document.getElementById('productPrice').value = product.price || '';
  document.getElementById('productStock').value = product.stock || '';
  document.getElementById('productBrand').value = product.brand || '';
  document.getElementById('productModel').value = product.model || '';
  document.getElementById('productActive').checked = product.is_active;
  document.getElementById('productOrder').value = product.display_order || 0;

  const modal = document.getElementById('productModal');
  if (modal) {
    modal.style.display = 'flex';
  }
};

window.deleteProduct = async function(productId) {
  if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
    return;
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    showNotification('Producto eliminado correctamente', 'success');
    await loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    showNotification('Error al eliminar el producto', 'error');
  }
};

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type}`;
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '100px';
  notification.style.right = '20px';
  notification.style.zIndex = '10000';
  notification.style.minWidth = '300px';
  notification.style.animation = 'slideIn 0.3s ease';

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}
