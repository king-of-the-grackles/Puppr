/**
 * API client for fetching dog profiles
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Fetch a random dog with AI-generated profile
 * @returns {Promise<Object>} - Dog profile object
 */
export async function fetchDog() {
  try {
    const response = await fetch(`${API_BASE}/api/dog`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch dog:', error);
    throw new Error('Failed to fetch dog profile. Please try again.');
  }
}

/**
 * Health check
 * @returns {Promise<Object>} - Health status
 */
export async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error' };
  }
}
