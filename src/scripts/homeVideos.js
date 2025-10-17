import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://ebezqrsgednjwhajddqu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXpxcnNnZWRuandoYWpkZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTEyNzYsImV4cCI6MjA1MDAyNzI3Nn0.6UpoIFJuEGDnLlD3_8w-fyQ2qMZ7uNDUttk-4Aeavgw'
);

const TABLE_CANDIDATES = ['videos gifs', 'videos_gifs'];

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

videoElements.forEach((video) => {
  ensurePlaybackAttributes(video);
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
  if (!fallbackMessage) {
    return;
  }

  fallbackMessage.hidden = !showFallback;
}

function ensurePlaceholder(card, message) {
  if (!card) {
    return;
  }

  const video = card.querySelector('video');
  if (video) {
    video.pause();
    video.removeAttribute('src');
    if (typeof video.load === 'function') {
      video.load();
    }
    video.style.display = 'none';
  }

  let placeholder = card.querySelector('.videos-stack-card__placeholder');
  if (!placeholder) {
    placeholder = document.createElement('div');
    placeholder.className = 'videos-stack-card__placeholder';
    placeholder.style.display = 'flex';
    placeholder.style.alignItems = 'center';
    placeholder.style.justifyContent = 'center';
    placeholder.style.height = '100%';
    placeholder.style.minHeight = '180px';
    placeholder.style.color = 'rgba(255, 255, 255, 0.8)';
    placeholder.style.fontWeight = '600';
    placeholder.style.letterSpacing = '0.4px';
    placeholder.style.textTransform = 'uppercase';
    placeholder.style.background = 'linear-gradient(160deg, rgba(0, 30, 60, 0.65), rgba(0, 10, 20, 0.85))';
  }

  placeholder.textContent = message;
  if (!placeholder.parentElement) {
    card.appendChild(placeholder);
  }
}

function clearPlaceholder(card) {
  if (!card) {
    return;
  }

  const placeholder = card.querySelector('.videos-stack-card__placeholder');
  if (placeholder) {
    placeholder.remove();
  }

  const video = card.querySelector('video');
  if (video) {
    video.style.display = '';
  }
}

async function querySupabase() {
  let lastError = null;

  for (const tableName of TABLE_CANDIDATES) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('video_url, title')
        .order('order_index', { ascending: true });

      if (error) {
        lastError = error;
        continue;
      }

      return data || [];
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return [];
}

function applyVideo(card, video, url) {
  if (!video || !url) {
    return;
  }

  clearPlaceholder(card);
  const currentSrc = video.getAttribute('src');
  if (currentSrc !== url) {
    video.src = url;
    if (typeof video.load === 'function') {
      video.load();
    }
  }
  ensurePlaybackAttributes(video);
}

async function loadVideos() {
  if (!container || videoElements.length === 0) {
    return;
  }

  try {
    const data = await querySupabase();

    if (!Array.isArray(data) || data.length === 0) {
      videoElements.forEach((video, index) => {
        ensurePlaceholder(cards[index], 'Video no disponible');
      });
      toggleFallback(true);
      return;
    }

    let applied = 0;

    data.forEach((item) => {
      const cleanUrl = sanitiseUrl(item?.video_url);
      if (!cleanUrl) {
        return;
      }

      const targetVideo = videoElements[applied];
      const targetCard = cards[applied];

      if (targetVideo && targetCard) {
        applyVideo(targetCard, targetVideo, cleanUrl);
        applied += 1;
      }
    });

    if (applied === 0) {
      videoElements.forEach((_, index) => {
        ensurePlaceholder(cards[index], 'Video no disponible');
      });
      toggleFallback(true);
      return;
    }

    videoElements.forEach((video, index) => {
      if (index >= applied) {
        ensurePlaceholder(cards[index], 'Video no disponible');
      }
    });

    console.log('✅ Supabase conectado correctamente');
    toggleFallback(false);
  } catch (error) {
    console.error('Error al cargar videos desde Supabase:', error);
    videoElements.forEach((_, index) => {
      ensurePlaceholder(cards[index], 'Video no disponible');
    });
    toggleFallback(true);
  }
}

loadVideos();
