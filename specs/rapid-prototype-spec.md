# Puppr - Rapid Prototype Specification

**Project Name:** Puppr
**Type:** Rapid Prototype Demo Application
**Timeline:** 1-1.5 Days (10-13 hours)
**Created:** 2025-11-07
**Status:** Ready for Implementation

---

## Overview

### 1.1 Concept
A playful dog dating swipe app that combines the addictive mechanics of dating apps (like Tinder) but with profiles for dogs. Users swipe through random dog images pulled from the Dog.CEO API, with each dog having a unique, AI-generated dating profile based on their breed characteristics.

**Key Simplifications:**
- Sequential profile generation (not parallel)
- One-ahead prefetching (not 5-dog queue)
- Button-based navigation (not gesture library)
- View toggle (not React Router)
- Basic session storage (likes only)

**What's Preserved:**
- Full AI profiles (all 6 fields)
- Likes gallery functionality
- Mobile-first design (mobile viewport only)

---

## 1. Core Features

### 1.1 Must-Have Features

✅ **Swipe Interface**
- Button-based swiping (left = pass, right = like)
- Simple CSS transitions for card exit
- One-ahead dog prefetching (minimal latency)

✅ **AI-Generated Dog Profiles (Full)**
- Name (creative, breed-appropriate)
- Age (1-10 years)
- Bio (2-3 sentence witty description)
- Interests (3-4 items based on breed traits)
- Looking For (relationship goals, humorous)
- Personality Traits (3 traits)

✅ **Likes Gallery**
- View all dogs you've liked
- Simple grid layout with thumbnails
- Click to view full profile again
- Stored in session storage (persists during session)

✅ **Bottom Navigation**
- Fixed bottom navigation bar (mobile app pattern)
- Toggle between swipe view and likes gallery
- Simple state-based view switching (no React Router)
- Mobile viewport only (375px - 428px width)

### 1.2 Out of Scope (Deferred to v1.1+)

❌ **Advanced UI**
- Gesture libraries (react-spring/framer-motion)
- Gradient overlays
- Complex animations

❌ **Navigation Router**
- React Router
- Multiple routes
- URL-based navigation

---

## 2. Technical Architecture

### 2.1 Tech Stack

**Frontend:**
- React 18+
- Simple state management (useState, useEffect)
- Vanilla CSS or TailwindCSS
- No gesture libraries
- No React Router

**Backend:**
- Node.js 20+
- Express.js
- `@anthropic-ai/sdk` (Anthropic TypeScript SDK)
- **Claude Haiku 4.5** (`claude-haiku-4-5`)

**External APIs:**
- Dog.CEO API (https://dog.ceo/dog-api/)
- Anthropic Claude API (Haiku 4.5)

**Development Tools:**
- Vite (React build tool)
- nodemon (backend hot reload)

### 2.3 Project Structure

```
puppr/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── SwipeView.jsx       # Main swipe interface
│   │   │   ├── DogCard.jsx         # Dog display card
│   │   │   ├── LikesGallery.jsx    # Liked dogs grid
│   │   │   └── BottomNav.jsx       # Bottom navigation bar
│   │   ├── services/
│   │   │   ├── api.js              # API client
│   │   │   └── storage.js          # Session storage (likes)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                      # Node/Express backend
│   ├── services/
│   │   ├── dogService.js           # Main orchestration service
│   │   ├── dogAPI.js               # Dog.CEO API integration
│   │   ├── profileGenerator.js     # Haiku 4.5 profile generation
│   │   └── mockData.js             # Mock data for development
│   ├── utils/
│   │   ├── circuitBreaker.js       # Circuit breaker pattern
│   │   └── cache.js                # Development caching utility
│   ├── errors.js                   # Custom error classes
│   ├── server.js                   # Main Express server
│   └── package.json
├── ai-docs/                     # Local API documentation
│   ├── dog-ceo-api/                # Dog.CEO API docs
│   └── anthropic-sdk-typescript/   # Anthropic SDK docs
├── .env.example
├── .env                         # Environment variables (gitignored)
└── README.md
```

**Key Files Added:**
- `dogService.js` - Orchestrates Dog API + LLM calls
- `mockData.js` - Mock responses for development
- `circuitBreaker.js` - Prevents cascading failures
- `cache.js` - Development caching for faster iteration
- `errors.js` - Custom error classes for better error handling
- `ai-docs/` - Local documentation for offline reference

### 2.4 Architecture Diagram

```
┌─────────────────────────────┐
│   Browser (React)           │
│  ┌────────────────────────┐ │
│  │  App State             │ │
│  │  - view: 'swipe'|'gallery' │
│  │  - currentDog           │ │
│  │  - nextDog (prefetch)   │ │
│  │  - likedDogs []         │ │
│  └────────┬───────────────┘ │
└───────────┼─────────────────┘
            │
            │ HTTP Requests (one at a time)
            │
┌───────────▼─────────────────┐
│  Express Server             │
│  ┌───────────────────────┐  │
│  │ GET /api/dog          │  │
│  │ - Fetch dog image     │  │
│  │ - Generate profile    │  │
│  │ - Return complete dog │  │
│  └───────┬───────────────┘  │
│          │                  │
│  ┌───────▼───────────────┐  │
│  │ Services:             │  │
│  │ - Dog.CEO (fetch img) │◄─┼─────► Dog.CEO API
│  │ - Haiku 4.5 (profile)│◄─┼─────► Anthropic API
│  └───────────────────────┘  │
└─────────────────────────────┘

Flow:
1. User opens app → fetch first dog
2. Display dog + profile
3. Start fetching next dog in background
4. User swipes → immediately show next dog
5. If liked, store in session storage
6. User can toggle to view likes gallery
```

---

## 3. Data Models

### 3.1 Dog Profile Object

```typescript
interface DogProfile {
  id: string;                    // Unique identifier (timestamp + random)
  imageUrl: string;              // Dog.CEO image URL
  breed: string;                 // Extracted breed name
  profile: {
    name: string;                // AI-generated name
    age: number;                 // 1-10
    bio: string;                 // 2-3 sentences
    interests: string[];         // Array of 3-4 interests
    lookingFor: string;          // Relationship goal
    traits: string[];            // Array of 3 personality traits
  };
  timestamp: number;             // When fetched
}
```

### 3.2 App State (Frontend)

```typescript
interface AppState {
  view: 'swipe' | 'gallery';     // Current view
  currentDog: DogProfile | null; // Currently displayed
  nextDog: DogProfile | null;    // Prefetched for instant display
  likedDogs: DogProfile[];       // Array of liked dogs
  loading: boolean;              // Loading state
  error: string | null;          // Error message
}
```

### 3.3 Session Storage

```typescript
// Key: 'puppr_likes'
interface LikedDogs {
  dogs: DogProfile[];            // Array of liked dog profiles
  lastUpdated: number;           // Timestamp
}
```

---

## 4. API Endpoints

### 4.1 Backend API

#### GET `/api/dog`
**Description:** Fetch single dog with AI-generated profile

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1699383820123-abc",
    "imageUrl": "https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg",
    "breed": "Golden Retriever",
    "profile": {
      "name": "Charlie",
      "age": 4,
      "bio": "Athletic golden boy who believes every stranger is just a friend they haven't met yet. Professional ball enthusiast with a PhD in Good Boy Studies.",
      "interests": ["Swimming", "Fetching", "Making friends", "Belly rubs"],
      "lookingFor": "Someone who throws the ball... and then throws it again",
      "traits": ["Loyal", "Energetic", "Friendly"]
    },
    "timestamp": 1699383820123
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to fetch dog or generate profile"
}
```

#### GET `/api/health`
**Description:** Health check endpoint

---

## 5. User Flow

### 5.1 Main Flow

```
1. User opens app
   ↓
2. Show loading, fetch first dog
   ↓
3. Display dog card with full profile
   ↓
4. Start fetching next dog in background
   ↓
5. User clicks "Pass" or "Like"
   ↓
6. If "Like" → add to session storage
   ↓
7. Show next dog immediately (already fetched)
   ↓
8. Start fetching another dog in background
   ↓
9. Repeat from step 5
```

### 5.2 Navigation Flow

```
┌─────────────────┐
│  Swipe View     │ ← Default view
│   [Dog Card]    │
│   [Pass] [Like] │
│                 │
├─────────────────┤
│ [🐕] [❤️] Nav  │ ← Bottom fixed
└─────────────────┘
        │
        │ Tap gallery icon
        │
┌─────────────────┐
│  Likes Gallery  │
│   [Grid View]   │
│                 │
│                 │
├─────────────────┤
│ [🐕] [❤️] Nav  │ ← Bottom fixed
└─────────────────┘
```

---

## 6. UI/UX Design

### 6.1 Component Specifications

#### SwipeView Component
**Purpose:** Main swipe interface (mobile viewport)

**Features:**
- Single dog card display (full viewport height minus bottom nav)
- "Pass" and "Like" buttons below card
- Loading indicator while fetching
- Error message display
- Mobile-only: 375px - 428px width

**States:**
- `idle`: Card displayed, ready for interaction
- `loading`: Fetching dog
- `transitioning`: Card exiting (CSS animation)

#### DogCard Component
**Purpose:** Display dog image with profile (mobile viewport)

**Layout (Mobile):**
```
┌─────────────────────┐
│                     │ ← Full width (375-428px)
│                     │
│   [Dog Image]       │ ← Square or 4:5 ratio
│                     │
│                     │
├─────────────────────┤
│ 🐾 Charlie, 4       │ ← Scrollable content area
│                     │
│ Athletic golden boy │
│ who believes every  │
│ stranger is just... │
│                     │
│ 💼 Interests:       │
│ • Swimming          │
│ • Fetching          │
│ • Making friends    │
│                     │
│ 💭 Looking for:     │
│ Someone who throws  │
│ the ball forever    │
│                     │
│ ✨ Traits:          │
│ Loyal • Energetic   │
├─────────────────────┤
│  [Pass]    [Like]   │ ← Action buttons
├─────────────────────┤
│ [Bottom Navigation] │ ← Fixed 60px height
└─────────────────────┘
```

**Styling:**
- Mobile-only: max-width 428px
- Full height viewport (minus bottom nav)
- Simple white card with shadow
- Plain text overlay (no gradient)
- Readable typography (16px+)

#### LikesGallery Component
**Purpose:** Display all liked dogs (mobile viewport)

**Layout:**
- Grid layout (2 columns for mobile)
- Thumbnail images (square)
- Dog name overlay
- Tap to expand (show full profile in modal)
- Scrollable content area
- Fixed bottom navigation

**Features:**
- Session storage backed
- Shows count of likes at top
- Empty state: "No likes yet! Start swiping 🐕"
- Mobile-optimized touch targets (min 44px)

#### BottomNav Component (NEW)
**Purpose:** Fixed bottom navigation bar

**Layout:**
```
┌─────────────────────────┐
│  🐕 Swipe    ❤️ Likes   │
└─────────────────────────┘
```

**Features:**
- Fixed position at bottom
- Height: 60px (safe area inset compatible)
- Two tabs: Swipe (dog icon) and Likes (heart icon)
- Active state highlighting
- iOS safe area inset support

**Behavior:**
- Tapping switches views instantly
- Active tab highlighted
- Smooth transition between views
- Stays visible at all times

### 6.2 Design System (Mobile-First)

**Viewport:**
```css
--mobile-min: 375px;     /* iPhone SE */
--mobile-max: 428px;     /* iPhone Pro Max */
--mobile-height: 100vh;  /* Full viewport height */
```

**Colors:**
```css
--primary: #FF6B6B;      /* Like button */
--secondary: #95E1D3;    /* Pass button */
--background: #F7F7F7;   /* Light gray */
--card: #FFFFFF;         /* White */
--text: #2C3E50;         /* Dark blue-gray */
--nav-bg: #FFFFFF;       /* Bottom nav background */
```

**Typography (Mobile-Optimized):**
```css
--font-family: 'Inter', sans-serif;
--text-base: 16px;       /* Readable on mobile */
--text-lg: 18px;
--text-xl: 22px;
```

**Spacing:**
```css
--bottom-nav-height: 60px;
--safe-area-bottom: env(safe-area-inset-bottom);
```

### 6.3 Layout Structure (Mobile)

**Overall Layout:**
```css
.app {
  width: 100vw;
  max-width: 428px;
  height: 100vh;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.content-area {
  height: calc(100vh - 60px); /* Minus bottom nav */
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 428px;
  margin: 0 auto;
  height: 60px;
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--nav-bg);
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
```

### 6.4 Animations (CSS Only)

**Card Exit:**
```css
.card.swiping-left {
  transform: translateX(-150%);
  opacity: 0;
  transition: all 0.3s ease-out;
}

.card.swiping-right {
  transform: translateX(150%);
  opacity: 0;
  transition: all 0.3s ease-out;
}
```

**Card Enter:**
```css
.card.entering {
  transform: scale(0.95);
  opacity: 0;
  animation: enterCard 0.2s ease-out forwards;
}

@keyframes enterCard {
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

**View Transitions:**
```css
.view-transition {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## 7. LLM Integration (Haiku 4.5)

### 7.1 Profile Generation Prompt

**System Context:**
```
You are a creative copywriter specializing in humorous dating profiles.
You create witty, engaging dating app profiles for dogs based on their breed characteristics.
The profiles should be funny but rooted in actual breed traits and temperaments.
Keep the tone light and playful.
```

**Enhanced User Prompt Template:**
```typescript
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
```

**Key Improvements:**
- ✅ Explicit instruction to return ONLY JSON (no markdown blocks)
- ✅ Example format included to guide Claude's output
- ✅ Clear field descriptions with data types
- ✅ Reminder to create original content (not copy example)
- ✅ Breed-specific guidance in prompt

### 7.2 Haiku 4.5 Configuration

**Installation:**
```bash
npm install @anthropic-ai/sdk
```

**Model Specifications:**
```typescript
const HAIKU_4_5_CONFIG = {
  model: 'claude-haiku-4-5',
  maxTokensLimit: 4096,        // Output token limit
  contextWindow: 200000,        // Input context window
  pricing: {
    input: 0.25,                // per million tokens
    output: 1.25,               // per million tokens
  },
  // Estimated tokens for profile generation
  estimatedInputTokens: 100,   // Prompt + breed name
  estimatedOutputTokens: 250,  // JSON profile response
  // Total estimated cost per profile: ~$0.0003 (negligible)
};
```

**Client Setup with Validation:**
```typescript
import Anthropic from '@anthropic-ai/sdk';

// Validate API key exists
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 2,        // SDK default, explicitly set
  timeout: 20 * 1000,   // 20 seconds (Haiku is fast!)
});
```

**Complete Profile Generation with Validation:**
```typescript
// server/services/profileGenerator.js

async function generateProfile(breed) {
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 400,        // Sufficient for JSON profile
      temperature: 0.9,       // High creativity for variety
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

    // Parse JSON response
    const profile = JSON.parse(responseText);

    // Validate profile structure
    validateProfile(profile);

    return profile;

  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON from Claude: ${error.message}`);
    }
    console.error('Profile generation failed:', error);
    throw error;
  }
}

/**
 * Validate the AI-generated profile has all required fields
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
```

### 7.3 Dog.CEO API Implementation Details

**API Endpoint:**
```typescript
const DOG_API_BASE = 'https://dog.ceo/api';
const RANDOM_IMAGE_ENDPOINT = `${DOG_API_BASE}/breeds/image/random`;
```

**Response Structure:**
```json
{
  "message": "https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg",
  "status": "success"
}
```

**Complete Implementation:**

```typescript
// server/services/dogAPI.js

/**
 * Fetch a random dog image from Dog.CEO API
 * @returns {Promise<{imageUrl: string, breed: string}>}
 */
export async function fetchDogImage() {
  try {
    const response = await fetch('https://dog.ceo/api/breeds/image/random', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`Dog API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'success' || !data.message) {
      throw new Error('Invalid response from Dog API');
    }

    const imageUrl = data.message;
    const breed = extractBreedFromUrl(imageUrl);

    return {
      imageUrl,
      breed
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Dog API request timed out');
    }
    throw error;
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
  const urlParts = imageUrl.split('/');
  const breedsPart = urlParts[urlParts.length - 2]; // e.g., "retriever-golden" or "pug"

  return formatBreedName(breedsPart);
}

/**
 * Format breed name for display
 * Converts "retriever-golden" to "Golden Retriever" or "pug" to "Pug"
 */
function formatBreedName(breedString) {
  // Split by hyphen and capitalize each word
  return breedString
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .reverse() // Dog.CEO stores descriptors second, reverse for natural reading
    .join(' ');
}
```

**Edge Cases Handled:**
- ✅ Single-word breeds (e.g., `pug` → `Pug`)
- ✅ Hyphenated breeds (e.g., `retriever-golden` → `Golden Retriever`)
- ✅ Multi-word breeds (e.g., `hound-blood` → `Blood Hound`)
- ✅ Network timeouts (5 second limit)
- ✅ Invalid API responses (status check)
- ✅ Malformed URLs (extraction failure)

### 7.4 Error Handling Reference

**Anthropic SDK Error Types:**

The Anthropic SDK throws specific error types that should be handled appropriately:

```typescript
import Anthropic from '@anthropic-ai/sdk';

// Error type reference
try {
  const message = await client.messages.create({...});
} catch (error) {
  if (error instanceof Anthropic.AuthenticationError) {
    // 401: Invalid API key
    console.error('Invalid Anthropic API key');
  } else if (error instanceof Anthropic.PermissionDeniedError) {
    // 403: Insufficient permissions
    console.error('Insufficient API permissions');
  } else if (error instanceof Anthropic.NotFoundError) {
    // 404: Invalid endpoint or model
    console.error('Invalid model or endpoint');
  } else if (error instanceof Anthropic.RateLimitError) {
    // 429: Too many requests - SHOULD RETRY
    console.error('Rate limit exceeded, retry with backoff');
  } else if (error instanceof Anthropic.InternalServerError) {
    // 500+: Service issues - SHOULD RETRY
    console.error('Anthropic service error');
  } else if (error instanceof Anthropic.APIConnectionError) {
    // Network connectivity problems - SHOULD RETRY
    console.error('Network connection failed');
  }
}
```

**Custom Error Classes:**

```typescript
// server/errors.js

export class DogAPIError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DogAPIError';
  }
}

export class AnthropicAPIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'AnthropicAPIError';
    this.statusCode = statusCode;
  }
}

export class ProfileGenerationError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'ProfileGenerationError';
    this.cause = cause;
  }
}
```

**Retry Strategy:**

**When to Retry:**
- ✅ 429 (Rate Limit) - Always retry with exponential backoff
- ✅ 500, 503 (Server errors) - Retry up to 2 times
- ✅ Network errors - Retry with timeout
- ✅ Malformed JSON from Claude - Retry once (might be transient)

**When NOT to Retry:**
- ❌ 400 (Bad Request) - Fix the request
- ❌ 401 (Unauthorized) - Fix API key
- ❌ 403 (Forbidden) - Check permissions
- ❌ 404 (Not Found) - Fix endpoint/model name

**Rate Limit Handling with Exponential Backoff:**

```typescript
// server/services/profileGenerator.js

async function generateProfileWithRetry(breed, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generateProfile(breed);
    } catch (error) {
      // Rate limit - retry with backoff
      if (error instanceof Anthropic.RateLimitError) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10s
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Malformed JSON - retry once
      if (error instanceof SyntaxError && attempt < maxRetries - 1) {
        console.warn('Invalid JSON from Claude, retrying...', error.message);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      // Server errors - retry
      if (error instanceof Anthropic.InternalServerError && attempt < maxRetries - 1) {
        console.warn('Anthropic server error, retrying...');
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }

      // Other errors - fail immediately
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
```

**Circuit Breaker Pattern (Advanced):**

For production systems, implement a circuit breaker to prevent cascading failures:

```typescript
// server/utils/circuitBreaker.js

export class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;        // failures before opening
    this.timeout = timeout;            // 60s before attempting recovery
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';             // CLOSED, OPEN, HALF_OPEN
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      console.error(`Circuit breaker OPEN after ${this.failures} failures`);
    }
  }
}

// Usage in profileGenerator.js
import { CircuitBreaker } from '../utils/circuitBreaker.js';

const anthropicCircuitBreaker = new CircuitBreaker(5, 60000);

export async function generateProfileSafe(breed) {
  return anthropicCircuitBreaker.execute(
    () => generateProfileWithRetry(breed)
  );
}
```

---

## 8. Development Phases

### Phase 1: Basic Flow (4-5 hours)
**Goal:** Display dogs with AI profiles

**Tasks:**
- [x] Set up React app with Vite
- [x] Set up Express server
- [x] Integrate Dog.CEO API
- [x] Integrate Anthropic SDK (Haiku 4.5)
- [x] Create DogCard component
- [x] Display single dog with profile
- [x] Add loading states
- [x] Extract breed from image URL

**Deliverable:** Shows dog with AI-generated profile

### Phase 2: Swipe + Likes (3-4 hours)
**Goal:** Navigation and likes gallery

**Tasks:**
- [x] Add "Pass" and "Like" buttons
- [x] Implement CSS transitions
- [x] One-ahead dog prefetching
- [x] Session storage for likes
- [x] Create LikesGallery component
- [x] Create BottomNav component
- [x] View toggle between swipe/gallery
- [x] Mobile-only layout (375-428px)

**Deliverable:** Can swipe through dogs and view likes

### Phase 3: Polish & Deploy (2-3 hours)
**Goal:** Production-ready demo

**Tasks:**
- [x] Error handling and fallbacks
- [x] Mobile-only optimization (test on iPhone)
- [x] iOS safe area insets
- [x] Basic error messages
- [x] Loading indicators
- [x] Deploy backend (Render/Railway)
- [x] Deploy frontend (Vercel/Netlify)
- [x] Environment variables setup
- [x] Update README

**Deliverable:** Live, shareable demo URL

**Total Timeline:** 10-12 hours (1-1.5 days)

---

## 9. Technical Implementation

### 9.1 Mobile Layout Implementation

```tsx
// App.jsx - Mobile-first structure
function App() {
  const [view, setView] = useState('swipe');
  const [currentDog, setCurrentDog] = useState(null);
  const [nextDog, setNextDog] = useState(null);
  const [likedDogs, setLikedDogs] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="app"> {/* max-width: 428px, centered */}
      <div className="content-area"> {/* height: calc(100vh - 60px) */}
        {view === 'swipe' ? (
          <SwipeView
            currentDog={currentDog}
            onSwipe={handleSwipe}
            loading={loading}
          />
        ) : (
          <LikesGallery dogs={likedDogs} />
        )}
      </div>

      <BottomNav
        activeView={view}
        onViewChange={setView}
        likesCount={likedDogs.length}
      />
    </div>
  );
}
```

### 9.2 Simplified Fetching Pattern

```typescript
// Fetching logic

// Initialize: fetch first two dogs
useEffect(() => {
  async function init() {
    setLoading(true);
    const first = await fetchDog();
    const second = await fetchDog();
    setCurrentDog(first);
    setNextDog(second);
    setLoading(false);
  }
  init();
}, []);

// Prefetch next dog when nextDog is used
useEffect(() => {
  if (currentDog && !nextDog && !loading) {
    fetchDog().then(setNextDog);
  }
}, [currentDog, nextDog, loading]);

// Handle swipe
function handleSwipe(direction) {
  if (direction === 'right') {
    // Save to likes
    setLikedDogs(prev => [...prev, currentDog]);
    saveLikesToStorage([...likedDogs, currentDog]);
  }

  // Move to next dog
  setCurrentDog(nextDog);
  setNextDog(null); // Triggers prefetch
}
```

### 9.3 Bottom Navigation Component

```tsx
// BottomNav.jsx
function BottomNav({ activeView, onViewChange, likesCount }) {
  return (
    <nav className="bottom-nav">
      <button
        className={activeView === 'swipe' ? 'active' : ''}
        onClick={() => onViewChange('swipe')}
      >
        <span className="icon">🐕</span>
        <span className="label">Swipe</span>
      </button>

      <button
        className={activeView === 'gallery' ? 'active' : ''}
        onClick={() => onViewChange('gallery')}
      >
        <span className="icon">❤️</span>
        <span className="label">Likes</span>
        {likesCount > 0 && (
          <span className="badge">{likesCount}</span>
        )}
      </button>
    </nav>
  );
}
```

**Styling:**
```css
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  padding-bottom: env(safe-area-inset-bottom);
  background: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 100;
}

.bottom-nav button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border: none;
  background: none;
  min-height: 44px; /* iOS touch target */
}

.bottom-nav button.active {
  color: var(--primary);
}

.bottom-nav .badge {
  position: absolute;
  top: 4px;
  right: 20px;
  background: var(--primary);
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
}
```

### 9.4 Session Storage

```typescript
// storage.js
const LIKES_KEY = 'puppr_likes';

export function saveLikes(dogs: DogProfile[]) {
  sessionStorage.setItem(LIKES_KEY, JSON.stringify({
    dogs,
    lastUpdated: Date.now()
  }));
}

export function loadLikes(): DogProfile[] {
  try {
    const data = sessionStorage.getItem(LIKES_KEY);
    if (!data) return [];
    const { dogs } = JSON.parse(data);
    return dogs || [];
  } catch {
    return [];
  }
}
```

### 9.5 API Service

```typescript
// api.js
export async function fetchDog(): Promise<DogProfile> {
  const response = await fetch('/api/dog');
  if (!response.ok) throw new Error('Failed to fetch dog');
  const { data } = await response.json();
  return data;
}
```

### 9.6 Complete Backend Service Files

This section provides complete, production-ready backend service implementations.

**Main Server File:**

```javascript
// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchDogWithProfile } from './services/dogService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '1.0.0'
  });
});

// Main dog endpoint
app.get('/api/dog', async (req, res) => {
  try {
    const dog = await fetchDogWithProfile();
    res.json({
      success: true,
      data: dog
    });
  } catch (error) {
    console.error('Error fetching dog:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dog or generate profile',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🐕 Puppr server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

**Dog Service Orchestration:**

```javascript
// server/services/dogService.js
import { fetchDogImage } from './dogAPI.js';
import { generateProfileWithRetry } from './profileGenerator.js';

/**
 * Fetch a dog image and generate AI profile
 * This is the main orchestration function that combines both services
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

  console.log(`✅ Generated profile for ${breed} (${dog.id})`);

  return dog;
}
```

**Dog API Service (Complete Implementation):**

```javascript
// server/services/dogAPI.js
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
```

**Profile Generator Service (Complete Implementation):**

```javascript
// server/services/profileGenerator.js
import Anthropic from '@anthropic-ai/sdk';
import { ProfileGenerationError } from '../errors.js';

// Validate API key
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 2,
  timeout: 20 * 1000,
});

/**
 * Generate AI profile with retry logic
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
```

**Error Classes:**

```javascript
// server/errors.js

export class DogAPIError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DogAPIError';
  }
}

export class AnthropicAPIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'AnthropicAPIError';
    this.statusCode = statusCode;
  }
}

export class ProfileGenerationError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'ProfileGenerationError';
    this.cause = cause;
  }
}
```

**Package.json:**

```json
{
  "name": "puppr-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.32.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 9.7 Testing & Development Strategy

**Mock Data for Development:**

To avoid API rate limits during development, create mock responses:

```javascript
// server/services/mockData.js

export const MOCK_DOG_RESPONSES = [
  {
    imageUrl: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg',
    breed: 'Golden Retriever'
  },
  {
    imageUrl: 'https://images.dog.ceo/breeds/pug/n02110958_1008.jpg',
    breed: 'Pug'
  },
  {
    imageUrl: 'https://images.dog.ceo/breeds/hound-blood/n02088466_11351.jpg',
    breed: 'Blood Hound'
  }
];

export const MOCK_PROFILES = {
  'Golden Retriever': {
    name: 'Charlie',
    age: 4,
    bio: 'Athletic golden boy who believes every stranger is just a friend they haven\'t met yet.',
    interests: ['Swimming', 'Fetching', 'Making friends', 'Belly rubs'],
    lookingFor: 'Someone who throws the ball... and then throws it again',
    traits: ['Loyal', 'Energetic', 'Friendly']
  },
  'Pug': {
    name: 'Winston',
    age: 3,
    bio: 'Professional couch warmer with a passion for snacks and more snacks.',
    interests: ['Napping', 'Eating', 'Snoring', 'Treats'],
    lookingFor: 'Someone who appreciates a good nap session',
    traits: ['Lazy', 'Affectionate', 'Humorous']
  }
};

// Enable/disable mock mode via environment variable
export const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';
```

**Edge Cases to Test:**

1. **Dog API Edge Cases:**
   - Single-word breeds: `pug` → `Pug`
   - Hyphenated breeds: `retriever-golden` → `Golden Retriever`
   - Multi-hyphen breeds: `bulldog-french` → `French Bulldog`
   - Timeout scenarios (5+ seconds)
   - Invalid responses (malformed JSON)
   - Network failures

2. **Profile Generation Edge Cases:**
   - Rare breeds: `Azawakh`, `Xoloitzcuintli`
   - Complex breed names: `Mexican Hairless`, `Bernese Mountain Dog`
   - Rate limiting (429 errors)
   - Malformed JSON responses
   - Missing required fields

3. **Integration Edge Cases:**
   - Concurrent requests (multiple users)
   - Rapid successive requests (prefetching)
   - Circuit breaker triggering
   - Graceful degradation

**Development Workflow:**

```bash
# 1. Start with mock data
USE_MOCK_DATA=true npm run dev

# 2. Test with real APIs one at a time
# First test Dog API only:
USE_MOCK_PROFILES=true npm run dev

# Then test Anthropic only:
USE_MOCK_DOGS=true npm run dev

# 3. Full integration test:
npm run dev

# 4. Load testing:
# Use tool like Apache Bench or k6
ab -n 100 -c 10 http://localhost:3001/api/dog
```

**Caching Strategy for Development:**

```javascript
// server/utils/cache.js
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

export function setCached(key, value) {
  cache.set(key, {
    value,
    timestamp: Date.now()
  });
}

// Usage in profileGenerator.js
import { getCached, setCached } from '../utils/cache.js';

async function generateProfile(breed) {
  if (process.env.NODE_ENV === 'development') {
    const cached = getCached(`profile:${breed}`);
    if (cached) {
      console.log(`Using cached profile for ${breed}`);
      return cached;
    }
  }

  const profile = await actuallyGenerateProfile(breed);

  if (process.env.NODE_ENV === 'development') {
    setCached(`profile:${breed}`, profile);
  }

  return profile;
}
```

---

## 10. Performance Considerations

### 10.1 Simplified Approach

**One-Ahead Prefetching:**
- Fetch next dog as soon as current is displayed
- User never waits after first load
- No complex queue management

**Sequential Generation:**
- One profile at a time
- Simpler error handling
- Easier to debug
- Still fast with Haiku 4.5 (~2-4 seconds)

**Session Storage Only:**
- No server-side persistence
- Cleared on browser close
- Fast and simple

### 10.2 Error Handling & Resilience

**Retry Logic with Exponential Backoff:**

```typescript
async function fetchDogWithRetry(retries = 3): Promise<DogProfile> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchDog();
    } catch (error) {
      if (i === retries - 1) throw error;
      // Exponential backoff: 1s, 2s, 4s
      const waitTime = 1000 * Math.pow(2, i);
      await new Promise(r => setTimeout(r, waitTime));
    }
  }
}
```

**Rate Limiting Best Practices:**

When using external APIs (Dog.CEO and Anthropic), implement rate limiting awareness:

1. **Anthropic Rate Limits:**
   - Haiku 4.5: 50,000 requests per minute (RPM) on Tier 1
   - Handle 429 errors with exponential backoff
   - SDK includes built-in retry logic (maxRetries: 2)

2. **Dog.CEO Rate Limits:**
   - No official rate limit, but be respectful
   - Implement 5-second timeout
   - Cache responses in development

3. **Client-Side Rate Limiting:**
   - Limit prefetching to 1 dog ahead
   - Don't queue multiple requests
   - Throttle user interactions if needed

**Circuit Breaker Pattern (Advanced):**

For production deployments, implement circuit breaker to prevent cascading failures when APIs are down:

```typescript
// Prevents repeated calls to failing services
// See Section 7.4 for full implementation

import { CircuitBreaker } from './utils/circuitBreaker.js';

const dogApiCircuitBreaker = new CircuitBreaker(5, 60000);
const anthropicCircuitBreaker = new CircuitBreaker(5, 60000);

// Wrap API calls with circuit breaker
export async function fetchDogImageSafe() {
  return dogApiCircuitBreaker.execute(() => fetchDogImage());
}

export async function generateProfileSafe(breed) {
  return anthropicCircuitBreaker.execute(
    () => generateProfileWithRetry(breed)
  );
}
```

**Benefits:**
- ✅ Prevents overwhelming failing services
- ✅ Faster failure responses (no waiting for timeouts)
- ✅ Automatic recovery attempts after cooldown
- ✅ Better user experience during outages

---

## 11. Environment Setup

### 11.1 Required Tools
- Node.js 20+
- npm or yarn
- Anthropic API key (https://console.anthropic.com/)

### 11.2 Environment Variables

**Backend `.env`:**
```bash
PORT=3001
NODE_ENV=development
ANTHROPIC_API_KEY=your_key_here
CORS_ORIGIN=http://localhost:5173
```

**Frontend `.env`:**
```bash
VITE_API_URL=http://localhost:3001
```

### 11.3 Installation

**Backend:**
```bash
cd server
npm install express @anthropic-ai/sdk cors dotenv
npm run dev
```

**Frontend:**
```bash
cd client
npm create vite@latest . -- --template react
npm install
npm run dev
```

---

## 12. Deployment

### 12.1 Backend (Render)
1. Create new Web Service
2. Connect GitHub repo
3. Set environment variables
4. Deploy from main branch

### 12.2 Frontend (Vercel)
1. Connect GitHub repo
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set `VITE_API_URL` environment variable
5. Deploy

---

## 13. Success Criteria

### 13.1 Functional Requirements
- [ ] App loads and displays dog with profile
- [ ] User can pass/like dogs
- [ ] Next dog appears immediately
- [ ] Likes are saved to session storage
- [ ] Likes gallery displays saved dogs
- [ ] Bottom navigation works
- [ ] Toggle between views works
- [ ] Mobile-only (375-428px width)
- [ ] iOS safe area insets work

### 13.2 Performance Requirements
- [ ] First dog loads in < 5 seconds
- [ ] Subsequent dogs appear instantly
- [ ] Profile generation < 5 seconds (Haiku)
- [ ] Smooth 60fps animations on mobile
- [ ] Touch targets min 44px (iOS guidelines)

### 13.3 Demo Requirements
- [ ] Impressive in 30-second demo
- [ ] Deployed with public URL
- [ ] Shows AI creativity
- [ ] Smooth user experience

---

## 16. Resources

**Dog.CEO API:**
- Local Docs: `/Users/chrisivester/Documents/mbp-obsidian-vault/02-Projects/software-projects/Puppr/ai-docs/dog-ceo-api`
- Docs: https://dog.ceo/dog-api/documentation/
- GitHub: https://github.com/ElliottLandsborough/dog-ceo-api

**Anthropic API:**
- Local Docs: `/Users/chrisivester/Documents/mbp-obsidian-vault/02-Projects/software-projects/Puppr/ai-docs/anthropic-sdk-typescript`
- Docs: https://docs.anthropic.com/
- SDK: https://github.com/anthropics/anthropic-sdk-typescript
- Models: Haiku 4.5 (`claude-haiku-4-5`)

**React Resources:**
- Vite: https://vitejs.dev/
- React Docs: https://react.dev/

---

## 17. Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-07 | 1.0 | Initial rapid prototype specification created from full MVP spec. Switched to Haiku 4.5, simplified to 1-1.5 day timeline, removed complex queue system, kept full profiles and likes gallery. |
| 2025-11-07 | 1.1 | Updated to mobile-only design (375-428px viewport). Added bottom navigation pattern (iOS/Android best practice). Removed desktop responsiveness. Added safe area inset support. |

---

**Status:** ✅ Ready for Implementation
**Timeline:** 10-13 hours (1-1.5 days)
**Next Step:** Begin Phase 1 development
