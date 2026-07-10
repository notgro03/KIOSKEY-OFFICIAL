const MOBILE_BREAKPOINT = 768;
const VIDEO_LIMIT = 3;
const PLACEHOLDER_CARD_COUNT = 3;
const fallbackActionMedia = [
  {
    id: 'kioskeys-auto-start',
    video_url: 'https://files.catbox.moe/j8kr5j.mp4',
    title: 'Llave y encendido de auto',
    order_index: 0,
  },
  {
    id: 'kioskeys-auto-remote',
    video_url: 'https://files.catbox.moe/pr1ctf.mp4',
    title: 'Telemando de automovil',
    order_index: 1,
  },
  {
    id: 'kioskeys-roadside-assistance',
    video_url: 'https://files.catbox.moe/csy1m8.mp4',
    title: 'Asistencia para automovil',
    order_index: 2,
  },
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

function isValidVideoUrl(url) {
  if (typeof url !== 'string') {
    return false;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return true;
  }

  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://placeholder.local';
    const resolved = new URL(trimmed, base);
    return resolved.protocol === 'http:' || resolved.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

function normalizeVideoList(videos) {
  if (!Array.isArray(videos)) {
    return [];
  }

  return videos
    .map((video, index) => {
      const hasUrl = isValidVideoUrl(video?.video_url);

      return {
        id: video?.id ?? `video-${index}`,
        video_url: hasUrl ? video.video_url.trim() : null,
        image_url: typeof video?.image_url === 'string' ? video.image_url.trim() : '',
        order_index: typeof video?.order_index === 'number' ? video.order_index : index,
        isPlayable: hasUrl,
        title: typeof video?.title === 'string' ? video.title.trim() : '',
        isImage: false,
      };
    })
    .sort((a, b) => a.order_index - b.order_index);
}

function buildVideoQueue() {
  return fallbackActionMedia.slice(0, VIDEO_LIMIT);
}

function createPlaceholderFrame() {
  const fallback = document.createElement('div');
  fallback.className = 'video-fallback';
  fallback.setAttribute('aria-hidden', 'true');
  return fallback;
}

function renderImageFrame(frame, media) {
  const imageEl = document.createElement('img');
  imageEl.src = media.image_url;
  imageEl.alt = media.title || 'KiosKeys en accion';
  imageEl.loading = 'lazy';
  imageEl.decoding = 'async';
  imageEl.className = 'video-action-image';
  imageEl.style.width = '100%';
  imageEl.style.height = '100%';
  imageEl.style.objectFit = 'cover';
  imageEl.style.display = 'block';
  frame.appendChild(imageEl);
}

function renderVideoCards(grid, videos) {
  grid.innerHTML = '';

  const items = Array.isArray(videos) ? videos.slice(0, VIDEO_LIMIT) : [];
  const videoElements = [];

  const shouldApplyInteractiveTilt =
    typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  items.forEach((video, index) => {
    const card = document.createElement('article');
    card.className = 'video-gallery-card';
    card.dataset.role = video.isImage ? 'image' : video.isPlaceholder ? 'placeholder' : 'video';

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

    if (video.isImage) {
      renderImageFrame(frame, video);
    } else if (video.isPlaceholder) {
      frame.classList.add('is-placeholder');
      frame.appendChild(createPlaceholderFrame());
    } else {
      const videoEl = document.createElement('video');
      videoEl.src = video.video_url;
      videoEl.autoplay = true;
      videoEl.loop = true;
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.preload = 'auto';
      videoEl.setAttribute('muted', '');
      videoEl.setAttribute('playsinline', '');

      if (video.image_url) {
        videoEl.poster = video.image_url;
      }

      const handlePlaybackError = () => {
        if (video.video_url) {
          console.warn('Replacing unavailable video with fallback:', video.video_url);
        }
        frame.innerHTML = '';
        if (video.image_url) {
          renderImageFrame(frame, video);
        } else {
          renderImageFrame(frame, fallbackActionMedia[index]);
        }
        card.dataset.role = 'image';
      };

      videoEl.addEventListener('error', handlePlaybackError);
      videoEl.addEventListener('stalled', handlePlaybackError);

      frame.appendChild(videoEl);
      videoElements.push(videoEl);
    }

    card.appendChild(frame);
    grid.appendChild(card);

    if (shouldApplyInteractiveTilt) {
      bindParallaxHover(card);
    }
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

  const actionVideos = renderVideoCards(grid, buildVideoQueue());
  actionVideos.forEach(ensureAutoplay);
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
