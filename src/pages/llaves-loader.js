import { supabase } from '../config/supabase.js';

const WHATSAPP_NUMBER = '541157237390';

function getOrCreateModal() {
  let modal = document.querySelector('.modal');
  let modalImage = modal?.querySelector('.modal-content');

  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = '<img class="modal-content" alt="Imagen ampliada">';
    document.body.appendChild(modal);
    modalImage = modal.querySelector('.modal-content');
  }

  if (modal && !modal.dataset.bound) {
    modal.addEventListener('click', () => {
      modal.classList.remove('active');
    });
    modal.dataset.bound = 'true';
  }

  return { modal, modalImage };
}

function bindImagePreview(container) {
  if (!container || container.dataset.previewBound) {
    return;
  }

  const { modal, modalImage } = getOrCreateModal();

  if (!modal || !modalImage) {
    return;
  }

  container.addEventListener('click', (event) => {
    const target = event.target.closest('.result-media--image');

    if (!target || !container.contains(target)) {
      return;
    }

    const fullSrc = target.getAttribute('data-full') || target.getAttribute('src');

    if (!fullSrc) {
      return;
    }

    modalImage.src = fullSrc;
    modal.classList.add('active');
  });

  container.dataset.previewBound = 'true';
}

function escapeHtml(value) {
  return value
    ? value
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    : '';
}

function createResultCard(item) {
  const brand = escapeHtml(item.brand ?? '');
  const model = escapeHtml(item.model ?? '');
  const description = escapeHtml(item.description ?? '');
  const imageUrl = escapeHtml(item.image_url ?? '');

  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa consultar por la llave ${item.brand ?? ''} ${item.model ?? ''}.` +
      '\n\n¿Podrían brindarme información sobre disponibilidad y precio?'
  );

  const mediaMarkup = imageUrl
    ? `<img src="${imageUrl}" data-full="${imageUrl}" alt="Llave ${brand} ${model}" class="result-logo result-media result-media--image">`
    : '<div class="result-logo result-logo--empty"><i class="fas fa-image"></i></div>';

  return `
    <div class="result-item">
      <div class="image-container">
        ${mediaMarkup}
      </div>
      <div class="result-info">
        <h3>Llave ${brand} ${model}</h3>
        <p><strong>Modelo:</strong> ${model || 'N/D'}</p>
        ${description ? `<p class="result-description">${description}</p>` : ''}
      </div>
      <a href="https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${whatsappMessage}" target="_blank" rel="noopener" class="result-button">
        <i class="fab fa-whatsapp"></i> Consultar
      </a>
    </div>
  `;
}

function showMessage(container, message, isError = false) {
  container.innerHTML = `
    <div class="results-message${isError ? ' results-message--error' : ''}">
      <i class="fas ${isError ? 'fa-triangle-exclamation' : 'fa-info-circle'}"></i>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
  container.classList.add('active');
}

export function loadLlaves() {
  const brandSelect = document.getElementById('brandSelect');
  const modelSelect = document.getElementById('modelSelect');
  const resultsContainer = document.getElementById('searchResults');
  const searchButton = document.querySelector('.search-button');

  if (!brandSelect || !modelSelect || !resultsContainer || !searchButton) {
    return;
  }

  brandSelect.disabled = true;
  modelSelect.disabled = true;

  bindImagePreview(resultsContainer);

  async function loadBrands() {
    try {
      const { data, error } = await supabase
        .from('llaves')
        .select('brand')
        .order('brand', { ascending: true });

      if (error) {
        throw error;
      }

      console.log('✅ Supabase conectado correctamente');

      const brands = Array.from(new Set((data ?? [])
        .map((item) => item.brand)
        .filter(Boolean)))
        .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

      brandSelect.innerHTML = '<option value="">Seleccionar marca</option>';

      brands.forEach((brand) => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error al cargar marcas de llaves:', error);
      showMessage(resultsContainer, 'No se pudieron cargar las marcas disponibles.', true);
    } finally {
      brandSelect.disabled = false;
    }
  }

  async function loadModels(brand) {
    modelSelect.innerHTML = '<option value="">Seleccionar modelo</option>';
    resultsContainer.innerHTML = '';
    resultsContainer.classList.remove('active');

    if (!brand) {
      modelSelect.disabled = true;
      return;
    }

    modelSelect.disabled = true;

    try {
      const { data, error } = await supabase
        .from('llaves')
        .select('model')
        .eq('brand', brand)
        .order('model', { ascending: true });

      if (error) {
        throw error;
      }

      const models = Array.from(new Set((data ?? [])
        .map((item) => item.model)
        .filter(Boolean)))
        .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

      models.forEach((model) => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
      });

      modelSelect.disabled = models.length === 0;
    } catch (error) {
      console.error('Error al cargar modelos de llaves:', error);
      showMessage(resultsContainer, 'No se pudieron cargar los modelos.', true);
    }
  }

  async function searchKeys() {
    const brand = brandSelect.value;
    const model = modelSelect.value;

    if (!brand || !model) {
      alert('Seleccioná marca y modelo antes de buscar.');
      return;
    }

    resultsContainer.classList.add('active');
    resultsContainer.innerHTML = `
      <div class="results-message">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Buscando llaves compatibles...</p>
      </div>
    `;

    try {
      const { data, error } = await supabase
        .from('llaves')
        .select('brand, model, description, image_url')
        .eq('brand', brand)
        .eq('model', model);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        showMessage(resultsContainer, 'No se encontraron resultados.');
        return;
      }

      resultsContainer.innerHTML = data.map((item) => createResultCard(item)).join('');
    } catch (error) {
      console.error('Error al buscar llaves:', error);
      showMessage(resultsContainer, 'Ocurrió un error al buscar las llaves.', true);
    }
  }

  brandSelect.addEventListener('change', (event) => {
    loadModels(event.target.value);
  });

  searchButton.addEventListener('click', searchKeys);

  loadBrands();
}
