import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebezqrsgednjwhajddqu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXpxcnNnZWRuandoYWpkZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTEyNzYsImV4cCI6MjA1MDAyNzI3Nn0.6UpoIFJuEGDnLlD3_8w-fyQ2qMZ7uNDUttk-4Aeavgw';
const supabase = createClient(supabaseUrl, supabaseKey);

const container = document.getElementById('videosContainer');
const FALLBACK_MESSAGE = 'No fue posible cargar los videos en este momento.';

function renderBoxes(content = []) {
  if (!container) {
    return;
  }

  container.innerHTML = '';

  const boxes = content.slice(0, 3);
  while (boxes.length < 3) {
    boxes.push({ type: 'placeholder', text: 'Video no disponible' });
  }

  boxes.forEach((item) => {
    const box = document.createElement('div');
    box.classList.add('video-box');

    if (item.type === 'video' && item.url) {
      const video = document.createElement('video');
      video.src = item.url;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('autoplay', '');
      video.setAttribute('loop', '');
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.onerror = () => {
        box.innerHTML = '<p>Video no disponible</p>';
      };
      box.appendChild(video);
    } else {
      const message = document.createElement('p');
      message.textContent = item.text || 'Video no disponible';
      box.appendChild(message);
    }

    container.appendChild(box);
  });
}

function renderError() {
  renderBoxes([{ type: 'placeholder', text: 'Video no disponible' }]);

  const fallback = document.createElement('p');
  fallback.style.textAlign = 'center';
  fallback.style.color = '#888';
  fallback.textContent = FALLBACK_MESSAGE;
  container.appendChild(fallback);
}

function sanitiseUrl(url) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch (error) {
    console.warn('URL de video inválida recibida desde Supabase:', url, error);
  }

  return null;
}

async function loadVideos() {
  if (!container) {
    return;
  }

  renderBoxes([
    { type: 'placeholder', text: 'Cargando…' },
    { type: 'placeholder', text: 'Cargando…' },
    { type: 'placeholder', text: 'Cargando…' },
  ]);

  try {
    const tableCandidates = ['videos gifs', 'videos_gifs'];
    let response = { data: null, error: null };

    for (const table of tableCandidates) {
      response = await supabase
        .from(table)
        .select('title, video_url, order_index')
        .order('order_index', { ascending: true });

      if (response.error) {
        console.warn(`⚠️ Error al consultar "${table}":`, response.error.message);
        continue;
      }

      if (Array.isArray(response.data) && response.data.length > 0) {
        break;
      }
    }

    if (response.error) {
      throw response.error;
    }

    const { data } = response;

    if (!Array.isArray(data) || data.length === 0) {
      renderError();
      return;
    }

    console.log('✅ Videos obtenidos:', data);

    const items = data
      .map((video) => ({
        type: 'video',
        url: sanitiseUrl(video.video_url),
      }))
      .filter((item) => Boolean(item.url));

    if (items.length === 0) {
      renderError();
      return;
    }

    renderBoxes(items);
  } catch (err) {
    console.error('❌ Error al cargar videos:', err.message);
    renderError();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadVideos);
} else {
  loadVideos();
}
