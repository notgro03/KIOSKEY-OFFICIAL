import { bannerAPI } from '../db.js';

const MOBILE_BREAKPOINT = 768;
const PLACEHOLDER_COUNT = 3;
const PLACEHOLDER_TITLES = [
  'Video próximamente',
  'Contenido en preparación',
  'Galería en actualización'
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

function createPlaceholderCard(index) {
  const title = PLACEHOLDER_TITLES[index % PLACEHOLDER_TITLES.length];

  return `
    <article class="video-gallery-card video-placeholder" data-placeholder-index="${index}">
      <div class="video-placeholder-media" aria-hidden="true"></div>
      <p class="video-caption">${escapeHtml(title)}</p>
    </article>
  `;
}

function renderPlaceholders(container, count = PLACEHOLDER_COUNT) {
  container.innerHTML = Array.from({ length: count }, (_, index) => createPlaceholderCard(index)).join('');
}

function renderVideoCards(container, videos) {
  const cards = videos.map((video) => {
    const rawTitle = typeof video.title === 'string' || typeof video.title === 'number'
      ? String(video.title)
      : '';
    const safeTitle = rawTitle
      ? escapeHtml(rawTitle)
      : 'Video de KiosKeys';

    return `
      <article class="video-gallery-card" data-video-id="${video.id}">
        <video
          src="${video.video_url}"
          autoplay
          loop
          muted
          playsinline
          preload="auto"
          title="${safeTitle}"
        ></video>
        <p class="video-caption">${safeTitle}</p>
      </article>
    `;
  });

  const placeholdersNeeded = Math.max(PLACEHOLDER_COUNT - cards.length, 0);
  for (let i = 0; i < placeholdersNeeded; i += 1) {
    cards.push(createPlaceholderCard(cards.length + i));
  }

  container.innerHTML = cards.join('');
}

export async function initBannerVideos() {
  try {
    const section = document.querySelector('.video-gallery-section');
    const container = document.querySelector('.videos-grid');

    if (!section || !container) {
      return;
    }

    section.classList.remove('is-hidden');
    renderPlaceholders(container);

    if (!container.hasAttribute('data-carousel-bound')) {
      applyMobileCarousel(container);
      container.setAttribute('data-carousel-bound', 'true');
    }

    const videos = await bannerAPI.getVideos();
    const playableVideos = Array.isArray(videos)
      ? videos.filter((video) => Boolean(video?.video_url))
      : [];

    if (!playableVideos.length) {
      renderPlaceholders(container);
      return;
    }

    renderVideoCards(container, playableVideos);

    const videosEls = Array.from(container.querySelectorAll('article:not(.video-placeholder) video'));
    videosEls.forEach(ensureAutoplay);
  } catch (error) {
    const container = document.querySelector('.videos-grid');
    if (container) {
      renderPlaceholders(container);
    }
    console.error('Error loading videos:', error);
  }
}
