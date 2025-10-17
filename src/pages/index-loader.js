import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebezqrsgednjwhajddqu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXpxcnNnZWRuandoYWpkZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTEyNzYsImV4cCI6MjA1MDAyNzI3Nn0.6UpoIFJuEGDnLlD3_8w-fyQ2qMZ7uNDUttk-4Aeavgw';

const supabase = createClient(supabaseUrl, supabaseKey);
const section = document.querySelector('.videos-section');
const PLACEHOLDER_TEXT = 'VIDEO NO DISPONIBLE';

function sanitiseVideoUrl(url) {
  if (!url) {
    return null;
  }

  try {
    const resolved = new URL(url, window.location.href);
    if (resolved.protocol === 'http:' || resolved.protocol === 'https:') {
      return resolved.href;
    }
  } catch (error) {
    console.warn('URL de video inválida recibida desde Supabase:', url, error);
  }

  return null;
}

function createPlaceholderCard(text = PLACEHOLDER_TEXT) {
  const card = document.createElement('div');
  card.classList.add('video-card');
  card.textContent = text;
  return card;
}

function createVideoCard(url) {
  if (!url) {
    return createPlaceholderCard();
  }

  const card = document.createElement('div');
  card.classList.add('video-card');

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
    card.replaceChildren();
    card.textContent = PLACEHOLDER_TEXT;
  };

  card.appendChild(video);
  return card;
}

function renderPlaceholders() {
  if (!section) {
    return;
  }

  section.innerHTML = '';
  for (let index = 0; index < 3; index += 1) {
    section.appendChild(createPlaceholderCard());
  }
}

async function loadVideos() {
  if (!section) {
    return;
  }

  try {
    const tableCandidates = ['videos gifs', 'videos_gifs'];
    let records = [];

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
        records = data;
        break;
      }
    }

    if (!records.length) {
      renderPlaceholders();
      return;
    }

    console.log('✅ Supabase conectado correctamente');

    section.innerHTML = '';
    records
      .slice(0, 3)
      .map((record) => sanitiseVideoUrl(record.video_url))
      .forEach((videoUrl) => {
        section.appendChild(createVideoCard(videoUrl));
      });

    while (section.children.length < 3) {
      section.appendChild(createPlaceholderCard());
    }
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
