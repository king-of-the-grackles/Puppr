import '../loadEnv.js';
import Anthropic from '@anthropic-ai/sdk';
import { ProfileGenerationError } from '../errors.js';

// Validate API key
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 2,
  timeout: 20 * 1000, // 20 seconds (Haiku is fast!)
});

/**
 * Generate AI profile with retry logic
 * @param {string} breed - Dog breed name
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<Object>} - Generated profile object
 */
export async function generateProfileWithRetry(breed, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generateProfile(breed);
    } catch (error) {
      // Rate limit - retry with backoff
      if (error instanceof Anthropic.RateLimitError) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`Rate limited. Waiting ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Malformed JSON - retry once
      if (error instanceof SyntaxError && attempt < maxRetries - 1) {
        console.warn('Invalid JSON from Claude, retrying...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      // Server errors - retry
      if (error instanceof Anthropic.InternalServerError && attempt < maxRetries - 1) {
        console.warn('Anthropic server error, retrying...');
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }

      // Last attempt or non-retryable error
      if (attempt === maxRetries - 1) {
        throw new ProfileGenerationError(
          `Failed to generate profile after ${maxRetries} attempts`,
          error
        );
      }
    }
  }

  throw new ProfileGenerationError('All retry attempts exhausted');
}

/**
 * Generate AI profile for a dog breed
 * @param {string} breed - Dog breed name
 * @returns {Promise<Object>} - Profile object with name, age, bio, interests, lookingFor, traits
 */
async function generateProfile(breed) {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 400,
    temperature: 0.9,
    system: 'You are a creative copywriter specializing in humorous dating profiles. You create witty, engaging profiles for dogs based on their breed characteristics. Always respond with valid JSON only.',
    messages: [
      {
        role: 'user',
        content: createProfilePrompt(breed)
      }
    ]
  });

  // Extract text from response
  let responseText = message.content[0].text.trim();

  // CRITICAL: Strip markdown code blocks if present
  // Claude sometimes wraps JSON in ```json...``` which breaks JSON.parse()
  if (responseText.startsWith('```')) {
    responseText = responseText
      .replace(/^```json?\s*\n?/, '')  // Remove opening ```json or ```
      .replace(/\n?```\s*$/, '')        // Remove closing ```
      .trim();
  }

  const profile = JSON.parse(responseText);

  validateProfile(profile);

  return profile;
}

/**
 * Create the prompt for profile generation
 * @param {string} breed - Dog breed name
 * @returns {string} - Formatted prompt
 */
function createProfilePrompt(breed) {
  return `Generate a creative dating profile for a ${breed} dog.

BASE YOUR PROFILE ON REAL ${breed.toUpperCase()} BREED CHARACTERISTICS.

OUTPUT FORMAT: Respond with ONLY a JSON object. No markdown code blocks, no explanations, no additional text.

REQUIRED JSON STRUCTURE:
{
  "name": "string - A creative, breed-appropriate name",
  "age": "number - Between 1 and 10",
  "bio": "string - 2-3 witty sentences capturing breed personality",
  "interests": ["string", "string", "string", "string"] - Exactly 4 items based on breed traits,
  "lookingFor": "string - Humorous relationship goal statement",
  "traits": ["string", "string", "string"] - Exactly 3 personality traits
}

EXAMPLE OUTPUT (different breed - create unique content for ${breed}):
{"name":"Charlie","age":4,"bio":"Athletic golden boy who believes every stranger is just a friend they haven't met yet. Professional ball enthusiast with a PhD in Good Boy Studies.","interests":["Swimming","Fetching","Making friends","Belly rubs"],"lookingFor":"Someone who throws the ball... and then throws it again","traits":["Loyal","Energetic","Friendly"]}

NOW CREATE A UNIQUE PROFILE FOR A ${breed}:`;
}

/**
 * Validate the AI-generated profile has all required fields
 * @param {Object} profile - Profile to validate
 * @throws {Error} if validation fails
 */
function validateProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    throw new Error('Profile is not an object');
  }

  const required = ['name', 'age', 'bio', 'interests', 'lookingFor', 'traits'];
  for (const field of required) {
    if (!(field in profile)) {
      throw new Error(`Profile missing required field: ${field}`);
    }
  }

  if (typeof profile.name !== 'string' || profile.name.length === 0) {
    throw new Error('Profile name must be a non-empty string');
  }

  if (typeof profile.age !== 'number' || profile.age < 1 || profile.age > 10) {
    throw new Error('Profile age must be between 1-10');
  }

  if (!Array.isArray(profile.interests) || profile.interests.length < 3) {
    throw new Error('Profile must have at least 3 interests');
  }

  if (!Array.isArray(profile.traits) || profile.traits.length !== 3) {
    throw new Error('Profile must have exactly 3 traits');
  }
}
