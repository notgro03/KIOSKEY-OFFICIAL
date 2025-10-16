import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://ebezqrsgednjwhajddqu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZXpxcnNnZWRuandoYWpkZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTEyNzYsImV4cCI6MjA1MDAyNzI3Nn0.6UpoIFJuEGDnLlD3_8w-fyQ2qMZ7uNDUttk-4Aeavgw'
);

const TABLE_NAME = 'videos_gifs';
let sliderIntervalId = null;

const container = typeof document !== 'undefined'
  ? document.getElementById('videos-container')
  : null;

const wrappers = container
  ? Array.from(container.querySelectorAll('.video-wrapper'))
  : [];

const videoElements = wrappers
  .map((wrapper) => wrapper.querySelector('video'))
  .filter((video) => video);

const fallbackSources = videoElements.map((video) => video.getAttribute('src') || '');

function sanitiseUrl(url) {
  if (!url || typeof window === 'undefined') return null;

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

async function fetchSupabaseSources() {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('video_url')
      .order('order_index', { ascending: true });

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error al cargar videos desde Supabase:', error);
      }
      return null;
    }

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const sources = data
      .map((item) => sanitiseUrl(item.video_url))
      .filter((source) => Boolean(source));

    return sources.length ? sources : null;
  } catch (error) {
    console.error('Error inesperado al consultar Supabase:', error);
    return null;
  }
}

function applyVideoSources(sources) {
  sources.forEach((source, index) => {
    const video = videoElements[index];
    if (!video || !source) return;

    if (video.src !== source) {
      video.src = source;
    }

    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
  });
}

function startMobileSlider() {
  if (typeof window === 'undefined') return;

  if (sliderIntervalId) {
    clearInterval(sliderIntervalId);
    sliderIntervalId = null;
  }

  if (window.innerWidth >= 768 || wrappers.length <= 1) {
    wrappers.forEach((wrapper) => {
      wrapper.style.transform = '';
    });
    return;
  }

  wrappers.forEach((wrapper, index) => {
    wrapper.style.transform = `translateX(${index * 100}%)`;
    wrapper.style.transition = 'transform 0.8s ease';
  });

  let currentIndex = 0;
  sliderIntervalId = window.setInterval(() => {
    currentIndex = (currentIndex + 1) % wrappers.length;
    wrappers.forEach((wrapper, index) => {
      wrapper.style.transform = `translateX(${(index - currentIndex) * 100}%)`;
    });
  }, 4500);
}

async function initialiseVideos() {
  if (!container || videoElements.length === 0) {
    return;
  }

  const supabaseSources = await fetchSupabaseSources();

  if (supabaseSources) {
    applyVideoSources(supabaseSources);
  } else if (fallbackSources.length) {
    applyVideoSources(fallbackSources);
  }

  startMobileSlider();
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', startMobileSlider);
  }
}

initialiseVideos();
