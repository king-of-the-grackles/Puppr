import { DogAPIError } from '../errors.js';

const DOG_API_BASE = 'https://dog.ceo/api';

/**
 * Fetch a random dog image from Dog.CEO API
 * @returns {Promise<{imageUrl: string, breed: string}>}
 * @throws {DogAPIError} if API request fails
 */
export async function fetchDogImage() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${DOG_API_BASE}/breeds/image/random`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new DogAPIError(`Dog API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'success' || !data.message) {
      throw new DogAPIError('Invalid response from Dog API');
    }

    const imageUrl = data.message;
    const breed = extractBreedFromUrl(imageUrl);

    return {
      imageUrl,
      breed
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new DogAPIError('Dog API request timed out');
    }
    if (error instanceof DogAPIError) {
      throw error;
    }
    throw new DogAPIError(`Dog API error: ${error.message}`);
  }
}

/**
 * Extract breed information from Dog.CEO image URL
 * URL Pattern: https://images.dog.ceo/breeds/{breed-name}/{filename}.jpg
 * 
 * Examples:
 * - "https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg"
 *   → "Golden Retriever"
 * - "https://images.dog.ceo/breeds/pug/n02110958_1008.jpg"
 *   → "Pug"
 * - "https://images.dog.ceo/breeds/hound-blood/n02088466_11351.jpg"
 *   → "Blood Hound"
 */
function extractBreedFromUrl(imageUrl) {
  try {
    const urlParts = imageUrl.split('/');
    const breedsPart = urlParts[urlParts.length - 2];

    return formatBreedName(breedsPart);
  } catch (error) {
    throw new DogAPIError(`Failed to extract breed from URL: ${imageUrl}`);
  }
}

/**
 * Format breed name for display
 * Converts "retriever-golden" to "Golden Retriever" or "pug" to "Pug"
 */
function formatBreedName(breedString) {
  return breedString
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .reverse() // Dog.CEO stores descriptors second, reverse for natural reading
    .join(' ');
}
