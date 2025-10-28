import { bannerAPI } from '../db.js';

const MOBILE_BREAKPOINT = 768;
const VIDEO_LIMIT = 3;

const FALLBACK_VIDEOS = [
  {
    id: 'fallback-demo-1',
    video_url: '/videos/demo1.mp4',
    order_index: 1
  },
  {
    id: 'fallback-demo-2',
    video_url: '/videos/demo2.mp4',
    order_index: 2
  },
  {
    id: 'fallback-demo-3',
    video_url: '/videos/demo3.mp4',
    order_index: 3
  }
];

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

function normalizeVideoList(videos) {
  if (!Array.isArray(videos)) {
    return [];
  }

  return videos
    .map((video, index) => {
      if (typeof video?.video_url !== 'string') {
        return null;
      }

      const trimmedUrl = video.video_url.trim();
      if (!trimmedUrl) {
        return null;
      }

      return {
        id: video.id ?? `video-${index}`,
        video_url: trimmedUrl,
        order_index: typeof video.order_index === 'number' ? video.order_index : index
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.order_index - b.order_index);
}

function buildVideoQueue(remoteVideos) {
  const normalizedRemote = normalizeVideoList(remoteVideos).map((video) => ({
    ...video,
    __fallback: false
  }));

  const queue = normalizedRemote.slice(0, VIDEO_LIMIT);

  const usedUrls = new Set(queue.map((video) => video.video_url));
  const fallbackList = normalizeVideoList(FALLBACK_VIDEOS).map((video) => ({
    ...video,
    __fallback: true
  }));

  fallbackList.forEach((fallback) => {
    if (queue.length >= VIDEO_LIMIT) {
      return;
    }

    if (!usedUrls.has(fallback.video_url)) {
      queue.push(fallback);
      usedUrls.add(fallback.video_url);
    }
  });

  if (queue.length === 0) {
    return fallbackList.slice(0, VIDEO_LIMIT);
  }

  return queue.slice(0, VIDEO_LIMIT);
}

function renderVideoCards(grid, videos) {
  grid.innerHTML = '';

  const playableVideos = Array.isArray(videos) ? videos.slice(0, VIDEO_LIMIT) : [];
  const videoElements = [];

  const shouldApplyInteractiveTilt =
    typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  playableVideos.forEach((video, index) => {
    const card = document.createElement('article');
    card.className = 'video-gallery-card';
    card.dataset.source = video.__fallback ? 'fallback' : 'remote';

    const tilt = index % 3 === 1 ? 0 : index % 2 === 0 ? -6 : 6;
    const floatDelay = Math.min(index * 0.35, 1).toFixed(2);

    card.style.setProperty('--tilt', `${tilt}deg`);
    card.style.setProperty('--float-delay', `${floatDelay}s`);
    card.style.setProperty('--hover-scale', '1');
    card.style.setProperty('--hover-glow', '0.45');
    card.style.setProperty('--hover-rot-x', '0deg');
    card.style.setProperty('--hover-rot-y', '0deg');
    card.style.setProperty('--hover-translate', '0px');

    const frame = document.createElement('div');
    frame.className = 'video-frame';

    const videoEl = document.createElement('video');
    videoEl.src = video.video_url;
    videoEl.autoplay = true;
    videoEl.loop = true;
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.preload = 'auto';
    videoEl.setAttribute('muted', '');
    videoEl.setAttribute('playsinline', '');

    frame.appendChild(videoEl);
    card.appendChild(frame);
    grid.appendChild(card);

    if (shouldApplyInteractiveTilt) {
      bindParallaxHover(card);
    }

    videoElements.push(videoEl);
  });

  return videoElements;
}

export async function initBannerVideos() {
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

  const fallbackQueue = buildVideoQueue();
  const initialVideos = renderVideoCards(grid, fallbackQueue);
  initialVideos.forEach(ensureAutoplay);

  try {
    const videos = await bannerAPI.getVideos();
    const remoteQueue = buildVideoQueue(videos);
    const hasRemoteSource = remoteQueue.some((video) => !video.__fallback);

    if (hasRemoteSource) {
      const remoteVideoEls = renderVideoCards(grid, remoteQueue);
      remoteVideoEls.forEach(ensureAutoplay);
    }
  } catch (error) {
    console.error('Error loading videos:', error);
  }
}

function bindParallaxHover(card) {
  const smoothing = 0.15;
  const maxRotate = 10;
  const maxTiltX = 6;
  let animationFrame = null;
  let targetRotateX = 0;
  let targetRotateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;

  const applyTilt = () => {
    currentRotateX += (targetRotateX - currentRotateX) * smoothing;
    currentRotateY += (targetRotateY - currentRotateY) * smoothing;

    card.style.setProperty('--hover-rot-x', `${currentRotateX.toFixed(2)}deg`);
    card.style.setProperty('--hover-rot-y', `${currentRotateY.toFixed(2)}deg`);
    card.style.setProperty('--hover-translate', `${(-Math.abs(currentRotateY) - Math.abs(currentRotateX)) * 0.6}px`);

    const intensity = 0.45 + Math.min(0.35, (Math.abs(currentRotateY) + Math.abs(currentRotateX)) / (maxRotate + maxTiltX));
    card.style.setProperty('--hover-glow', intensity.toFixed(2));

    if (Math.abs(currentRotateX - targetRotateX) > 0.01 || Math.abs(currentRotateY - targetRotateY) > 0.01) {
      animationFrame = requestAnimationFrame(applyTilt);
    } else {
      animationFrame = null;
    }
  };

  const updateTarget = (event) => {
    const rect = card.getBoundingClientRect();
    const percentX = (event.clientX - rect.left) / rect.width;
    const percentY = (event.clientY - rect.top) / rect.height;

    targetRotateY = (percentX - 0.5) * (maxRotate * 2);
    targetRotateX = (0.5 - percentY) * (maxTiltX * 2);

    if (!animationFrame) {
      animationFrame = requestAnimationFrame(applyTilt);
    }
  };

  const resetTilt = () => {
    targetRotateX = 0;
    targetRotateY = 0;
    if (!animationFrame) {
      animationFrame = requestAnimationFrame(applyTilt);
    }
  };

  const handlePointerEnter = () => {
    card.classList.add('is-interacting');
    card.style.setProperty('--hover-scale', '1.03');
  };

  const handlePointerLeave = () => {
    card.classList.remove('is-interacting');
    card.style.setProperty('--hover-scale', '1');
    resetTilt();
  };

  card.addEventListener('pointermove', updateTarget);
  card.addEventListener('pointerenter', handlePointerEnter);
  card.addEventListener('pointerleave', handlePointerLeave);

  card.addEventListener('touchstart', handlePointerEnter, { passive: true });
  card.addEventListener('touchend', handlePointerLeave, { passive: true });
  card.addEventListener('touchcancel', handlePointerLeave, { passive: true });
}
