import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebezqrsgednjwhajddqu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXpxcnNnZWRuandoYWpkZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTEyNzYsImV4cCI6MjA1MDAyNzI3Nn0.6UpoIFJuEGDnLlD3_8w-fyQ2qMZ7uNDUttk-4Aeavgw';
const supabase = createClient(supabaseUrl, supabaseKey);

const container = document.getElementById('videosContainer');
const LOADING_TEXT = 'Cargando video...';
const FALLBACK_TEXT = 'Video no disponible';

function normaliseUrl(url) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url, window.location.href);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch (error) {
    console.warn('URL de video inválida recibida desde Supabase:', url, error);
  }

  return null;
}

function createMessageBox(message) {
  const box = document.createElement('div');
  box.classList.add('video-box');
  const text = document.createElement('p');
  text.textContent = message;
  box.appendChild(text);
  return box;
}

function createVideoBox(url) {
  if (!url) {
    return createMessageBox(FALLBACK_TEXT);
  }

  const box = document.createElement('div');
  box.classList.add('video-box');

  const video = document.createElement('video');
  video.src = url;
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('autoplay', '');
  video.setAttribute('loop', '');
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.onerror = () => {
    box.innerHTML = '';
    const fallback = document.createElement('p');
    fallback.textContent = FALLBACK_TEXT;
    box.appendChild(fallback);
  };

  box.appendChild(video);
  return box;
}

function renderLoading() {
  if (!container) {
    return;
  }

  container.innerHTML = '';
  for (let i = 0; i < 3; i += 1) {
    container.appendChild(createMessageBox(LOADING_TEXT));
  }
}

function renderPlaceholders() {
  if (!container) {
    return;
  }

  container.innerHTML = '';
  for (let i = 0; i < 3; i += 1) {
    container.appendChild(createMessageBox(FALLBACK_TEXT));
  }
}

function renderVideos(items) {
  if (!container) {
    return;
  }

  container.innerHTML = '';

  const boxes = items.slice(0, 3).map((item) => {
    const videoUrl = normaliseUrl(item.video_url);
    return createVideoBox(videoUrl);
  });

  while (boxes.length < 3) {
    boxes.push(createMessageBox(FALLBACK_TEXT));
  }

  boxes.forEach((box) => container.appendChild(box));
}

async function loadVideos() {
  if (!container) {
    return;
  }

  renderLoading();

  try {
    const tableCandidates = ['videos gifs', 'videos_gifs'];
    let videos = null;

    for (const table of tableCandidates) {
      const { data, error } = await supabase
        .from(table)
        .select('title, video_url, order_index')
        .order('order_index', { ascending: true });

      if (error) {
        console.warn(`⚠️ Error al consultar "${table}":`, error.message);
        continue;
      }

      if (Array.isArray(data) && data.length > 0) {
        videos = data;
        break;
      }
    }

    if (!Array.isArray(videos) || videos.length === 0) {
      renderPlaceholders();
      return;
    }

    console.log('✅ Videos cargados correctamente:', videos);
    renderVideos(videos);
  } catch (error) {
    console.error('❌ Error al cargar videos:', error.message);
    renderPlaceholders();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadVideos);
} else {
  loadVideos();
}
