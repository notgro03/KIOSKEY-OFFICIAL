import { bannerAPI } from '../db.js';

const MOBILE_BREAKPOINT = 768;
const VIDEO_LIMIT = 3;

function applyMobileCarousel(container) {
  const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

  const updateSnapPadding = () => {
    if (mq.matches) {
      container.scrollLeft = 0;
    }
  };

  updateSnapPadding();
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', updateSnapPadding);
  } else if (typeof mq.addListener === 'function') {
    mq.addListener(updateSnapPadding);
  }
}

function ensureAutoplay(videoEl) {
  videoEl.muted = true;
  videoEl.playsInline = true;

  if (typeof videoEl.play === 'function') {
    const playPromise = videoEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        videoEl.setAttribute('data-autoplay-pending', 'true');
      });
    }
  }
}

function resolveGrid(section) {
  const content = section.querySelector('.content-container');
  if (!content) {
    return null;
  }

  let grid = content.querySelector('.videos-grid');
  if (!grid) {
    grid = document.createElement('div');
    grid.className = 'videos-grid';
    content.appendChild(grid);
  }

  return grid;
}

function renderVideoCards(grid, videos) {
  grid.innerHTML = '';

  if (!Array.isArray(videos)) {
    return [];
  }

  const playableVideos = videos
    .filter((video) => typeof video?.video_url === 'string' && video.video_url.trim().length > 0)
    .slice(0, VIDEO_LIMIT);

  const videoElements = [];

  playableVideos.forEach((video, index) => {
    const card = document.createElement('article');
    card.className = 'video-gallery-card';

    const tilt = index % 3 === 1 ? 0 : (index % 2 === 0 ? -6 : 6);
    const floatDelay = Math.min(index * 0.35, 1).toFixed(2);

    card.style.setProperty('--tilt', `${tilt}deg`);
    card.style.setProperty('--float-delay', `${floatDelay}s`);

    const frame = document.createElement('div');
    frame.className = 'video-frame';

    const videoEl = document.createElement('video');
    videoEl.src = video.video_url.trim();
    videoEl.autoplay = true;
    videoEl.loop = true;
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.preload = 'auto';

    frame.appendChild(videoEl);
    card.appendChild(frame);
    grid.appendChild(card);

    videoElements.push(videoEl);
  });

  return videoElements;
}

export async function initBannerVideos() {
  try {
    const section = document.querySelector('.video-gallery-section');

    if (!section) {
      return;
    }

    const grid = resolveGrid(section);

    if (!grid) {
      return;
    }

    section.classList.remove('is-hidden');

    if (!grid.hasAttribute('data-carousel-bound')) {
      applyMobileCarousel(grid);
      grid.setAttribute('data-carousel-bound', 'true');
    }

    const videos = await bannerAPI.getVideos();
    const videoEls = renderVideoCards(grid, videos);

    videoEls.forEach(ensureAutoplay);
  } catch (error) {
    const section = document.querySelector('.video-gallery-section');
    const grid = section ? resolveGrid(section) : null;
    console.error('Error loading videos:', error);
  }
}
