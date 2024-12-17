import { debounce } from '../utils/searchUtils';

export class SearchForm {
  constructor(containerId, searchCallback) {
    this.container = document.getElementById(containerId);
    this.searchCallback = searchCallback;
    this.init();
  }

  init() {
    this.container.addEventListener('change', this.handleFormChange.bind(this));
    this.setupSearchDebounce();
  }

  setupSearchDebounce() {
    const searchInput = this.container.querySelector('input[type="search"]');
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        this.searchCallback(e.target.value);
      }, 300));
    }
  }

  handleFormChange(e) {
    const formData = new FormData(e.target.closest('form'));
    this.searchCallback(Object.fromEntries(formData));
  }

  updateResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = results.map(item => `
      <div class="result-item">
        <img src="${item.image}" alt="${item.displayName}" class="result-logo">
        <div class="result-info">
          <h3>${item.displayName}</h3>
          <p>${item.description}</p>
          <div class="result-features">
            ${item.features.map(feature => `
              <span class="result-feature">
                <i class="fas ${feature.icon}"></i> ${feature.text}
              </span>
            `).join('')}
          </div>
        </div>
        <a href="/pages/contacto.html" class="result-button">Consultar</a>
      </div>
    `).join('');

    resultsContainer.classList.add('active');
  }
}