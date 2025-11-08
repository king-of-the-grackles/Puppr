import { fetchDogImage } from './dogAPI.js';
import { generateProfileWithRetry } from './profileGenerator.js';

/**
 * Fetch a dog image and generate AI profile
 * This is the main orchestration function that combines both services
 * @returns {Promise<Object>} - Complete dog profile object
 */
export async function fetchDogWithProfile() {
  // Step 1: Fetch dog image from Dog.CEO API
  const { imageUrl, breed } = await fetchDogImage();

  // Step 2: Generate AI profile using Haiku 4.5
  const profile = await generateProfileWithRetry(breed);

  // Step 3: Construct complete dog object
  const dog = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    imageUrl,
    breed,
    profile,
    timestamp: Date.now()
  };

  console.log(` Generated profile for ${breed} (${dog.id})`);

  return dog;
}
