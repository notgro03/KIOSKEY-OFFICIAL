import { supabase } from '../config/supabase.js';

async function loadVideos() {
  const { data, error } = await supabase.from('videos gifs').select('*').order('order_index', { ascending: true });
  if (error) {
    console.error('Error cargando videos:', error);
    return;
  }

  const container = document.getElementById('home-videos');
  if (!container) return;
  container.innerHTML = data.map(video => `
    <video src='${video.video_url}' autoplay loop muted playsinline class='video-card'></video>
  `).join('');
}

loadVideos();
