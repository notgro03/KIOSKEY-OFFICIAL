import { bannerAPI } from '../db.js';

const MOBILE_BREAKPOINT = 768;
const PLACEHOLDER_COUNT = 3;

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

function buildVideoCardMarkup(video, index) {
  const floatDelay = Math.min(index * 0.35, 1.05).toFixed(2);
  const tilt = index % 3 === 1 ? 0 : (index % 2 === 0 ? -8 : 8);

  if (video && typeof video.video_url === 'string' && video.video_url.trim().length > 0) {
    const rawTitle = typeof video.title === 'string' || typeof video.title === 'number'
      ? String(video.title)
      : '';
    const safeTitle = rawTitle
      ? escapeHtml(rawTitle)
      : 'Video de KiosKeys';
    const source = escapeHtml(video.video_url.trim());
    const captionDelay = Math.min(index * 0.12, 0.48).toFixed(2);

    return `
      <article class="video-gallery-card" data-video-id="${video.id}" style="--tilt:${tilt}deg; --caption-delay:${captionDelay}s; --float-delay:${floatDelay}s;">
        <div class="video-frame">
          <video
            src="${source}"
            autoplay
            loop
            muted
            playsinline
            preload="auto"
            title="${safeTitle}"
          ></video>
        </div>
        <p class="video-caption">${safeTitle}</p>
      </article>
    `;
  }

  const safePlaceholderTitle = escapeHtml('Próximamente');
  return `
    <article class="video-gallery-card is-placeholder" style="--tilt:0deg; --caption-delay:0.2s; --float-delay:${floatDelay}s;">
      <div class="video-frame">
        <div class="video-placeholder" aria-hidden="true"></div>
      </div>
      <p class="video-caption">${safePlaceholderTitle}</p>
    </article>
  `;
}

function renderVideoCards(grid, videos) {
  const items = (Array.isArray(videos) && videos.length > 0
    ? videos
    : Array.from({ length: PLACEHOLDER_COUNT }, () => null)
  );

  const markup = items
    .slice(0, PLACEHOLDER_COUNT)
    .map((video, index) => buildVideoCardMarkup(video, index))
    .join('');

  grid.innerHTML = markup;
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
    const playableVideos = Array.isArray(videos)
      ? videos.filter((video) => typeof video?.video_url === 'string' && video.video_url.trim().length > 0)
        .slice(0, PLACEHOLDER_COUNT)
      : [];

    renderVideoCards(grid, playableVideos);

    const videosEls = Array.from(grid.querySelectorAll('article video'));
    videosEls.forEach(ensureAutoplay);
  } catch (error) {
    const section = document.querySelector('.video-gallery-section');
    const grid = section ? resolveGrid(section) : null;
    if (grid) {
      renderVideoCards(grid, []);
    }
    console.error('Error loading videos:', error);
  }
}
