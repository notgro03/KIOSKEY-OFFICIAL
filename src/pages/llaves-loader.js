import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebezqrsgednjwhajddqu.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXpxcnNnZWRuandoYWpkZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTEyNzYsImV4cCI6MjA1MDAyNzI3Nn0.6UpoIFJuEGDnLlD3_8w-fyQ2qMZ7uNDUttk-4Aeavgw';
const supabase = createClient(supabaseUrl, supabaseKey);

const WHATSAPP_NUMBER = '541157237390';
const DEFAULT_MODEL_OPTION = '<option value="">Seleccionar modelo</option>';

function escapeHtml(value = '') {
  return value
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderStatus(container, message, { error = false, loading = false } = {}) {
  if (!container) return;

  const icon = loading
    ? 'fa-spinner fa-spin'
    : error
    ? 'fa-triangle-exclamation'
    : 'fa-info-circle';

  container.innerHTML = `
    <div class="results-message${error ? ' results-message--error' : ''}">
      <i class="fas ${icon}"></i>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
  container.classList.add('active');
}

function renderResults(container, items) {
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      const brand = escapeHtml(item.brand ?? '');
      const model = escapeHtml(item.model ?? '');
      const description = escapeHtml(item.description ?? 'Sin descripción');
      const imageUrl = item.image_url ? escapeHtml(item.image_url) : '';

      const media = imageUrl
        ? `<img src="${imageUrl}" alt="Llave ${brand} ${model}" class="result-logo" />`
        : '<div class="result-logo result-logo--empty"><i class="fas fa-image"></i></div>';

      const whatsappMessage = encodeURIComponent(
        `Hola, me interesa obtener una cotización para la siguiente llave:\n\nMarca: ${brand}\nModelo: ${model}\nDescripción: ${description}\n\n¿Podrían brindarme información sobre precio y disponibilidad?`
      );

      return `
        <div class="result-item result-card">
          <div class="image-container">
            ${media}
          </div>
          <div class="result-info">
            <h3>Llave ${brand} ${model}</h3>
            <p class="result-description">${description}</p>
            <div class="result-features">
              <span class="result-feature">
                <i class="fas fa-check-circle"></i> Original o compatible garantizado
              </span>
              <span class="result-feature">
                <i class="fas fa-shield-alt"></i> Garantía de funcionamiento
              </span>
            </div>
          </div>
          <a
            href="https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${whatsappMessage}"
            target="_blank"
            rel="noopener"
            class="result-button"
          >
            <i class="fab fa-whatsapp"></i> Consultar
          </a>
        </div>
      `;
    })
    .join('');

  container.classList.add('active');
}

async function fetchBrands() {
  const { data, error } = await supabase
    .from('llaves')
    .select('brand')
    .order('brand', { ascending: true });

  if (error) throw error;
  return [...new Set((data ?? []).map((item) => item.brand).filter(Boolean))];
}

async function fetchModels(brand) {
  const { data, error } = await supabase
    .from('llaves')
    .select('model')
    .eq('brand', brand)
    .order('model', { ascending: true });

  if (error) throw error;
  return [...new Set((data ?? []).map((item) => item.model).filter(Boolean))];
}

async function fetchResults(brand, model) {
  const { data, error } = await supabase
    .from('llaves')
    .select('brand, model, description, image_url')
    .eq('brand', brand)
    .eq('model', model);

  if (error) throw error;
  return data ?? [];
}

export async function loadLlaves() {
  const brandSelect = document.getElementById('brandSelect');
  const modelSelect = document.getElementById('modelSelect');
  const searchButton = document.querySelector('.search-button');
  const resultsContainer = document.getElementById('searchResults');

  if (!brandSelect || !modelSelect || !searchButton || !resultsContainer) {
    return;
  }

  brandSelect.disabled = true;
  modelSelect.disabled = true;
  modelSelect.innerHTML = DEFAULT_MODEL_OPTION;
  resultsContainer.classList.remove('active');
  resultsContainer.innerHTML = '';

  try {
    const brands = await fetchBrands();

    brandSelect.innerHTML = '<option value="">Seleccionar marca</option>';
    brands.forEach((brand) => {
      const option = document.createElement('option');
      option.value = brand;
      option.textContent = brand;
      brandSelect.appendChild(option);
    });

    console.log('✅ Supabase conectado correctamente');
  } catch (error) {
    console.error('Error al cargar marcas:', error);
    renderStatus(resultsContainer, 'No se pudieron cargar las marcas disponibles.', { error: true });
  } finally {
    brandSelect.disabled = false;
  }

  brandSelect.addEventListener('change', async (event) => {
    const selectedBrand = event.target.value;
    modelSelect.disabled = true;
    modelSelect.innerHTML = DEFAULT_MODEL_OPTION;
    resultsContainer.classList.remove('active');
    resultsContainer.innerHTML = '';

    if (!selectedBrand) {
      return;
    }

    try {
      const models = await fetchModels(selectedBrand);

      if (!models.length) {
        renderStatus(resultsContainer, 'No se encontraron modelos para la marca seleccionada.');
        return;
      }

      models.forEach((model) => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
      });

      modelSelect.disabled = false;
    } catch (error) {
      console.error('Error al cargar modelos:', error);
      renderStatus(resultsContainer, 'No se pudieron cargar los modelos.', { error: true });
    }
  });

  searchButton.addEventListener('click', async () => {
    const brand = brandSelect.value;
    const model = modelSelect.value;

    if (!brand || !model) {
      alert('Seleccioná marca y modelo antes de buscar.');
      return;
    }

    renderStatus(resultsContainer, 'Buscando llaves compatibles...', { loading: true });

    try {
      const results = await fetchResults(brand, model);

      if (!results.length) {
        renderStatus(resultsContainer, 'No se encontraron resultados.');
        return;
      }

      renderResults(resultsContainer, results);
    } catch (error) {
      console.error('Error al cargar resultados:', error);
      renderStatus(resultsContainer, 'Error al cargar los resultados.', { error: true });
    }
  });
}
