import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebezqrsgednjwhajddqu.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXpxcnNnZWRuandoYWpkZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTEyNzYsImV4cCI6MjA1MDAyNzI3Nn0.6UpoIFJuEGDnLlD3_8w-fyQ2qMZ7uNDUttk-4Aeavgw';
const supabase = createClient(supabaseUrl, supabaseKey);

export function loadLlaves() {
  const brandSelect = document.getElementById('brandSelect');
  const modelSelect = document.getElementById('modelSelect');
  const resultsContainer = document.getElementById('searchResults');
  const searchButton =
    document.querySelector('.search-button button, #searchButton') || document.querySelector('.search-button');

  if (!brandSelect || !modelSelect || !resultsContainer || !searchButton) {
    return;
  }

  // ✅ Cargar Marcas
  async function loadBrands() {
    try {
      const { data, error } = await supabase.from('llaves').select('brand').order('brand', { ascending: true });
      if (error) throw error;
      const brands = [...new Set(data.map((item) => item.brand).filter(Boolean))];
      brandSelect.innerHTML = '<option value="">Seleccionar marca</option>';
      brands.forEach((brand) => {
        const opt = document.createElement('option');
        opt.value = brand;
        opt.textContent = brand;
        brandSelect.appendChild(opt);
      });
      console.log('✅ Supabase conectado correctamente');
    } catch (err) {
      console.error('Error al cargar marcas:', err.message);
    }
  }

  // ✅ Cargar Modelos según Marca
  async function loadModels(brand) {
    try {
      const { data, error } = await supabase
        .from('llaves')
        .select('model')
        .eq('brand', brand)
        .order('model', { ascending: true });
      if (error) throw error;
      const models = [...new Set(data.map((item) => item.model).filter(Boolean))];
      modelSelect.innerHTML = '<option value="">Seleccionar modelo</option>';
      models.forEach((model) => {
        const opt = document.createElement('option');
        opt.value = model;
        opt.textContent = model;
        modelSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Error al cargar modelos:', err.message);
    }
  }

  // ✅ Buscar productos compatibles
  async function searchKeys() {
    const brand = brandSelect.value;
    const model = modelSelect.value;
    resultsContainer.innerHTML = '<p style="color:#66ccff">Buscando...</p>';
    try {
      const { data, error } = await supabase
        .from('llaves')
        .select('brand, model, description, image_url')
        .eq('brand', brand)
        .eq('model', model);
      if (error) throw error;

      if (!data || data.length === 0) {
        resultsContainer.innerHTML = '<p style="color:#aaa">No se encontraron resultados.</p>';
        return;
      }

      resultsContainer.innerHTML = data
        .map(
          (item) => `
          <div class='result-card'>
            <img src='${item.image_url || ''}' alt='${item.model}' />
            <h4>${item.brand} ${item.model}</h4>
            <p>${item.description || 'Sin descripción'}</p>
          </div>`
        )
        .join('');
    } catch (err) {
      console.error('Error en búsqueda:', err.message);
      resultsContainer.innerHTML = '<p style="color:red">Error al cargar los resultados.</p>';
    }
  }

  brandSelect.addEventListener('change', (e) => loadModels(e.target.value));
  searchButton.addEventListener('click', searchKeys);

  loadBrands();
}
