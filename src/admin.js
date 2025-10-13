import { supabase } from './config/supabase.js';
import { initProductsAdmin } from './admin-products.js';

// Estado global
let currentUser = null;
let isAdmin = false;

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  setupEventListeners();
});

// Verificar autenticación
async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    showLogin();
    return;
  }

  // Verificar si el usuario es admin
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminData) {
    showAlert('loginAlert', 'No tienes permisos de administrador', 'error');
    await supabase.auth.signOut();
    showLogin();
    return;
  }

  currentUser = user;
  isAdmin = true;
  showAdmin();
  loadAllData();
}

// Mostrar sección de login
function showLogin() {
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('adminSection').style.display = 'none';
}

// Mostrar sección de admin
function showAdmin() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('adminSection').style.display = 'block';
}

// Setup event listeners
function setupEventListeners() {
  // Login form
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);

  // Logout button
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

  // Tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Forms
  document.getElementById('gifForm')?.addEventListener('submit', handleGifSubmit);
  document.getElementById('productForm')?.addEventListener('submit', handleProductSubmit);
  document.getElementById('planForm')?.addEventListener('submit', handlePlanSubmit);
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    showAlert('loginAlert', error.message, 'error');
    return;
  }

  await checkAuth();
}

// Handle logout
async function handleLogout() {
  await supabase.auth.signOut();
  currentUser = null;
  isAdmin = false;
  showLogin();
}

// Switch tabs
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update content
  document.querySelectorAll('.admin-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(tabName).classList.add('active');
}

// Load all data
async function loadAllData() {
  await loadGifs();
  await initProductsAdmin();
  await loadPlans();
}

// GIFs Management
async function loadGifs() {
  const { data: gifs, error } = await supabase
    .from('banner_gifs')
    .select('*')
    .order('order_position');

  if (error) {
    console.error('Error loading gifs:', error);
    return;
  }

  const container = document.getElementById('gifsList');
  container.innerHTML = gifs.map(gif => `
    <div class="item-card">
      <div class="item-info">
        <h4>${gif.alt_text || 'GIF sin título'}</h4>
        <p>${gif.url}</p>
        <p style="font-size: 12px; color: rgba(255,255,255,0.5);">Orden: ${gif.order_position}</p>
      </div>
      <div class="item-actions">
        <button class="btn-icon" onclick="toggleGifActive('${gif.id}', ${!gif.active})" title="${gif.active ? 'Desactivar' : 'Activar'}">
          <i class="fas fa-${gif.active ? 'eye' : 'eye-slash'}"></i>
        </button>
        <button class="btn-icon delete" onclick="deleteGif('${gif.id}')" title="Eliminar">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

async function handleGifSubmit(e) {
  e.preventDefault();

  const url = document.getElementById('gifUrl').value;
  const alt_text = document.getElementById('gifAlt').value;
  const order_position = parseInt(document.getElementById('gifOrder').value);

  const { error } = await supabase
    .from('banner_gifs')
    .insert([{ url, alt_text, order_position }]);

  if (error) {
    alert('Error al guardar el GIF: ' + error.message);
    return;
  }

  document.getElementById('gifForm').reset();
  await loadGifs();
  alert('GIF guardado exitosamente');
}

window.toggleGifActive = async function(id, active) {
  const { error } = await supabase
    .from('banner_gifs')
    .update({ active })
    .eq('id', id);

  if (!error) {
    await loadGifs();
  }
};

window.deleteGif = async function(id) {
  if (!confirm('¿Estás seguro de eliminar este GIF?')) return;

  const { error } = await supabase
    .from('banner_gifs')
    .delete()
    .eq('id', id);

  if (!error) {
    await loadGifs();
  }
};

// Plans Management
async function loadPlans() {
  const { data: plans, error } = await supabase
    .from('plans')
    .select('*')
    .order('order_position');

  if (error) {
    console.error('Error loading plans:', error);
    return;
  }

  const container = document.getElementById('plansList');
  container.innerHTML = plans.map(plan => `
    <div class="item-card">
      <div class="item-info">
        <h4>${plan.name} ${plan.highlight ? '<i class="fas fa-star" style="color: gold;"></i>' : ''}</h4>
        <p>${plan.description}</p>
        <p style="font-size: 14px; color: rgba(255,255,255,0.8); margin-top: 8px;">
          <strong>${plan.price} ${plan.currency}</strong> | Orden: ${plan.order_position}
        </p>
      </div>
      <div class="item-actions">
        <button class="btn-icon" onclick="editPlan('${plan.id}')" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon" onclick="togglePlanActive('${plan.id}', ${!plan.active})" title="${plan.active ? 'Desactivar' : 'Activar'}">
          <i class="fas fa-${plan.active ? 'eye' : 'eye-slash'}"></i>
        </button>
        <button class="btn-icon delete" onclick="deletePlan('${plan.id}')" title="Eliminar">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

async function handlePlanSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('planId').value;
  const name = document.getElementById('planName').value;
  const description = document.getElementById('planDescription').value;
  const price = parseFloat(document.getElementById('planPrice').value);
  const currency = document.getElementById('planCurrency').value;
  const highlight = document.getElementById('planHighlight').checked;
  const order_position = parseInt(document.getElementById('planOrder').value);

  // Get features
  const features = [];
  document.querySelectorAll('.plan-feature-input').forEach(input => {
    if (input.value.trim()) {
      features.push(input.value.trim());
    }
  });

  const planData = {
    name,
    description,
    price,
    currency,
    features: JSON.stringify(features),
    highlight,
    order_position
  };

  let error;
  if (id) {
    const result = await supabase
      .from('plans')
      .update(planData)
      .eq('id', id);
    error = result.error;
  } else {
    const result = await supabase
      .from('plans')
      .insert([planData]);
    error = result.error;
  }

  if (error) {
    alert('Error al guardar el plan: ' + error.message);
    return;
  }

  document.getElementById('planForm').reset();
  document.getElementById('planId').value = '';
  resetPlanFeatures();
  await loadPlans();
  alert('Plan guardado exitosamente');
}

window.editPlan = async function(id) {
  const { data: plan, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    alert('Error al cargar el plan');
    return;
  }

  document.getElementById('planId').value = plan.id;
  document.getElementById('planName').value = plan.name;
  document.getElementById('planDescription').value = plan.description;
  document.getElementById('planPrice').value = plan.price;
  document.getElementById('planCurrency').value = plan.currency;
  document.getElementById('planHighlight').checked = plan.highlight;
  document.getElementById('planOrder').value = plan.order_position;

  // Load features
  const featuresList = document.getElementById('planFeaturesList');
  featuresList.innerHTML = '';
  const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
  features.forEach(feature => {
    const div = document.createElement('div');
    div.className = 'feature-item';
    div.innerHTML = `
      <input type="text" class="plan-feature-input" value="${feature}">
      <button type="button" class="btn-icon" onclick="removePlanFeature(this)">
        <i class="fas fa-times"></i>
      </button>
    `;
    featuresList.appendChild(div);
  });

  document.getElementById('planForm').scrollIntoView({ behavior: 'smooth' });
};

window.togglePlanActive = async function(id, active) {
  const { error } = await supabase
    .from('plans')
    .update({ active })
    .eq('id', id);

  if (!error) {
    await loadPlans();
  }
};

window.deletePlan = async function(id) {
  if (!confirm('¿Estás seguro de eliminar este plan?')) return;

  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', id);

  if (!error) {
    await loadPlans();
  }
};

window.addPlanFeature = function() {
  const featuresList = document.getElementById('planFeaturesList');
  const div = document.createElement('div');
  div.className = 'feature-item';
  div.innerHTML = `
    <input type="text" class="plan-feature-input" placeholder="Nueva característica">
    <button type="button" class="btn-icon" onclick="removePlanFeature(this)">
      <i class="fas fa-times"></i>
    </button>
  `;
  featuresList.appendChild(div);
};

window.removePlanFeature = function(button) {
  button.parentElement.remove();
};

function resetPlanFeatures() {
  const featuresList = document.getElementById('planFeaturesList');
  featuresList.innerHTML = `
    <div class="feature-item">
      <input type="text" class="plan-feature-input" placeholder="Característica 1">
      <button type="button" class="btn-icon" onclick="removePlanFeature(this)">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
}

// Show alert
function showAlert(containerId, message, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => {
    container.innerHTML = '';
  }, 5000);
}
