import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://ebezqrsgednjwhajddqu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXpxcnNnZWRuandoYWpkZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTEyNzYsImV4cCI6MjA1MDAyNzI3Nn0.6UpoIFJuEGDnLlD3_8w-fyQ2qMZ7uNDUttk-4Aeavgw'
);

const TABLE_NAME = 'videos_gifs';

const container = typeof document !== 'undefined'
  ? document.getElementById('videos-container')
  : null;

const fallbackMessage = typeof document !== 'undefined'
  ? document.getElementById('videosFallback')
  : null;

const cards = container
  ? Array.from(container.querySelectorAll('.videos-stack-card'))
  : [];

const videoElements = cards
  .map((card) => card.querySelector('video'))
  .filter(Boolean);

const defaultSources = videoElements.map((video) => {
  const source = video.getAttribute('src') || '';
  video.dataset.defaultSrc = source;
  ensurePlaybackAttributes(video);
  return source;
});

function ensurePlaybackAttributes(video) {
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('autoplay', '');
  video.setAttribute('loop', '');
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
}

function sanitiseUrl(url) {
  if (!url || typeof window === 'undefined') {
    return null;
  }

  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch (error) {
    console.error('URL de video inválida recibida desde Supabase:', url, error);
  }

  return null;
}

function toggleFallback(showFallback) {
  if (!container || !fallbackMessage) {
    return;
  }

  fallbackMessage.hidden = !showFallback;
  container.classList.toggle('is-hidden', showFallback);

  if (showFallback) {
    videoElements.forEach((video, index) => {
      const fallbackSrc = defaultSources[index];
      if (fallbackSrc) {
        video.src = fallbackSrc;
      }
    });
  }
}

function createCard(url) {
  const card = document.createElement('article');
  card.className = 'videos-stack-card';

  const video = document.createElement('video');
  video.className = 'video-item';
  video.src = url;
  ensurePlaybackAttributes(video);

  card.appendChild(video);
  return { card, video };
}

async function loadVideos() {
  if (!container || videoElements.length === 0) {
    return;
  }

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('video_url')
      .order('order_index', { ascending: true });

    if (error) {
      throw error;
    }

    console.log('✅ Supabase conectado correctamente');

    if (!data || data.length === 0) {
      toggleFallback(true);
      return;
    }

    let applied = 0;

    data.forEach((item) => {
      const cleanUrl = sanitiseUrl(item?.video_url);
      if (!cleanUrl) {
        return;
      }

      let targetVideo = videoElements[applied];

      if (!targetVideo) {
        const { card, video } = createCard(cleanUrl);
        container.appendChild(card);
        videoElements.push(video);
        defaultSources.push(cleanUrl);
        targetVideo = video;
      }

      if (targetVideo.getAttribute('src') !== cleanUrl) {
        targetVideo.src = cleanUrl;
        targetVideo.load();
      }

      applied += 1;
    });

    if (applied === 0) {
      toggleFallback(true);
      return;
    }

    toggleFallback(false);
  } catch (error) {
    console.error('Error al cargar videos desde Supabase:', error);
    toggleFallback(true);
  }
}

loadVideos();
