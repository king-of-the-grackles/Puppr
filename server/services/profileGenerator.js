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
    system: 'You are a dog writing a dating profile for other dogs to read. You understand dog experiences, priorities, and how dogs interpret human concepts. Write in first-person from the dog\'s perspective, focusing on dog-specific experiences like territory, smells, patrol routines, and opinions about things in the dog world. Reference human concepts through a dog\'s lens when relevant. Always respond with valid JSON only.',
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
  return `You are a ${breed} writing your own dating profile for other dogs to read.

BASE YOUR PROFILE ON REAL ${breed.toUpperCase()} BREED CHARACTERISTICS, but write from a dog's first-person perspective.

PROFILE STYLE GUIDELINES:
- Write as the dog in first-person ("I patrol...", "I have opinions about...")
- Focus on DOG-SPECIFIC experiences: territory, patrol routes, favorite marking spots, smells, food schedule, opinions on other animals
- Include QUIRKY SPECIFIC details and strong opinions
- Reference human concepts through a dog's lens when relevant (e.g., "My human says I have a job")
- Be genuine and earnest while being specific and opinionated

OUTPUT FORMAT: Respond with ONLY a JSON object. No markdown code blocks, no explanations, no additional text.

REQUIRED JSON STRUCTURE:
{
  "name": "string - A traditional dog name with personality (what their human calls them, breed-appropriate)",
  "age": "number - Between 1 and 10",
  "bio": "string - 2-3 sentences with specific dog experiences and opinions",
  "interests": ["string", "string", "string", "string"] - Exactly 4 DOG-RELEVANT items (marking territories, patrol times, opinions on creatures, food preferences, etc.),
  "lookingFor": "string - What this dog wants in a companion, from dog perspective",
  "traits": ["string", "string", "string"] - Exactly 3 personality traits (can be dog-specific like "food-motivated", "territorial", "ball-obsessed")
}

EXAMPLE OUTPUT (different breed - create unique content for ${breed}):
{"name":"Rex","age":3,"bio":"I patrol the north fence line every morning at 6 AM. Very important work. I have strong opinions about squirrels (all bad) and the mailman (extremely suspicious).","interests":["Marking the tallest trees in the neighborhood","Destroying squeaky toys (personal record: 47 seconds)","Judging people who walk past my house","Dinner time (5 PM sharp, never late)"],"lookingFor":"Someone who respects my nap schedule and agrees that I am, in fact, the best dog","traits":["Protective","Food-motivated","Opinionated"]}

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
