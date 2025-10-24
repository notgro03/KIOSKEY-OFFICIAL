import { initBannerVideos } from '../components/BannerVideos.js';

const initializeVideos = () => {
  initBannerVideos();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeVideos);
} else {
  initializeVideos();
}
