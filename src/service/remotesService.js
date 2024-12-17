import { supabase } from '../config/supabase';

export const remotesService = {
  async getAllRemotes() {
    const { data, error } = await supabase
      .from('remotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getRemotesByBrand(brand) {
    const { data, error } = await supabase
      .from('remotes')
      .select('*')
      .eq('brand', brand)
      .order('model', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getRemotesByModel(brand, model) {
    const { data, error } = await supabase
      .from('remotes')
      .select('*')
      .eq('brand', brand)
      .eq('model', model);

    if (error) throw error;
    return data;
  },

  async searchRemotes(searchTerm) {
    const { data, error } = await supabase
      .from('remotes')
      .select('*')
      .or(`brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`);

    if (error) throw error;
    return data;
  }
};