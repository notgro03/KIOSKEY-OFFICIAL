import { supabase } from '../config/supabase.js';

const WHATSAPP_NUMBER = '541157237390';

function escapeHtml(value) {
  return value
    ? value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    : '';
}

function createResultCard(item, categoryLabel) {
  const brand = escapeHtml(item.brand ?? '');
  const model = escapeHtml(item.model ?? '');
  const description = escapeHtml(item.description ?? '');

  const imageMarkup = item.image_url
    ? `<img src="${escapeHtml(item.image_url)}" alt="${categoryLabel} ${brand} ${model}" class="result-logo">`
    : `<div class="result-logo result-logo--empty"><i class="fas fa-image"></i></div>`;

  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa consultar por la ${categoryLabel.toLowerCase()} ${item.brand ?? ''} ${item.model ?? ''}.` +
    '\n\n¿Podrían brindarme información sobre disponibilidad y precio?'
  );

  return `
    <div class="result-item">
      <div class="image-container">
        ${imageMarkup}
      </div>
      <div class="result-info">
        <h3>${categoryLabel} ${brand} ${model}</h3>
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

export async function loadCarcasas() {
  const brandSelect = document.getElementById('brandSelect');
  const modelSelect = document.getElementById('modelSelect');
  const searchButton = document.querySelector('.search-button');
  const resultsContainer = document.getElementById('searchResults');

  if (!brandSelect || !modelSelect || !searchButton || !resultsContainer) {
    return;
  }

  brandSelect.disabled = true;
  modelSelect.disabled = true;

  try {
    const { data, error } = await supabase
      .from('carcassas')
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

    brands.forEach((brand) => {
      const option = document.createElement('option');
      option.value = brand;
      option.textContent = brand;
      brandSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar marcas de carcasas:', error);
    showMessage(resultsContainer, 'No se pudieron cargar las marcas disponibles.', true);
  } finally {
    brandSelect.disabled = false;
  }

  brandSelect.addEventListener('change', async (event) => {
    const selectedBrand = event.target.value;
    modelSelect.innerHTML = '<option value="">Seleccionar modelo</option>';
    resultsContainer.innerHTML = '';
    resultsContainer.classList.remove('active');

    if (!selectedBrand) {
      modelSelect.disabled = true;
      return;
    }

    modelSelect.disabled = true;

    try {
      const { data, error } = await supabase
        .from('carcassas')
        .select('model')
        .eq('brand', selectedBrand)
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
      console.error('Error al cargar modelos de carcasas:', error);
      showMessage(resultsContainer, 'No se pudieron cargar los modelos.', true);
    }
  });

  searchButton.addEventListener('click', async () => {
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
        <p>Buscando carcasas compatibles...</p>
      </div>
    `;

    try {
      const { data, error } = await supabase
        .from('carcassas')
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

      resultsContainer.innerHTML = data
        .map((item) => createResultCard(item, 'Carcasa'))
        .join('');
    } catch (error) {
      console.error('Error al buscar carcasas:', error);
      showMessage(resultsContainer, 'Ocurrió un error al buscar las carcasas.', true);
    }
  });
}
