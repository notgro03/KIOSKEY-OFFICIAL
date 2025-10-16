import { supabase } from '../config/supabase.js';

export async function fetchCategoryProducts(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error(`Error cargando datos desde ${tableName}:`, error);
    return [];
  }

  return data ?? [];
}
