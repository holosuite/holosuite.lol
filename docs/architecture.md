# Holosuite Architecture Documentation

## Overview

Holosuite is a Next.js-based interactive simulation platform that combines AI-powered story generation, image creation, and video production. The application enables users to create, run, and experience dynamic simulations with AI-generated content.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React UI      │    │ • REST APIs     │    │ • Google GenAI  │
│ • State Mgmt    │    │ • Database      │    │ • Vercel Blob   │
│ • Real-time     │    │ • AI Services   │    │ • Neon DB       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Components

### 1. Frontend Architecture

#### Framework & Technologies
- **Next.js 14+**: App Router with Server-Side Rendering
- **React 18**: Client-side components with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon system

#### Key Frontend Patterns
- **Server Components**: For initial data loading and SEO
- **Client Components**: For interactive features (`"use client"`)
- **Custom Hooks**: State management and API interactions
- **Component Composition**: Reusable UI components

#### Directory Structure
```
app/
├── page.tsx                    # Landing page
├── simulations/                 # Simulation management
│   ├── [simulation_id]/        # Individual simulation
│   └── [simulation_id]/runs/   # Run management
├── api/                        # API routes
│   ├── simulations/            # Simulation CRUD
│   ├── videos/                 # Video management
│   └── migrate-*/              # Database migrations
└── globals.css                 # Global styles

components/
├── ui/                         # Base UI components
├── ai-elements/                # AI-specific components
├── editable-title.tsx          # Custom editable component
└── simulation-*.tsx            # Simulation-specific components
```

### 2. Backend Architecture

#### API Design
- **RESTful APIs**: Following REST conventions
- **Type Safety**: TypeScript interfaces for all data structures
- **Error Handling**: Consistent error responses
- **Validation**: Request/response validation

#### API Route Structure
```
/api/
├── simulations/
│   ├── route.ts                # GET (list), POST (create)
│   ├── [id]/
│   │   ├── route.ts           # GET, PATCH (individual sim)
│   │   ├── runs/
│   │   │   ├── route.ts       # GET, POST (runs)
│   │   │   └── [run_id]/
│   │   │       ├── route.ts   # GET, PATCH (individual run)
│   │   │       ├── turns/     # Turn management
│   │   │       └── video/     # Video generation
│   └── [id]/runs/[run_id]/video/
└── videos/
    ├── route.ts               # Video listing
    └── [video_id]/
        ├── download/          # Video download
        └── stream/            # Video streaming
```

### 3. Database Architecture

#### Database Technology
- **Neon Serverless PostgreSQL**: Primary database
- **Vercel Postgres SDK**: Database connection and queries
- **SQL**: Raw SQL queries with template literals

#### Schema Design
```sql
-- Core entities
simulations (id, simulation_object, status, created_at, updated_at)
runs (id, simulation_id, status, current_turn, title, created_at, updated_at)
turns (id, run_id, turn_number, user_prompt, ai_response, image_url, image_prompt, suggested_options, created_at)
messages (id, simulation_id, content, from_role, created_at)
videos (id, run_id, video_url, status, created_at, updated_at)
```

#### Data Models
- **SimulationModel**: Core simulation management
- **RunModel**: Individual simulation runs
- **TurnModel**: Story progression turns
- **VideoModel**: Generated video content
- **MessageModel**: Chat/conversation history

### 4. AI Services Architecture

#### AI Service Layer
```typescript
// Service pattern with singleton instances
class AIService {
  private static instance: AIService;
  static getInstance(): AIService;
}
```

#### AI Services
1. **SimulationService** (`lib/ai-simulation-service.ts`)
   - Generates simulation content using AI SDK
   - Uses `generateObject()` with Zod schemas
   - Creates structured simulation data

2. **ImageService** (`lib/ai-image-service.ts`)
   - Google Imagen 4.0 integration
   - Generates scene images for each turn
   - Handles image prompts and consistency

3. **VideoService** (`lib/ai-video-service.ts`)
   - Google Veo 3.1 integration
   - Creates highlight videos from story turns
   - Manages video generation lifecycle

#### AI Integration Patterns
- **Prompt Engineering**: Structured prompts for consistent output
- **Schema Validation**: Zod schemas for type safety
- **Error Handling**: Graceful fallbacks for AI failures
- **Rate Limiting**: Built-in API rate limiting
- **Caching**: Response caching for performance

### 5. External Service Integration

#### Google GenAI Services
```typescript
// Image Generation
this.ai.models.generateImages({
  model: "imagen-4.0-generate-001",
  prompt: imagePrompt,
  config: { numberOfImages: 1 }
});

// Video Generation
this.ai.models.generateVideos({
  model: "veo-3.1-generate-preview",
  prompt: videoPrompt,
  imageReferences: imageRefs
});
```

#### Vercel Blob Storage
- **File Storage**: Persistent video and image storage
- **CDN Integration**: Fast global content delivery
- **Access Control**: Public/private file access

#### Environment Configuration
```env
DATABASE_URL=postgresql://...
GOOGLE_GENAI_API_KEY=...
NEXT_PUBLIC_APP_URL=...
```

## Data Flow Architecture

### 1. Simulation Creation Flow
```
User Input → AI Simulation Service → Database → Frontend Display
     ↓
Generate Initial Content → Create Run → Generate First Turn
```

### 2. Turn Progression Flow
```
User Action → Turn API → AI Response → Image Generation → Database Update
     ↓
Update UI → Show New Content → Generate Next Options
```

### 3. Video Generation Flow
```
Completed Run → Extract Turns → Generate Video Prompt → Veo API
     ↓
Poll Status → Download Video → Store in Blob → Update Database
```

## Security Architecture

### Authentication & Authorization
- **No Authentication**: Currently public access
- **API Rate Limiting**: Built into AI services
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Parameterized queries

### Data Protection
- **Environment Variables**: Sensitive data in env vars
- **API Key Management**: Secure key storage
- **Database Security**: Connection string protection

## Performance Architecture

### Optimization Strategies
1. **Server-Side Rendering**: Initial page loads
2. **Client-Side Hydration**: Interactive features
3. **Image Optimization**: Next.js Image component
4. **Lazy Loading**: Component-level lazy loading
5. **Caching**: API response caching

### Scalability Considerations
- **Serverless Architecture**: Auto-scaling with Vercel
- **Database Connection Pooling**: Neon serverless
- **CDN Integration**: Vercel Blob for static assets
- **API Rate Limiting**: Prevent abuse

## Development Architecture

### Code Organization
- **Feature-Based Structure**: Components grouped by feature
- **Shared Utilities**: Common functions in `/lib`
- **Type Definitions**: Centralized TypeScript types
- **API Layer**: Separated API logic from UI

### Development Patterns
- **Custom Hooks**: Reusable state logic
- **Component Composition**: Flexible UI building
- **Error Boundaries**: Graceful error handling
- **Loading States**: User feedback during operations

### Testing Strategy
- **Manual Testing**: Browser-based testing
- **API Testing**: Direct API endpoint testing
- **Integration Testing**: End-to-end workflows

## Deployment Architecture

### Hosting Platform
- **Vercel**: Primary hosting platform
- **Edge Functions**: Serverless API routes
- **Static Assets**: CDN-delivered content
- **Environment Management**: Vercel environment variables

### Database Hosting
- **Neon Serverless**: PostgreSQL hosting
- **Connection Pooling**: Automatic scaling
- **Backup Strategy**: Automated backups

### File Storage
- **Vercel Blob**: File storage and CDN
- **Image Optimization**: Automatic image processing
- **Video Streaming**: Optimized video delivery

## Monitoring & Observability

### Logging Strategy
- **Console Logging**: Development debugging
- **Error Tracking**: Client-side error capture
- **API Monitoring**: Request/response logging

### Performance Monitoring
- **Vercel Analytics**: Built-in performance metrics
- **Core Web Vitals**: User experience metrics
- **API Response Times**: Backend performance tracking

## Future Architecture Considerations

### Scalability Improvements
1. **Authentication System**: User management
2. **Caching Layer**: Redis for session management
3. **Message Queue**: Background job processing
4. **Microservices**: Service decomposition

### Feature Enhancements
1. **Real-time Updates**: WebSocket integration
2. **Collaborative Features**: Multi-user simulations
3. **Advanced AI**: Custom model fine-tuning
4. **Analytics Dashboard**: Usage insights

### Technical Debt
1. **Error Handling**: Comprehensive error boundaries
2. **Testing Coverage**: Automated test suite
3. **Documentation**: API documentation
4. **Performance**: Bundle size optimization

## Key Architectural Decisions

### 1. Next.js App Router
**Decision**: Use Next.js 14+ App Router over Pages Router
**Rationale**: Better performance, improved developer experience, built-in optimizations

### 2. Serverless Architecture
**Decision**: Deploy on Vercel with serverless functions
**Rationale**: Auto-scaling, cost-effective, zero maintenance

### 3. PostgreSQL with Neon
**Decision**: Use PostgreSQL over NoSQL databases
**Rationale**: ACID compliance, complex queries, relational data structure

### 4. Google GenAI Integration
**Decision**: Use Google's AI services over OpenAI
**Rationale**: Better image/video generation, competitive pricing, comprehensive API

### 5. TypeScript Throughout
**Decision**: Use TypeScript for all code
**Rationale**: Type safety, better developer experience, reduced runtime errors

---

*This architecture documentation should be updated as the system evolves and new features are added.*
