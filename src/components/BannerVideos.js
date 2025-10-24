import { bannerAPI } from '../db.js';

export async function initBannerVideos() {
  try {
    const videos = await bannerAPI.getVideos();
    const container = document.querySelector('.video-gallery-grid');

    if (!container) return;

    const playableVideos = Array.isArray(videos)
      ? videos.filter((video) => Boolean(video?.url)).slice(0, 3)
      : [];

    container.innerHTML = playableVideos.map((video, index) => `
      <div class="video-card video-card-${index + 1}" data-aos="fade-up" data-aos-delay="${index * 100}">
        <div class="video-card-content">
          <video
            autoplay
            loop
            muted
            playsinline
            preload="auto"
          >
            <source src="${video.url}" type="video/mp4">
          </video>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('video').forEach((videoEl) => {
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
    });
  } catch (error) {
    console.error('Error loading banner videos:', error);
  }
}
