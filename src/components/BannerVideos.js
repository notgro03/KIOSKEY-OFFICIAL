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

export async function initBannerVideos() {
  try {
    const section = document.querySelector('.video-gallery-section');
    const container = document.querySelector('.videos-grid');

    if (!section || !container) {
      return;
    }

    const videos = await bannerAPI.getVideos();
    const playableVideos = Array.isArray(videos)
      ? videos.filter((video) => Boolean(video?.video_url))
      : [];

    if (!playableVideos.length) {
      section.classList.add('is-hidden');
      container.innerHTML = '';
      return;
    }

    section.classList.remove('is-hidden');

    container.innerHTML = playableVideos.map((video) => {
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
    }).join('');

    const videosEls = Array.from(container.querySelectorAll('video'));
    videosEls.forEach(ensureAutoplay);

    if (videosEls.length > 1) {
      applyMobileCarousel(container);
    }
  } catch (error) {
    console.error('Error loading banner videos:', error);
  }
}
