export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to storage: ${error}`);
    return false;
  }
}

export function getFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading from storage: ${error}`);
    return null;
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from storage: ${error}`);
    return false;
  }
}

export function clearStorage() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error(`Error clearing storage: ${error}`);
    return false;
  }
}