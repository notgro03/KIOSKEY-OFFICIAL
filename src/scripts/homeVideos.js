import { supabase } from '../config/supabase.js';

const MOBILE_BREAKPOINT = 768;
const SLIDE_INTERVAL = 4000;

let sliderInterval = null;
let activeWrappers = [];
let resizeTimeoutId = null;

function sanitizeUrl(url) {
  return typeof url === 'string'
    ? url.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
    : '';
}

function sanitizeText(text) {
  return typeof text === 'string'
    ? text.replace(/[<>"]/g, char => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]))
    : '';
}

function teardownSlider() {
  if (sliderInterval) {
    clearInterval(sliderInterval);
    sliderInterval = null;
  }
  activeWrappers.forEach(wrapper => {
    wrapper.style.transform = 'translateX(0)';
  });
}

function setupMobileSlider(wrappers) {
  teardownSlider();

  if (wrappers.length <= 1 || window.innerWidth >= MOBILE_BREAKPOINT) {
    return;
  }

  activeWrappers = wrappers;

  wrappers.forEach((wrapper, index) => {
    wrapper.style.transform = `translateX(${index * 100}%)`;
  });

  let currentIndex = 0;

  sliderInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % wrappers.length;
    wrappers.forEach((wrapper, index) => {
      wrapper.style.transform = `translateX(${(index - currentIndex) * 100}%)`;
    });
  }, SLIDE_INTERVAL);
}

function handleResize() {
  if (!activeWrappers.length) return;

  if (resizeTimeoutId) {
    clearTimeout(resizeTimeoutId);
  }

  resizeTimeoutId = setTimeout(() => {
    setupMobileSlider(activeWrappers);
  }, 200);
}

async function loadVideos() {
  const container = document.getElementById('home-videos');
  if (!container) return;

  container.innerHTML = `
    <div class="videos-loading">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Cargando videos...</span>
    </div>
  `;

  const { data, error } = await supabase
    .from('videos_gifs')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error cargando videos:', error);
    container.innerHTML = '';
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = data.map((video, index) => {
    const videoUrl = sanitizeUrl(video?.video_url ?? '');
    const title = sanitizeText(video?.title || `Video ${index + 1}`);
    const overlayText = sanitizeText(video?.overlay_text || 'Guardá tus llaves en la nube');
    return `
      <div class="video-wrapper" aria-label="${title}">
        <video src="${videoUrl}" autoplay loop muted playsinline preload="metadata" class="video-card"></video>
        <div class="overlay">
          <img src="/LOGO_KIOSKEYS.png" alt="KiosKeys" class="overlay-logo" loading="lazy">
          <p class="overlay-text">${overlayText}</p>
        </div>
      </div>
    `;
  }).join('');

  const wrappers = Array.from(container.querySelectorAll('.video-wrapper'));
  activeWrappers = wrappers;

  setupMobileSlider(wrappers);
}

document.addEventListener('DOMContentLoaded', () => {
  loadVideos();
  window.addEventListener('resize', handleResize, { passive: true });
});
