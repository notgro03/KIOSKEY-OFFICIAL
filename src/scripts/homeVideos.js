import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://ebezqrsgednjwhajddqu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXpxcnNnZWRuandoYWpkZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTEyNzYsImV4cCI6MjA1MDAyNzI3Nn0.6UpoIFJuEGDnLlD3_8w-fyQ2qMZ7uNDUttk-4Aeavgw'
);

async function loadVideos() {
  const { data, error } = await supabase.from('videos gifs').select('*').order('order_index', { ascending: true });
  if (error) {
    console.error('Error al cargar videos:', error);
    return;
  }

  const container = document.getElementById('videos-container');
  if (!container) return;

  container.innerHTML = data.map(video => `
    <div class='video-wrapper'>
      <video src='${video.video_url}' autoplay loop muted playsinline class='video-item'></video>
    </div>
  `).join('');
}

loadVideos();
