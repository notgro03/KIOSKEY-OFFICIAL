import { supabase } from '../config/supabase.js';

const CATEGORY_TABLE = 'product_categories';
const PRODUCTS_TABLE = 'products';

const categoryCache = new Map();

async function resolveCategoryId(slug) {
  if (categoryCache.has(slug)) {
    return categoryCache.get(slug);
  }

  const { data, error } = await supabase
    .from(CATEGORY_TABLE)
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar la categoría "${slug}": ${error.message}`);
  }

  const categoryId = data?.id ?? null;

  if (categoryId) {
    categoryCache.set(slug, categoryId);
  }

  return categoryId;
}

export async function fetchCategoryProducts(slug) {
  const categoryId = await resolveCategoryId(slug);

  if (!categoryId) {
    return [];
  }

  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    throw new Error(`No se pudieron cargar los productos de "${slug}": ${error.message}`);
  }

  return data ?? [];
}

export async function fetchTableProducts(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('active', true)
    .order('order_index', { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar los datos de "${tableName}": ${error.message}`);
  }

  return data ?? [];
}
