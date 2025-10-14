import { supabase } from '../../config/supabase.js';

// Configuración
const WHATSAPP_NUMBER = '541157237390';
const DEFAULT_DESCRIPTION = 'Control remoto original';

export function initTelemandosSearch() {
  const elements = {
    brandSelect: document.getElementById('brandSelect'),
    modelSelect: document.getElementById('modelSelect'),
    searchButton: document.querySelector('.search-button'),
    resultsContainer: document.querySelector('.search-results'),
    modal: document.querySelector('.modal')
  };

  if (!validateElements(elements)) return;

  setupModal(elements.modal);
  loadInitialData(elements);
  setupEventListeners(elements);
}

function validateElements(elements) {
  const missing = Object.entries(elements)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error('Elementos no encontrados:', missing.join(', '));
    return false;
  }

  return true;
}

function setupModal(modal) {
  if (!modal) return;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}

async function loadInitialData(elements) {
  try {
    const { data: brands, error } = await supabase
      .from('telemandos')
      .select('brand')
      .eq('active', true)
      .order('brand');

    if (error) throw error;

    const uniqueBrands = [...new Set(brands.map(item => item.brand))].sort();
    updateBrandSelect(elements.brandSelect, uniqueBrands);
  } catch (error) {
    console.error('Error al cargar marcas:', error);
    showError('Error al cargar las marcas. Por favor, intenta nuevamente.');
  }
}

function updateBrandSelect(select, brands) {
  select.innerHTML = `
    <option value="">Seleccionar marca</option>
    ${brands.map(brand => `<option value="${brand}">${brand}</option>`).join('')}
  `;
}

function setupEventListeners(elements) {
  const { brandSelect, modelSelect, searchButton } = elements;

  brandSelect.addEventListener('change', () => handleBrandChange(elements));
  searchButton.addEventListener('click', () => handleSearch(elements));

  // Habilitar búsqueda con Enter en los selects
  [brandSelect, modelSelect].forEach(select => {
    select.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch(elements);
    });
  });
}

async function handleBrandChange(elements) {
  const { brandSelect, modelSelect } = elements;
  const selectedBrand = brandSelect.value;

  modelSelect.innerHTML = '<option value="">Seleccionar modelo</option>';
  modelSelect.disabled = !selectedBrand;

  if (!selectedBrand) return;

  try {
    const { data: models, error } = await supabase
      .from('telemandos')
      .select('model')
      .eq('brand', selectedBrand)
      .eq('active', true)
      .order('model');

    if (error) throw error;

    const uniqueModels = [...new Set(models.map(item => item.model))].sort();
    modelSelect.innerHTML = `
      <option value="">Seleccionar modelo</option>
      ${uniqueModels.map(model => `<option value="${model}">${model}</option>`).join('')}
    `;
    modelSelect.disabled = false;
  } catch (error) {
    console.error('Error al cargar modelos:', error);
    showError('Error al cargar los modelos. Por favor, intenta nuevamente.');
  }
}

async function handleSearch(elements) {
  const { brandSelect, modelSelect, resultsContainer } = elements;
  const brand = brandSelect.value;
  const model = modelSelect.value;

  if (!validateSearch(brand, model)) return;

  try {
    const { data: telemandos, error } = await supabase
      .from('telemandos')
      .select('*')
      .eq('brand', brand)
      .eq('model', model)
      .eq('active', true);

    if (error) throw error;
    displayResults(telemandos, brand, model, resultsContainer);
  } catch (error) {
    console.error('Error al buscar telemandos:', error);
    showError('Error al buscar telemandos. Por favor, intenta nuevamente.');
  }
}

function validateSearch(brand, model) {
  if (!brand) {
    showError('Por favor selecciona una marca');
    return false;
  }
  if (!model) {
    showError('Por favor selecciona un modelo');
    return false;
  }
  return true;
}

function displayResults(telemandos, brand, model, container) {
  if (!telemandos || telemandos.length === 0) {
    showNoResults(container, brand, model);
    return;
  }

  const resultsHTML = telemandos.map(telemando => 
    createResultCard(telemando, brand, model)
  ).join('');

  container.innerHTML = resultsHTML;
  container.classList.add('active');
}

function createResultCard(telemando, brand, model) {
  const features = [
    { icon: 'fa-check-circle', text: 'Alta compatibilidad' },
    { icon: 'fa-shield-alt', text: 'Garantía 1 año' },
    { icon: 'fa-tools', text: 'Programación incluida' }
  ];

  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa el siguiente telemando:\n` +
    `Marca: ${brand}\n` +
    `Modelo: ${model}\n` +
    `${telemando.description ? `Descripción: ${telemando.description}\n` : ''}\n` +
    `¿Podrían brindarme información sobre precio y disponibilidad?`
  );

  const mediaContent = telemando.video_url
    ? `<video class="result-video" autoplay loop muted playsinline>
         <source src="${telemando.video_url}" type="video/mp4">
       </video>`
    : `<img src="${telemando.image_url}" alt="Telemando ${brand} ${model}">`;

  return `
    <div class="result-card">
      <div class="result-image">
        ${mediaContent}
      </div>
      <div class="result-content">
        <h3>${brand} ${model}</h3>
        <p>${telemando.description || DEFAULT_DESCRIPTION}</p>
        <div class="result-features">
          ${features.map(feature => `
            <span class="feature-tag">
              <i class="fas ${feature.icon}"></i>
              ${feature.text}
            </span>
          `).join('')}
        </div>
        <a href="https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${whatsappMessage}"
           target="_blank"
           class="contact-button">
          <i class="fab fa-whatsapp"></i>
          Consultar precio
        </a>
      </div>
    </div>
  `;
}

function showNoResults(container, brand, model) {
  const whatsappMessage = encodeURIComponent(
    `Hola, estoy buscando un telemando para:\n` +
    `Marca: ${brand}\n` +
    `Modelo: ${model}\n\n` +
    `¿Tienen disponibilidad?`
  );

  container.innerHTML = `
    <div class="not-found-section">
      <p class="not-found-message">
        No encontramos telemandos para el modelo seleccionado en este momento
      </p>
      <a href="https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${whatsappMessage}"
         target="_blank"
         class="whatsapp-button">
        <i class="fab fa-whatsapp"></i>
        Consultar disponibilidad
      </a>
    </div>
  `;
  container.classList.add('active');
}

function showError(message) {
  // TODO: Implementar un sistema de notificaciones mejor
  alert(message);
}