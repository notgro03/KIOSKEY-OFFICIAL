import { supabase } from './config/supabase.js';

async function loadBannerVideos() {
  try {
    const { data: videos, error } = await supabase
      .from('banner_gifs')
      .select('*')
      .eq('active', true)
      .order('order_position')
      .limit(3);

    if (error) {
      console.error('Error loading banner videos:', error);
      return;
    }

    if (!videos || videos.length === 0) {
      console.log('No videos found in database');
      return;
    }

    const container = document.getElementById('bannerVideos');
    if (!container) return;

    container.innerHTML = videos.map(video => {
      return `
        <div class="video-item">
          <img src="${video.url}" alt="${video.alt_text}" class="banner-gif">
        </div>
      `;
    }).join('');

    console.log(`Loaded ${videos.length} videos successfully`);
  } catch (err) {
    console.error('Error loading banner videos:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadBannerVideos);
} else {
  loadBannerVideos();
}
