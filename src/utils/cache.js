// Cache management
class Cache {
    constructor() {
      this.store = new Map();
      this.timeouts = new Map();
    }
  
    set(key, value, ttl = 300000) { // Default TTL: 5 minutes
      this.store.set(key, value);
      
      // Clear existing timeout if any
      if (this.timeouts.has(key)) {
        clearTimeout(this.timeouts.get(key));
      }
  
      // Set new timeout
      const timeout = setTimeout(() => {
        this.delete(key);
      }, ttl);
      
      this.timeouts.set(key, timeout);
    }
  
    get(key) {
      return this.store.get(key);
    }
  
    delete(key) {
      this.store.delete(key);
      if (this.timeouts.has(key)) {
        clearTimeout(this.timeouts.get(key));
        this.timeouts.delete(key);
      }
    }
  
    clear() {
      this.store.clear();
      this.timeouts.forEach(timeout => clearTimeout(timeout));
      this.timeouts.clear();
    }
  }
  
  export const cache = new Cache();