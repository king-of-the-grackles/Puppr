# Puppr - MVP Specification

**Project Name:** Puppr
**Type:** Rapid Prototype Demo Application
**Created:** 2025-11-07
**Status:** Specification Phase

---

## 1. Project Overview

### 1.1 Concept
A playful dog dating swipe app that combines the addictive mechanics of dating apps (like Tinder) with AI-generated personality profiles for dogs. Users swipe through random dog images pulled from the Dog.CEO API, with each dog having a unique, AI-generated dating profile based on their breed characteristics.

---

## 2. Core Features (MVP)

### 2.1 Must-Have Features
✅ **Swipe Interface**
- Gesture-based swiping (left = pass, right = like)
- Smooth animations for swipe actions
- Next dog automatically loads after swipe (instant, no loading)

✅ **Background Queue System**
- Buffer of 5 dogs preloaded in background
- AI profiles generated asynchronously while user views current dog
- Zero latency between swipes (after initial load)
- Automatic queue refill when buffer drops below threshold

✅ **AI-Generated Dog Profiles**
- Name (creative, breed-appropriate)
- Age (1-10 years)
- Bio (2-3 sentence witty description)
- Interests (3-4 items based on breed traits)
- Looking For (relationship goals, humorous)
- Personality Traits (3 traits)

✅ **Profile Overlay**
- Display profile information over dog image
- Dating-app style card design
- Readable text with proper contrast

✅ **Likes Gallery**
- View all dogs you've swiped right on
- Stored in browser session storage
- Grid or list view with thumbnails

✅ **Basic Statistics**
- Total dogs seen
- Total likes
- Favorite breed (most liked)

### 2.3 Out of Scope (v1)
- User accounts / authentication
- Database persistence
- Matching with other users
- Real-time features / WebSockets
- Mobile app (native)
- Advanced analytics

---

## 3. Technical Architecture

### 3.1 Tech Stack

**Frontend:**
- React 18+
- React Router (for navigation)
- Gesture library: `react-spring` or `framer-motion`
- Styling: TailwindCSS or styled-components
- Session Storage API (built-in)

**Backend:**
- Node.js 20+ (required for Anthropic SDK)
- Express.js
- Axios (for Dog.CEO API calls)
- `@anthropic-ai/sdk` (Anthropic TypeScript SDK)
- Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)

**External APIs:**
- Dog.CEO API (https://dog.ceo/dog-api/)
- Anthropic Claude API (via @anthropic-ai/sdk)

**Development Tools:**
- Vite (React build tool)
- nodemon (backend hot reload)
- ESLint + Prettier

### 3.2 Project Structure

```
puppr/
├── client/                      # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── SwipeCard.jsx       # Main swipe card component
│   │   │   ├── ProfileOverlay.jsx  # Profile info display
│   │   │   ├── LikesGallery.jsx    # Liked dogs gallery
│   │   │   ├── Stats.jsx           # Statistics display
│   │   │   └── Navigation.jsx      # Nav bar
│   │   ├── services/
│   │   │   ├── api.js              # API client
│   │   │   ├── storage.js          # Session storage manager
│   │   │   └── queueManager.js     # Dog queue/buffer management
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                      # Node/Express backend
│   ├── routes/
│   │   └── dogs.js                 # Dog API routes
│   ├── services/
│   │   ├── dogCEOService.js        # Dog.CEO API integration
│   │   └── profileService.js       # LLM profile generation
│   ├── middleware/
│   │   └── errorHandler.js         # Error handling
│   ├── config/
│   │   └── environment.js          # Environment variables
│   ├── server.js                   # Express app
│   └── package.json
├── .env.example                 # Environment variables template
├── .gitignore
└── README.md
```

### 3.3 Architecture Diagram

```
┌─────────────────────────────┐
│   Browser (React)           │
│  ┌────────────────────────┐ │
│  │  Queue Manager         │ │
│  │  [Dog 1] ← Current     │ │
│  │  [Dog 2] ← Generating  │ │
│  │  [Dog 3] ← Generating  │ │
│  │  [Dog 4] ← Queued      │ │
│  │  [Dog 5] ← Queued      │ │
│  └────────┬───────────────┘ │
└───────────┼─────────────────┘
            │
            │ Async HTTP Requests (batch/parallel)
            │
┌───────────▼─────────────────┐
│  Express Server             │
│  ┌───────────────────────┐  │
│  │ Routes Layer          │  │
│  │ - Batch dog fetching  │  │
│  └───────┬───────────────┘  │
│          │                  │
│  ┌───────▼───────────────┐  │
│  │ Services:             │  │
│  │ - Dog.CEO (parallel)  │◄─┼─────► Dog.CEO API
│  │ - LLM Profile Queue   │◄─┼─────► OpenAI/Claude API
│  │ - Async generation    │  │       (parallel requests)
│  └───────────────────────┘  │
└─────────────────────────────┘

Flow:
1. Frontend queue manager requests 5 dogs
2. Backend fetches 5 dog images in parallel
3. Backend generates profiles asynchronously (can run in parallel)
4. Dogs returned as they're ready (streaming optional)
5. Frontend displays dog 1, generates 2-5 in background
6. When user swipes, next dog is instantly ready
7. Queue refills when buffer drops to 2 dogs
```

---

## 4. Data Models

### 4.1 Dog Profile Object
```typescript
interface DogProfile {
  id: string;                    // Unique identifier (timestamp + random)
  imageUrl: string;              // Dog.CEO image URL
  breed: string;                 // Extracted breed name
  subBreed?: string;             // Optional sub-breed
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

### 4.2 Dog Queue State (Frontend Memory)
```typescript
interface DogQueue {
  current: DogProfile | null;   // Currently displayed dog
  queue: DogProfile[];           // Next 4-5 dogs ready to display
  loading: boolean;              // Is queue being refilled
  error: string | null;          // Any queue-related errors
}

interface QueueStatus {
  size: number;                  // Current queue size
  isRefilling: boolean;          // Currently fetching more dogs
  minThreshold: number;          // Refill when queue drops below (default: 2)
  maxSize: number;               // Maximum queue size (default: 5)
}
```

### 4.3 Session Storage Schema

**Liked Dogs:**
```typescript
// Key: 'puppr_likes'
interface LikedDogs {
  dogs: DogProfile[];            // Array of liked dog profiles
  lastUpdated: number;           // Timestamp
}
```

**Statistics:**
```typescript
// Key: 'puppr_stats'
interface UserStats {
  totalSeen: number;             // Total dogs viewed
  totalLikes: number;            // Total right swipes
  totalPasses: number;           // Total left swipes
  breedCounts: {                 // Count per breed liked
    [breed: string]: number;
  };
  sessionStart: number;          // Session start timestamp
}
```

---

## 5. API Endpoints

### 5.1 Backend API Endpoints

#### GET `/api/dog/batch?count=5`
**Description:** Fetch multiple dogs with AI-generated profiles for queue preloading

**Query Parameters:**
- `count` (optional): Number of dogs to fetch (default: 5, max: 50)
- Note: Dog.CEO API supports up to 50 images per request, but we limit to 5-10 for optimal UX

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "1699383820123-abc",
      "imageUrl": "https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg",
      "breed": "golden retriever",
      "subBreed": null,
      "profile": {
        "name": "Charlie",
        "age": 4,
        "bio": "Athletic golden boy who believes every stranger is just a friend they haven't met yet.",
        "interests": ["Swimming", "Fetching (professionally)", "Making friends", "Belly rubs"],
        "lookingFor": "Someone who throws the ball... and then throws it again... and again",
        "traits": ["Loyal", "Energetic", "Friendly"]
      },
      "timestamp": 1699383820123
    },
    // ... 4 more dogs
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to fetch dog images",
  "partialData": []  // Any dogs that were successfully fetched
}
```

**Implementation Notes:**
- Uses Dog.CEO batch endpoint: `/api/breeds/image/random/{count}`
- Single API call fetches all requested dog images at once
- Generates AI profiles for each dog asynchronously
- Can return partial results if some requests fail
- Profile generation runs in parallel (up to 5 concurrent LLM requests)
- Backend handles rate limiting and retries
- Dog.CEO API supports up to 50 images per request (we use 5 by default)

#### GET `/api/dog/next` (Legacy - Optional)
**Description:** Fetch single dog with AI-generated profile (for fallback)

**Response:** Same as single item from `/api/dog/batch`

#### GET `/api/health`
**Description:** Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1699383820123
}
```

### 5.2 External API Calls

#### Dog.CEO API
```javascript
// Get single random dog image
GET https://dog.ceo/api/breeds/image/random

// Response:
{
  "message": "https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg",
  "status": "success"
}

// Get multiple random dog images (batch)
GET https://dog.ceo/api/breeds/image/random/5

// Response:
{
  "message": [
    "https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg",
    "https://images.dog.ceo/breeds/hound-afghan/n02088094_1007.jpg",
    "https://images.dog.ceo/breeds/husky/n02110185_10844.jpg",
    "https://images.dog.ceo/breeds/bulldog-french/n02108915_5306.jpg",
    "https://images.dog.ceo/breeds/corgi-cardigan/n02113186_8432.jpg"
  ],
  "status": "success"
}

// Maximum 50 images per request
// Images hosted on Vultr CDN
// API is cached via AWS Lambda for performance
```

**Breed-Specific Endpoints (Optional for future use):**
```javascript
// Get random image from specific breed
GET https://dog.ceo/api/breed/retriever/images/random

// Get multiple images from specific breed
GET https://dog.ceo/api/breed/husky/images/random/3

// Get images from sub-breed
GET https://dog.ceo/api/breed/hound/afghan/images/random/2
```

**Beta Features:**
```javascript
// Get images with alt text descriptions (accessibility)
GET https://dog.ceo/api/breeds/image/random/5/alt

// Returns additional metadata for accessibility
// Note: This is a beta feature and may change
```

#### Anthropic Claude API (via SDK)
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Generate profile
const message = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 500,
  temperature: 0.9,
  messages: [
    {
      role: 'user',
      content: `You create humorous dating profiles for dogs based on their breed.

Create a dating profile for a golden retriever. Return as JSON with this structure:
{
  "name": "string",
  "age": number,
  "bio": "string",
  "interests": ["string"],
  "lookingFor": "string",
  "traits": ["string"]
}`
    }
  ]
});

// Access response
console.log(message.content[0].text);
// Token usage tracking
console.log(message.usage); // { input_tokens: 125, output_tokens: 89 }
```

**SDK Features:**
- Built-in error handling with specific error types
- Automatic retries (2 attempts with exponential backoff)
- Configurable timeouts (10 minutes default)
- Token usage tracking via `message.usage`
- Full TypeScript support
- Request ID for debugging: `message._request_id`

---

## 6. User Flow

### 6.1 Main Flow (with Background Queue)

```
1. User opens app
   ↓
2. Initial loading state (only on first load)
   ↓
3. Queue manager fetches 5 dogs in batch
   ↓
4. First dog displays immediately when ready
   ↓ (while remaining 4 profiles generate in background)
5. User sees dog image + AI-generated profile
   ↓
6. User swipes left (pass) or right (like)
   ↓
7. Animation plays, NEXT DOG INSTANTLY APPEARS (from queue)
   ↓
8. Data stored in session storage
   ↓
9. Queue manager checks buffer (if ≤ 2 dogs, refill in background)
   ↓
10. Repeat from step 5 (no loading states!)

Background Process:
- When queue drops to 2 dogs → Fetch 3 more dogs
- Profile generation continues async while user swipes
- User never waits for API calls after initial load
```

### 6.2 Navigation Flow

```
┌─────────────┐
│   Home      │ ← Main swipe interface
│  (Swipe)    │
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
┌──▼──┐ ┌──▼──┐
│Likes│ │Stats│
└─────┘ └─────┘
```

### 6.3 Detailed User Stories

**Story 1: First-time User**
```
- User opens Puppr
- Sees brief loading state (2-3 seconds)
- Queue loads 5 dogs in background
- First dog card appears with profile
- User swipes right (likes the dog)
- Card animates away, next dog INSTANTLY appears (no loading!)
- User continues swiping smoothly
- Queue refills automatically in background
- User never sees loading state again
```

**Story 2: Viewing Liked Dogs**
```
- User navigates to "Likes" gallery
- Sees grid of all liked dogs
- Can click on a dog to see full profile again
- Can remove from likes (optional)
```

**Story 3: Checking Statistics**
```
- User navigates to "Stats" page
- Sees total dogs viewed, likes count
- Sees favorite breed based on likes
- Sees breakdown by breed
```

---

## 7. UI/UX Design

### 7.1 Component Specifications

#### SwipeCard Component
**Purpose:** Display dog image with swipeable card interface

**Features:**
- Full-screen card (mobile-first)
- Drag gesture detection
- Visual feedback (tilt, fade) while dragging
- Snap animations (complete swipe or return to center)
- Overlay indicators (✓ for like, ✗ for pass)

**States:**
- `idle`: Card at rest, ready for interaction
- `dragging`: User is swiping
- `swipedLeft`: Card exiting left
- `swipedRight`: Card exiting right
- `loading`: Fetching next dog

#### ProfileOverlay Component
**Purpose:** Display AI-generated profile on card

**Layout:**
```
┌─────────────────────┐
│                     │
│   [Dog Image]       │
│                     │
│                     │
├─────────────────────┤
│ 🐾 Charlie, 4       │
│                     │
│ Bio text here...    │
│                     │
│ 💼 Interests:       │
│ • Swimming          │
│ • Fetching          │
│                     │
│ 💭 Looking for...   │
│                     │
│ ✨ Traits: ...      │
└─────────────────────┘
```

**Styling:**
- Gradient overlay for readability
- Icon indicators
- Readable typography (18px+ bio text)
- Emoji for visual interest

#### LikesGallery Component
**Purpose:** Display all liked dogs

**Layout:**
- Grid layout (2-3 columns)
- Thumbnail images
- Dog name overlay
- Click to expand/view details

#### Stats Component
**Purpose:** Show user statistics

**Metrics:**
- Dogs seen: Large number display
- Likes: Percentage + count
- Favorite breed: Highlighted with image
- Breed breakdown: Simple bar chart or list

### 7.2 Design System

**Colors:**
```css
--primary: #FF6B6B;      /* Coral pink - like button */
--secondary: #4ECDC4;    /* Teal - accent */
--danger: #95E1D3;       /* Light teal - pass button */
--background: #F7F7F7;   /* Light gray */
--card: #FFFFFF;         /* White */
--text: #2C3E50;         /* Dark blue-gray */
--text-light: #7F8C8D;   /* Gray */
```

**Typography:**
```css
--font-primary: 'Inter', sans-serif;
--font-display: 'Poppins', sans-serif;

--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 24px;
--text-2xl: 32px;
```

**Spacing:**
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
```

### 7.3 Animations

**Swipe Animation:**
```javascript
// Left swipe
- Rotate: -30deg
- TranslateX: -150%
- Opacity: 0
- Duration: 300ms
- Easing: ease-out

// Right swipe
- Rotate: 30deg
- TranslateX: 150%
- Opacity: 0
- Duration: 300ms
- Easing: ease-out
```

**Card Enter:**
```javascript
- Scale: 0.8 → 1.0
- Opacity: 0 → 1
- Duration: 200ms
- Easing: ease-out
```

---

## 8. LLM Integration

### 8.1 Profile Generation Prompt

**System Prompt:**
```
You are a creative copywriter specializing in humorous dating profiles.
You create witty, engaging dating app profiles for dogs based on their breed characteristics.
The profiles should be funny but rooted in actual breed traits and temperaments.
Keep the tone light, playful, and family-friendly.
```

**User Prompt Template:**
```
Create a dating profile for a {breed} dog. {sub_breed_info}

Generate:
1. A creative, fitting name
2. An age between 1-10 years
3. A witty bio (2-3 sentences) that captures the breed's personality
4. 3-4 interests based on breed characteristics
5. A humorous "looking for" statement
6. 3 personality traits typical of the breed

Return as JSON with this structure:
{
  "name": "string",
  "age": number,
  "bio": "string",
  "interests": ["string"],
  "lookingFor": "string",
  "traits": ["string"]
}
```

**Example Breed Characteristics Reference:**
```javascript
const breedTraits = {
  "golden retriever": ["friendly", "loyal", "energetic", "loves swimming", "fetch enthusiast"],
  "husky": ["independent", "talkative", "energetic", "loves snow", "escape artist"],
  "bulldog": ["calm", "courageous", "friendly", "loves naps", "food motivated"],
  "border collie": ["intelligent", "energetic", "focused", "herding instinct", "workaholic"],
  // ... etc
};
```

### 8.2 Anthropic SDK Configuration

**Installation:**
```bash
npm install @anthropic-ai/sdk
```

**Client Setup:**
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 2,           // Default: 2 retries for transient failures
  timeout: 30 * 1000,      // 30 seconds (default is 10 minutes)
});
```

**Message Parameters:**
```typescript
const params: Anthropic.MessageCreateParams = {
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 500,
  temperature: 0.9,        // High creativity (0.0-1.0)
  messages: [
    { role: 'user', content: 'Your prompt here' }
  ]
};
```

**Error Handling:**
```typescript
import Anthropic from '@anthropic-ai/sdk';

try {
  const message = await client.messages.create(params);
} catch (err) {
  if (err instanceof Anthropic.APIError) {
    console.error('API Error:', err.status, err.message);
    // Handle specific error types:
    // - RateLimitError (429)
    // - AuthenticationError (401)
    // - BadRequestError (400)
    // - InternalServerError (>=500)
  }
  throw err;
}
```

**Token Usage Tracking:**
```typescript
const message = await client.messages.create(params);
console.log(`Tokens used: ${message.usage.input_tokens + message.usage.output_tokens}`);
// Track costs: input_tokens * $0.003 + output_tokens * $0.015 (per 1K tokens)
```

### 8.3 Async Profile Generation Strategy

**Parallel Generation with Anthropic SDK:**
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 2,
  timeout: 30 * 1000, // 30 seconds per profile
});

// Generate profiles for multiple dogs concurrently
async function generateBatchProfiles(dogs: DogImage[]) {
  const profilePromises = dogs.map(async (dog) => {
    try {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 500,
        temperature: 0.9,
        messages: [
          {
            role: 'user',
            content: createProfilePrompt(dog.breed, dog.subBreed)
          }
        ]
      });

      // Parse JSON response
      const profileText = message.content[0].text;
      const profile = JSON.parse(profileText);

      return {
        ...dog,
        profile,
        tokenUsage: message.usage,
        requestId: message._request_id
      };
    } catch (error) {
      console.error(`Profile generation failed for ${dog.breed}:`, error);
      // Return fallback profile on error
      return {
        ...dog,
        profile: getGenericProfile(dog.breed),
        error: true
      };
    }
  });

  // Wait for all profiles to complete (with fallbacks)
  return await Promise.all(profilePromises);
}
```

**Alternative: Message Batches API (for non-real-time use):**
```typescript
// Note: Message Batches are processed asynchronously
// Not suitable for real-time queue, but useful for background processing

const batch = await client.messages.batches.create({
  requests: dogs.map((dog, index) => ({
    custom_id: `dog-${index}-${dog.breed}`,
    params: {
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 500,
      temperature: 0.9,
      messages: [
        { role: 'user', content: createProfilePrompt(dog.breed, dog.subBreed) }
      ]
    }
  }))
});

// Poll for results (asynchronous, not real-time)
// const results = await client.messages.batches.results(batch.id);
```

**Concurrency Limits:**
- Maximum 5 parallel Anthropic API requests at once
- SDK handles retries automatically (2 attempts)
- Respect Anthropic rate limits (tier-based: varies by plan)
- Monitor usage via `message.usage` property

**Timeout Handling:**
- SDK default: 10 minutes (configurable via `timeout` option)
- Set custom timeout: 30 seconds per profile generation
- Fall back to generic profile if timeout exceeded
- Don't block entire batch for one slow request
- SDK automatically retries on timeout errors

### 8.4 Fallback Strategy

If LLM API fails:
1. Log error with details
2. Return generic profile template based on breed
3. Display to user with subtle "(Generic Profile)" indicator
4. Continue app functionality seamlessly
5. Retry failed profiles in background (optional)

---

## 9. Development Phases

### Phase 1: Foundation (Day 1)
**Goal:** Basic structure and dog image display

Tasks:
- [ ] Set up project structure (client + server)
- [ ] Configure Vite for React
- [ ] Set up Express server with CORS
- [ ] Create Dog.CEO API service
- [ ] Display single random dog image
- [ ] Basic routing and navigation

**Deliverable:** App displays random dog images

### Phase 2: Profile Generation & Queue System (Day 1-2)
**Goal:** AI-generated profiles with background queue working

Tasks:
- [ ] Set up LLM API integration
- [ ] Create profile generation service with async support
- [ ] Implement parallel profile generation (up to 5 concurrent)
- [ ] Create `/api/dog/batch` endpoint
- [ ] Parse breed from Dog.CEO image URL
- [ ] Test batch fetching and profile generation
- [ ] Create queue manager service (frontend)
- [ ] Implement queue refill logic (threshold: 2 dogs)
- [ ] Create ProfileOverlay component
- [ ] Display profile on dog card
- [ ] Test queue behavior (preloading, refilling)

**Deliverable:** Dogs have AI-generated profiles, queue system works seamlessly

### Phase 3: Swipe Mechanics with Queue Integration (Day 2)
**Goal:** Functional swipe interface with instant transitions

Tasks:
- [ ] Install gesture library (react-spring or framer-motion)
- [ ] Create SwipeCard component
- [ ] Implement drag gesture detection
- [ ] Add swipe animations (left/right)
- [ ] Integrate with queue manager (instant dog loading)
- [ ] Trigger queue refill on swipe (when threshold reached)
- [ ] Add visual feedback (tilt, opacity)
- [ ] Test rapid swiping (ensure queue keeps up)
- [ ] Add loading indicator only for initial load

**Deliverable:** Functional swipe interface with zero-latency transitions

### Phase 4: Data Persistence (Day 2-3)
**Goal:** Session storage for likes and stats

Tasks:
- [ ] Create session storage service
- [ ] Store liked dogs
- [ ] Track statistics (total seen, likes, breeds)
- [ ] Create LikesGallery component
- [ ] Create Stats component
- [ ] Add navigation between views

**Deliverable:** Users can save likes and view statistics

### Phase 5: Polish (Day 3)
**Goal:** Production-ready demo

Tasks:
- [ ] Add loading states
- [ ] Error handling and fallbacks
- [ ] Responsive design (mobile + desktop)
- [ ] UI polish (spacing, colors, typography)
- [ ] Add onboarding/instructions (optional)
- [ ] Performance optimization
- [ ] Testing across browsers

**Deliverable:** Polished, shareable demo

### Phase 6: Deployment (Day 3)
**Goal:** Live demo accessible via URL

Tasks:
- [ ] Environment variable configuration
- [ ] Deploy backend (Render, Railway, or Heroku)
- [ ] Deploy frontend (Vercel or Netlify)
- [ ] Test production build
- [ ] Create demo video/GIF
- [ ] Update README with live link

**Deliverable:** Live demo URL

---

## 10. Technical Considerations

### 10.1 Performance Optimization

**Background Queue System:**
- **Buffer Size:** Maintain 5 dogs in queue at all times
- **Refill Threshold:** When queue drops to 2 dogs, fetch 3 more in background
- **Parallel Fetching:** Use Dog.CEO batch endpoint (up to 50 images per request)
- **Async Profile Generation:** Generate profiles concurrently (max 5 parallel)
- **Single API Call:** Fetch all 5 dogs in one request to Dog.CEO API
- **Memory Management:** Clear processed dogs from memory after swipe
- **Preloading:** Preload images for all queued dogs using `<link rel="preload">`

**Queue Manager Implementation:**
```javascript
class DogQueueManager {
  constructor() {
    this.queue = [];
    this.current = null;
    this.maxSize = 5;
    this.refillThreshold = 2;
    this.isRefilling = false;
  }

  async initialize() {
    // Load initial batch of 5 dogs
    await this.refillQueue(5);
    this.current = this.queue.shift();
  }

  async getNextDog() {
    if (this.queue.length === 0) {
      // Emergency: queue empty, fetch immediately
      await this.refillQueue(1);
    }

    this.current = this.queue.shift();

    // Background refill if below threshold
    if (this.queue.length <= this.refillThreshold && !this.isRefilling) {
      this.refillQueue(3); // Non-blocking
    }

    return this.current;
  }

  async refillQueue(count) {
    this.isRefilling = true;
    try {
      const dogs = await fetchDogBatch(count);
      this.queue.push(...dogs);
      // Preload images for newly queued dogs
      dogs.forEach(dog => preloadImage(dog.imageUrl));
    } finally {
      this.isRefilling = false;
    }
  }
}
```

**Image Preloading:**
```javascript
function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// Preload all queued dogs
queueManager.queue.forEach(dog => preloadImage(dog.imageUrl));
```

**API Call Optimization:**
- Batch requests reduce API calls by 80% (1 batch call vs 5 individual)
- Dog.CEO API supports up to 50 images per request (we use 5)
- Profile generation runs in parallel, reducing wait time from ~25s to ~5s
- No debouncing needed since dogs are pre-generated
- Request cancellation for unmounted components
- Dog.CEO API is cached via AWS Lambda for fast responses

**Session Storage:**
- Limit likes to 100 dogs (or implement pagination)
- Compress data if needed
- Clear old session data
- Don't store queue in session (memory only)

### 10.2 Error Handling

**Dog.CEO API Failure:**
- Retry with exponential backoff (3 attempts)
- Show friendly error message
- Provide "Try Again" button

**LLM API Failure:**
- Use generic profile template
- Continue app functionality
- Log error for debugging

**Network Issues:**
- Detect offline state
- Show offline message
- Auto-retry when back online

### 10.3 Rate Limiting

**Dog.CEO API:**
- Very generous limits due to AWS Lambda caching infrastructure
- Images hosted on Vultr CDN for fast delivery
- No need for artificial delays between requests
- Maximum 50 images per single request
- API caches common requests for performance

**Anthropic API:**
- Rate limits vary by tier (Build: lower limits, Scale: higher limits, Enterprise: custom)
- Typical limits: 50 requests/minute (Build tier), higher for Scale/Enterprise
- Parallel generation: max 5 concurrent requests
- SDK handles retries automatically with exponential backoff
- Monitor rate limit headers in responses
- Consider caching profiles for same breed/image (optional)
- SDK throws `RateLimitError` (429) which is automatically retried

### 10.4 Security

**Environment Variables:**
- Never commit API keys
- Use `.env` file (git-ignored)
- Different keys for dev/prod

**CORS:**
- Configure proper CORS for frontend origin
- Restrict in production

**Input Validation:**
- Validate breed names
- Sanitize any user input (if added later)

---

## 11. Future Enhancements (Post-MVP)

### 11.1 v1.1: Enhanced UX
- [ ] Add gesture library (react-spring/framer-motion)
- [ ] Smooth drag-to-swipe
- [ ] Advanced animations
- [ ] Gradient overlays
- [ ] Super like feature (favorite breeds)
- [ ] Undo last swipe
- [ ] Keyboard shortcuts (arrow keys, space)
- [ ] Dark mode toggle
- [ ] Share dog profiles on social media
- [ ] Filter by breed size (small/medium/large)
- [ ] Accessibility: Use Dog.CEO alt tags beta feature for screen readers
- [ ] Breed-specific mode: Filter to show only certain breeds

### 11.2 v1.2: Background Queue
- [ ] 5-dog buffer system
- [ ] Parallel profile generation
- [ ] Automatic refilling
- [ ] Image preloading
- [ ] Queue memory management
- [ ] Advanced prefetching logic

### 11.3 v1.3: Statistics Dashboard
- [ ] Total dogs viewed
- [ ] Favorite breed tracking
- [ ] Swipe percentages
- [ ] Time spent
- [ ] Daily/weekly activity graphs
- [ ] Compare stats with friends
- [ ] Achievement system (badges)

### 11.4 v1.4: Persistent Storage
- [ ] Database backend
- [ ] User accounts
- [ ] Cross-device sync
- [ ] Match history
- [ ] Daily dog limit (gamification)
- [ ] Custom profile generation (adjust humor level)
- [ ] Breed information page (educational)

### 11.5 v1.5: Advanced Features
- [ ] React Router navigation
- [ ] Breed filtering
- [ ] Super like feature
- [ ] Share profiles
- [ ] Dark mode
- [ ] Multiple views/routes
- [ ] URL-based navigation

### 11.6 v2.0: Long-term Vision
- [ ] Match users with similar breed preferences
- [ ] Connect with local shelters (real adoption)
- [ ] Mobile app (React Native)
- [ ] AR mode (view dogs in your space)
- [ ] Dog quiz/personality test
- [ ] Community features (comments, ratings)

---

## 12. Success Metrics

### 12.1 Technical Metrics
- [ ] App loads in < 3 seconds (initial queue population)
- [ ] Swipe response time < 100ms (instant after initial load)
- [ ] Batch profile generation < 10 seconds for 5 dogs (parallel)
- [ ] Zero latency between swipes (after initial load)
- [ ] Queue never runs empty during normal use
- [ ] Zero console errors in production
- [ ] Works on mobile + desktop
- [ ] 90+ Lighthouse performance score

### 12.2 Demo Metrics
- [ ] Engaging enough for 5+ minute session
- [ ] Users understand functionality immediately
- [ ] Generates laughter/positive emotion
- [ ] Shareable on social media
- [ ] Clear showcase of full-stack skills

---

## 13. Development Environment

### 13.1 Required Tools
- Node.js 20+ (required for @anthropic-ai/sdk)
- npm or yarn
- Git
- Code editor (VS Code recommended)
- Browser with React DevTools
- Anthropic API key (sign up at https://console.anthropic.com/)

### 13.2 Environment Variables

**Backend `.env`:**
```bash
PORT=3001
NODE_ENV=development

# Anthropic API
ANTHROPIC_API_KEY=your_key_here

# Optional
CORS_ORIGIN=http://localhost:5173
```

**Frontend `.env`:**
```bash
VITE_API_URL=http://localhost:3001
```

### 13.3 Installation & Running

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

---

## 14. Risk Assessment

### 14.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|---------|------------|
| Anthropic API rate limits | Medium | Medium | Parallel generation (max 5), SDK auto-retry, fallback profiles, tier-appropriate limits |
| Anthropic API costs | Medium | Low | Token usage tracking, max_tokens limit (500), monitor via usage property |
| Dog.CEO API downtime | Low | High | Error handling, retry logic, partial batch returns |
| Slow profile generation | Low | Low | Background queue eliminates user-facing delays |
| Queue running empty | Low | Medium | Proactive refill at threshold, emergency single fetch |
| Memory issues from large queue | Low | Low | Clear old dogs, limit max queue size to 5 |
| Mobile responsiveness issues | Low | Medium | Test early, mobile-first design |

### 14.2 Scope Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|---------|------------|
| Feature creep | High | High | Stick to MVP spec strictly |
| Over-engineering | Medium | Medium | Time-box each phase |
| Perfectionism delay | Medium | Medium | "Done is better than perfect" mindset |

---

## 15. Testing Strategy

### 15.1 Manual Testing Checklist

**Core Functionality:**
- [ ] Initial queue loads 5 dogs on app start
- [ ] First dog displays within 3 seconds
- [ ] Swipe left removes dog, next appears instantly
- [ ] Swipe right saves to likes, next appears instantly
- [ ] Profile displays correctly
- [ ] Queue refills automatically in background
- [ ] Navigation works (Home/Likes/Stats)
- [ ] Likes gallery shows saved dogs
- [ ] Stats display correctly

**Queue System:**
- [ ] Queue maintains 5 dogs buffer
- [ ] Refill triggers at 2 dogs remaining
- [ ] Parallel profile generation works
- [ ] Preloading images works correctly
- [ ] Queue never runs empty during normal use
- [ ] Memory management (old dogs cleared)

**Edge Cases:**
- [ ] Rapid swiping doesn't break app or empty queue
- [ ] API failure shows error message, queue continues with available dogs
- [ ] Partial batch failures handled gracefully
- [ ] LLM timeout fallback to generic profiles
- [ ] No liked dogs state (empty gallery)
- [ ] Session storage cleared
- [ ] Refresh maintains likes/stats (but resets queue)

**Browser/Device:**
- [ ] Chrome (desktop)
- [ ] Safari (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (mobile)
- [ ] Responsive at all breakpoints

### 15.2 Automated Testing (Optional)

If time permits:
- Unit tests for utility functions
- Component tests for SwipeCard
- API endpoint tests
- E2E tests with Cypress

---

## 16. Documentation

### 16.1 Code Documentation
- JSDoc comments for complex functions
- README with setup instructions
- API endpoint documentation
- Environment variables guide

### 16.2 User Documentation
- Optional onboarding screen
- How to swipe instructions
- About page (explain the app)

---

## 17. Deployment Strategy

### 17.1 Backend Deployment (Render/Railway)
1. Create account on Render.com or Railway.app
2. Connect GitHub repository
3. Configure environment variables
4. Deploy from main branch
5. Test production API

### 17.2 Frontend Deployment (Vercel/Netlify)
1. Create account on Vercel or Netlify
2. Connect GitHub repository
3. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Set environment variables (API URL)
5. Deploy from main branch

### 17.3 Domain (Optional)
- Use provided subdomain (free)
- Or configure custom domain

---

## 18. License & Attribution

### 18.1 API Attribution
- Dog images: Dog.CEO API (MIT License)
- Profiles: AI-generated (not real dogs)

### 18.2 Project License
- MIT License (recommended for portfolio projects)

---

## 19. Appendix

### 19.1 Useful Resources

**Dog.CEO API:**
- Official Docs: https://dog.ceo/dog-api/documentation/
- GitHub Repo: https://github.com/ElliottLandsborough/dog-ceo-api
- API Features:
  - 20,000+ dog images across 120+ breeds
  - Cached via AWS Lambda for performance
  - Images hosted on Vultr CDN
  - Beta alt text feature for accessibility
  - Max 50 images per request
- To contribute images: https://github.com/jigsawpieces/dog-api-images

**Anthropic API & SDK:**
- Official Docs: https://docs.anthropic.com/
- TypeScript SDK: https://github.com/anthropics/anthropic-sdk-typescript
- API Reference: https://docs.anthropic.com/claude/reference/
- Package: `@anthropic-ai/sdk`
- Models: Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- Features:
  - Built-in retries and error handling
  - Token usage tracking
  - Full TypeScript support
  - Streaming support (optional)
  - Message Batches API for async processing
- Pricing: https://www.anthropic.com/pricing

**React Resources:**
- React Spring: https://www.react-spring.dev/
- Framer Motion: https://www.framer.com/motion/

**Design Inspiration:**
- Tinder UI patterns
- Dating app interfaces
- Card-based UIs

### 19.2 Breed Information Sources
- AKC Breed Characteristics
- Wikipedia breed pages
- Dog training websites

### 19.3 Prompt Engineering Examples

**Funny Breed Profiles:**
```
Golden Retriever: "Professional good boy seeking someone to throw ball indefinitely"
Husky: "Dramatic vocalist looking for someone who appreciates my opinions on everything"
Chihuahua: "Small but mighty. BIG personality in a portable package"
Corgi: "Low-rider with a royal attitude. Queen Elizabeth was a fan"
```

---

## 20. Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-07 | 1.0 | Initial specification created | - |
| 2025-11-07 | 1.1 | Added background queue system with buffer of 5 dogs, async profile generation, batch API endpoint, queue manager service | - |
| 2025-11-07 | 1.2 | Updated with accurate Dog.CEO API information from official repo: batch endpoint details, caching infrastructure, rate limits, alt tags beta feature | - |
| 2025-11-07 | 1.3 | Integrated Anthropic SDK TypeScript (@anthropic-ai/sdk): Claude Sonnet 4.5, built-in retries, error handling, token tracking, full TypeScript support. Updated all LLM sections with SDK-specific implementation details. | - |

---

## Notes for Iteration

**Questions to Consider:**
1. Should we add sound effects for swipes?
2. Profile photo for the dog's "dating profile" vs just the dog image?
3. Match percentage (random, for humor)?
4. "Today's picks" - curated selection?
5. Breed filter before swiping starts?

**Feedback Space:**
- [ ] Review technical architecture
- [ ] Validate feature scope
- [ ] Confirm design direction
- [ ] Approve before implementation

---

**Status:** ✅ Ready for review and iteration
**Next Step:** Review spec, iterate on any sections, then begin Phase 1 development
