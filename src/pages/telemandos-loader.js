import { supabase } from '../config/supabase.js';

export async function loadTelemandos() {
  const brandSelect = document.getElementById('brandSelect');
  const modelSelect = document.getElementById('modelSelect');

  // Cargar marcas
  const { data: telemandos, error } = await supabase.from('telemandos').select('brand, model');
  if (error) {
    console.error('Error al conectar con Supabase:', error);
    return;
  }

  // Extraer marcas únicas
  const brands = [...new Set(telemandos.map(item => item.brand).filter(Boolean))];
  brandSelect.innerHTML = '<option value="">Seleccionar marca</option>' + brands.map(b => `<option value="${b}">${b}</option>`).join('');

  // Cargar modelos al seleccionar marca
  brandSelect.addEventListener('change', (e) => {
    const selectedBrand = e.target.value;
    const filteredModels = telemandos.filter(t => t.brand === selectedBrand);
    const models = [...new Set(filteredModels.map(t => t.model).filter(Boolean))];
    modelSelect.innerHTML = '<option value="">Seleccionar modelo</option>' + models.map(m => `<option value="${m}">${m}</option>`).join('');
  });
}

loadTelemandos();
