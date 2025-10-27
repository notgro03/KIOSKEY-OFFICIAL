import { supabase } from './config/supabase.js';

// Products API
export const productsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getByType(type) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('type', type)
      .eq('active', true);
    
    if (error) throw error;
    return data;
  },

  async getByBrand(brandId) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('brand_id', brandId)
      .eq('active', true);
    
    if (error) throw error;
    return data;
  },

  async add(product) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, product) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Banner Videos API
export const bannerAPI = {
  async getVideos() {
    const { data, error } = await supabase
      .from('videos_gifs')
      .select('id, video_url, order_index')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data;
  },

  async updateVideo(id, video) {
    const { data, error } = await supabase
      .from('videos_gifs')
      .update(video)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addVideo(video) {
    const { data, error } = await supabase
      .from('videos_gifs')
      .insert([video])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};