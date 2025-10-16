import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://ebezqrsgednjwhajddqu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXpxcnNnZWRuandoYWpkZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTEyNzYsImV4cCI6MjA1MDAyNzI3Nn0.6UpoIFJuEGDnLlD3_8w-fyQ2qMZ7uNDUttk-4Aeavgw'
);

const FALLBACK_TABLES = ['videos gifs', 'videos_gifs'];

async function fetchVideos() {
  for (const table of FALLBACK_TABLES) {
    const response = await supabase
      .from(table)
      .select('*')
      .order('order_index', { ascending: true });

    if (!response.error && Array.isArray(response.data) && response.data.length) {
      return response.data;
    }

    if (response.error && response.error.code !== 'PGRST116') {
      console.error(`Error al cargar videos desde ${table}:`, response.error);
    }
  }

  return null;
}

async function loadVideos() {
  const container = document.getElementById('videos-container');
  if (!container) return;

  container.innerHTML = `
    <div class="videos-loading">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>Cargando videos...</span>
    </div>
  `;

  const videos = await fetchVideos();

  if (!videos) {
    container.innerHTML = `
      <div class="videos-error">No fue posible cargar los videos en este momento.</div>
    `;
    return;
  }

  container.innerHTML = videos
    .map((video) => `
      <div class='video-wrapper'>
        <video src='${video.video_url}' autoplay loop muted playsinline class='video-card'></video>
      </div>
    `)
    .join('');

  if (window.innerWidth < 768) {
    const wrappers = Array.from(container.querySelectorAll('.video-wrapper'));
    if (wrappers.length > 1) {
      let index = 0;

      wrappers.forEach((wrapper, i) => {
        wrapper.style.transform = `translateX(${i * 100}%)`;
      });

      setInterval(() => {
        index = (index + 1) % wrappers.length;
        wrappers.forEach((wrapper, i) => {
          wrapper.style.transform = `translateX(${(i - index) * 100}%)`;
        });
      }, 4500);
    }
  }
}

loadVideos();
