import { bannerAPI } from '../db.js';

const MOBILE_BREAKPOINT = 768;

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

function renderVideoCards(container, videos) {
  const cards = videos.map((video, index) => {
    const rawTitle = typeof video.title === 'string' || typeof video.title === 'number'
      ? String(video.title)
      : '';
    const safeTitle = rawTitle
      ? escapeHtml(rawTitle)
      : 'Video de KiosKeys';
    const tilt = index % 3 === 1 ? 0 : (index % 2 === 0 ? -8 : 8);
    const delay = Math.min(index * 0.12, 0.48).toFixed(2);
    const source = typeof video.video_url === 'string'
      ? escapeHtml(video.video_url)
      : '';

    return `
      <article class="video-gallery-card" data-video-id="${video.id}" style="--tilt:${tilt}deg; --caption-delay:${delay}s;">
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
  });

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

    if (!container.hasAttribute('data-carousel-bound')) {
      applyMobileCarousel(container);
      container.setAttribute('data-carousel-bound', 'true');
    }

    const videos = await bannerAPI.getVideos();
    const playableVideos = Array.isArray(videos)
      ? videos.filter((video) => typeof video?.video_url === 'string' && video.video_url.trim().length > 0)
      : [];

    if (!playableVideos.length) {
      container.innerHTML = '';
      return;
    }

    renderVideoCards(container, playableVideos);

    const videosEls = Array.from(container.querySelectorAll('article video'));
    videosEls.forEach(ensureAutoplay);
  } catch (error) {
    const container = document.querySelector('.videos-grid');
    if (container) {
      container.innerHTML = '';
    }
    console.error('Error loading videos:', error);
  }
}
