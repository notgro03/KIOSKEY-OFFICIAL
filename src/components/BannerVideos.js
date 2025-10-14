import { bannerAPI } from '../db.js';

export async function initBannerVideos() {
  try {
    const videos = await bannerAPI.getVideos();
    const container = document.querySelector('.video-gallery-grid');
    
    if (container) {
      container.innerHTML = videos.map((video, index) => `
        <div class="video-card video-card-${index + 1}" data-aos="fade-up" data-aos-delay="${index * 100}">
          <div class="video-card-content">
            <video autoplay loop muted playsinline preload="metadata">
              <source src="${video.url}" type="video/mp4">
            </video>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading banner videos:', error);
  }
}