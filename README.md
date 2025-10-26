# `holosuite.lol`

A platform for creating and sharing immersive simulation experiences powered by AI.

## Technical Overview

Holosuite.lol is a Next.js-based web application that enables users to create interactive simulations through natural language prompts. The platform leverages Google's Gemini AI model to generate comprehensive simulation specifications, character holograms, and dynamic story experiences. Users can create simulations, interact with AI-generated characters, and experience immersive story-driven adventures.

## Technology Stack

### Frontend

- **Next.js 16.0.0** - React framework with App Router
- **React 19.2.0** - UI library with latest features
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Motion** - Animation library
- **React Syntax Highlighter** - Code display

### Backend & AI

- **Google Gemini 2.5-flash** - Primary AI model for simulation generation
- **AI SDK** - Vercel's AI SDK for model integration
- **Neon Database** - Serverless PostgreSQL database
- **Zod** - Schema validation
- **Nanoid** - UUID generation

### Database

- **PostgreSQL** (via Neon) - Primary data storage
- **Tables**: simulations, messages, holograms, runs, turns, videos
- **Features**: Full-text search, relational data, JSON storage

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PostCSS** - CSS processing
- **TypeScript** - Static type checking

## Data Flow & Pipeline

### 1. Simulation Creation Flow

```
User Input (Natural Language)
    ↓
Frontend (PromptSubmission Component)
    ↓
POST /api/simulations
    ↓
AI Service (Google Gemini 2.5-flash)
    ↓
Simulation Schema Validation (Zod)
    ↓
Database Storage (Neon PostgreSQL)
    ↓
Response with Simulation ID
    ↓
Redirect to Simulation Page
```

### 2. Story Simulation Pipeline

```
Story Simulation Selection
    ↓
Hologram Generation (AI Service)
    ↓
Character Creation & Storage
    ↓
Run Initialization
    ↓
Turn-based Interaction Loop:
    ├── User Input
    ├── AI Response Generation
    ├── Image Generation (Optional)
    ├── Turn Storage
    └── Next Turn Prompt
    ↓
Video Generation (Optional)
```

### 3. Database Architecture

```
simulations (Core simulation data)
    ├── messages (Chat history)
    ├── holograms (AI characters)
    └── runs (Story sessions)
        ├── turns (Individual interactions)
        └── videos (Generated highlights)
```

### 4. AI Integration Points

- **Simulation Generation**: Natural language → Structured simulation specs
- **Hologram Creation**: Character descriptions → AI personalities
- **Story Responses**: User actions → Contextual AI responses
- **Image Generation**: Scene descriptions → Visual content
- **Video Generation**: Story highlights → Video summaries

### 5. API Endpoints

- `GET/POST /api/simulations` - List/create simulations
- `GET/POST/PATCH /api/simulations/[id]` - Manage individual simulations
- `POST /api/simulations/[id]/holograms` - Generate AI characters
- `POST /api/simulations/[id]/runs` - Start story sessions
- `POST /api/simulations/[id]/runs/[run_id]/turns` - Process story turns
- `GET/POST /api/videos` - Handle video generation

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Setup

Required environment variables:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google AI API key

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

Created with 🧸 at [Cal Hacks 12](https://cal-hacks-12-0.devpost.com/)
