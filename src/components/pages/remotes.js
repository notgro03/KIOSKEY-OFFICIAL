import { remotesService } from '../services/remotesService';
import { SearchForm } from '../components/SearchForm';
import { formatSearchResults } from '../utils/searchUtils';

class RemotesPage {
  constructor() {
    this.searchForm = new SearchForm('searchContainer', this.handleSearch.bind(this));
    this.init();
  }

  async init() {
    try {
      const allRemotes = await remotesService.getAllRemotes();
      this.searchForm.updateResults(formatSearchResults(allRemotes));
    } catch (error) {
      console.error('Error loading remotes:', error);
    }
  }

  async handleSearch(searchParams) {
    try {
      let results;
      if (typeof searchParams === 'string') {
        results = await remotesService.searchRemotes(searchParams);
      } else {
        const { brand, model } = searchParams;
        if (brand && model) {
          results = await remotesService.getRemotesByModel(brand, model);
        } else if (brand) {
          results = await remotesService.getRemotesByBrand(brand);
        }
      }
      this.searchForm.updateResults(formatSearchResults(results));
    } catch (error) {
      console.error('Error searching remotes:', error);
    }
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  new RemotesPage();
});