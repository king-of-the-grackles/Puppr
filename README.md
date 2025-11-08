# Puppr

**AI-Powered Dog Dating Swipe App** - A playful rapid prototype demo application

[![Status](https://img.shields.io/badge/status-specification%20phase-yellow)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

## Overview

Puppr is a proof-of-concept application that combines dating app mechanics with AI-generated dog personality profiles. Users swipe through randomly generated dog profiles, each with unique personalities created by Claude AI, providing an engaging and entertaining experience.

**Current Status:** 🚧 Specification Phase - Implementation pending

## Features (Planned)

- **AI-Generated Dog Profiles**: Unique personalities created by Claude Sonnet 4.5
- **Swipe Interface**: Tinder-style card swipe mechanics with gesture support
- **Random Dog Images**: Powered by the Dog.CEO API
- **Match System**: Collect matches and view your matched dogs
- **Responsive Design**: Mobile-first, works on all devices

## Technology Stack

### Frontend
- **React 18+** - UI framework
- **React Router** - Navigation
- **Framer Motion** or **React Spring** - Gesture handling & animations
- **TailwindCSS** or **styled-components** - Styling
- **Vite** - Build tool

### Backend
- **Node.js 20+** - Runtime environment
- **Express.js** - Web framework
- **Axios** - HTTP client
- **@anthropic-ai/sdk** - Claude API integration

### External APIs
- **Dog.CEO API** - Random dog images
- **Anthropic Claude API** - AI personality generation (Claude Sonnet 4.5)

### Development Tools
- Vite
- nodemon
- ESLint
- Prettier

## Project Structure

```
Puppr/
├── .env.sample          # Environment variable template
├── specs/               # Project specifications
│   └── mvp-specification.md
├── ai-docs/             # API reference documentation
│   ├── anthropic-sdk-typescript/
│   └── dog-ceo-api/
└── README.md
```

## Getting Started

> **Note:** This project is currently in the specification phase. The implementation structure below is planned but not yet created.

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Puppr.git
   cd Puppr
   ```

2. Copy the environment template:
   ```bash
   cp .env.sample .env
   ```

3. Add your Anthropic API key to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-your-api-key-here
   ```

4. Install dependencies (once implemented):
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

### Running the Application

Once implemented, the application will run with:

```bash
# Start backend server
cd server
npm run dev

# Start frontend (in a new terminal)
cd client
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3001`.

## Documentation

- **MVP Specification**: See [`specs/mvp-specification.md`](specs/mvp-specification.md) for complete feature details and technical requirements
- **API Documentation**: Reference docs are available in the `ai-docs/` directory

## Development Roadmap

- [x] Create project specification
- [ ] Set up project structure (monorepo with client/server)
- [ ] Implement backend API
- [ ] Implement frontend components
- [ ] Integrate Claude API for personality generation
- [ ] Implement swipe mechanics
- [ ] Add match collection system
- [ ] Testing and refinement

## Contributing

This is a rapid prototype demo project. Feel free to fork and experiment!

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ and AI**
