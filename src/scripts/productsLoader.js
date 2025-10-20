import { supabase } from '../config/supabase.js';

const brandSelect = document.getElementById('brandSelect');
const modelSelect = document.getElementById('modelSelect');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('resultsContainer');

if (brandSelect && modelSelect && searchBtn && resultsContainer) {
  const TABLES = [
    { name: 'llaves', label: 'Llaves' },
    { name: 'carcassas', fallback: 'carcasas', label: 'Carcasas' },
    { name: 'telemandos', label: 'Telemandos' }
  ];

  const NO_IMAGE = '/LOGO_KIOSKEYS.png';

  const escapeHtml = (value = '') =>
    value
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const setResultsContent = (html) => {
    resultsContainer.innerHTML = html;
  };

  const setLoadingState = (isLoading) => {
    searchBtn.disabled = isLoading;
    searchBtn.textContent = isLoading ? 'Buscando…' : 'Buscar productos compatibles';
  };

  const showPlaceholder = (message) => {
    setResultsContent(`<p class="results-placeholder">${escapeHtml(message)}</p>`);
  };

  showPlaceholder('Seleccioná una marca y un modelo para ver los productos compatibles.');

  const getUniqueSorted = (items = []) => {
    return Array.from(new Set(items.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'));
  };

  async function loadBrands() {
    brandSelect.disabled = true;
    modelSelect.disabled = true;
    modelSelect.value = '';
    modelSelect.innerHTML = "<option value=''>Seleccionar modelo</option>";

    const { data, error } = await supabase
      .from('llaves')
      .select('brand')
      .order('brand');

    if (error) {
      console.error('Error cargando marcas', error);
      showPlaceholder('No fue posible obtener las marcas disponibles. Intentá nuevamente más tarde.');
      brandSelect.disabled = false;
      return;
    }

    const brands = getUniqueSorted((data || []).map((item) => item.brand));
    brandSelect.innerHTML = "<option value=''>Seleccionar marca</option>" +
      brands.map((brand) => `<option value='${escapeHtml(brand)}'>${escapeHtml(brand)}</option>`).join('');

    brandSelect.disabled = false;
  }

  async function loadModels(brand) {
    if (!brand) {
      modelSelect.disabled = true;
      modelSelect.value = '';
      modelSelect.innerHTML = "<option value=''>Seleccionar modelo</option>";
      showPlaceholder('Seleccioná una marca y un modelo para ver los productos compatibles.');
      return;
    }

    modelSelect.disabled = true;
    modelSelect.innerHTML = "<option value=''>Cargando modelos...</option>";

    const { data, error } = await supabase
      .from('llaves')
      .select('model')
      .eq('brand', brand)
      .order('model');

    if (error) {
      console.error('Error cargando modelos', error);
      modelSelect.innerHTML = "<option value=''>Sin modelos disponibles</option>";
      showPlaceholder('No fue posible obtener los modelos para la marca seleccionada.');
      return;
    }

    const models = getUniqueSorted((data || []).map((item) => item.model));
    modelSelect.innerHTML = "<option value=''>Seleccionar modelo</option>" +
      models.map((model) => `<option value='${escapeHtml(model)}'>${escapeHtml(model)}</option>`).join('');
    modelSelect.disabled = models.length === 0;

    if (!models.length) {
      showPlaceholder('No se encontraron modelos para la marca seleccionada.');
    }
  }

  async function fetchFromTable(table, brand, model) {
    const { name, fallback } = table;

    let response = await supabase
      .from(name)
      .select('*')
      .eq('brand', brand)
      .eq('model', model);

    if (response.error && fallback) {
      response = await supabase
        .from(fallback)
        .select('*')
        .eq('brand', brand)
        .eq('model', model);
    }

    if (response.error) {
      if (response.error.code !== 'PGRST116') {
        console.error(`Error consultando ${name}:`, response.error);
      }
      return [];
    }

    return (response.data || []).map((item) => ({ ...item, table: table.label }));
  }

  async function searchProducts() {
    const brand = brandSelect.value;
    const model = modelSelect.value;

    if (!brand || !model) {
      showPlaceholder('Seleccioná una marca y un modelo para iniciar la búsqueda.');
      return;
    }

    setLoadingState(true);
    showPlaceholder('Buscando productos disponibles…');

    const results = [];

    for (const table of TABLES) {
      const data = await fetchFromTable(table, brand, model);
      results.push(...data);
    }

    setLoadingState(false);

    if (!results.length) {
      showPlaceholder('No se encontraron productos para esa marca y modelo.');
      return;
    }

    const cards = results
      .map((item) => {
        const imageSrc = item.image_url ? escapeHtml(item.image_url) : NO_IMAGE;
        const description = item.description ? `<p>${escapeHtml(item.description)}</p>` : '';
        const origin = item.table ? `<span class="product-origin">${escapeHtml(item.table)}</span>` : '';
        const title = `${escapeHtml(item.brand || '')} ${escapeHtml(item.model || '')}`.trim();

        return `
        <div class="product-card">
          ${origin}
          <img src="${imageSrc}" alt="${title || 'Producto'}" loading="lazy">
          <h4>${title || 'Producto disponible'}</h4>
          ${description}
        </div>
      `;
      })
      .join('');

    setResultsContent(cards);
  }

  brandSelect.addEventListener('change', (event) => {
    const { value } = event.target;
    loadModels(value);
  });

  searchBtn.addEventListener('click', searchProducts);

  loadBrands();
}
