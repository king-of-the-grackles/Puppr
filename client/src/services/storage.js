/**
 * Session storage service for persisting liked dogs
 */

const LIKES_KEY = 'puppr_likes';

/**
 * Save liked dogs to session storage
 * @param {Array} dogs - Array of dog profile objects
 */
export function saveLikes(dogs) {
  try {
    sessionStorage.setItem(LIKES_KEY, JSON.stringify({
      dogs,
      lastUpdated: Date.now()
    }));
  } catch (error) {
    console.error('Failed to save likes:', error);
  }
}

/**
 * Load liked dogs from session storage
 * @returns {Array} - Array of dog profile objects
 */
export function loadLikes() {
  try {
    const data = sessionStorage.getItem(LIKES_KEY);
    if (!data) return [];
    
    const { dogs } = JSON.parse(data);
    return dogs || [];
  } catch (error) {
    console.error('Failed to load likes:', error);
    return [];
  }
}

/**
 * Clear all liked dogs from session storage
 */
export function clearLikes() {
  try {
    sessionStorage.removeItem(LIKES_KEY);
  } catch (error) {
    console.error('Failed to clear likes:', error);
  }
}
