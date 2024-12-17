import { supabase } from '../config/supabase';

export const keysService = {
  async getAllKeys() {
    const { data, error } = await supabase
      .from('keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getKeysByBrand(brand) {
    const { data, error } = await supabase
      .from('keys')
      .select('*')
      .eq('brand', brand)
      .order('model', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getKeysByModel(brand, model) {
    const { data, error } = await supabase
      .from('keys')
      .select('*')
      .eq('brand', brand)
      .eq('model', model);

    if (error) throw error;
    return data;
  },

  async searchKeys(searchTerm) {
    const { data, error } = await supabase
      .from('keys')
      .select('*')
      .or(`brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`);

    if (error) throw error;
    return data;
  }
};