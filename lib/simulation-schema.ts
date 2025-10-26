import { z } from "zod";

// Simulation Schema for AI Object Generation
export const SimulationSchema = z.object({
  name: z.string().describe("The name of the simulation"),
  description: z
    .string()
    .describe("A detailed description of what the simulation does"),
  type: z.string().describe("The primary type/category of simulation"),
  genre: z
    .string()
    .optional()
    .describe(
      'Specific genre or subcategory (e.g., "space exploration", "medical training", "flight simulator")',
    ),

  // Core Simulation Components
  environment: z.object({
    setting: z
      .string()
      .describe("The world/environment where the simulation takes place"),
    atmosphere: z
      .string()
      .describe("The mood, tone, or atmosphere of the environment"),
    scale: z
      .enum(["small", "medium", "large", "massive"])
      .describe("The scope and scale of the simulation"),
    timePeriod: z
      .string()
      .optional()
      .describe("Historical period, future era, or time setting"),
  }),

  // Interactive Elements
  characters: z
    .array(
      z.object({
        name: z.string(),
        role: z
          .string()
          .describe("The character's role or function in the simulation"),
        personality: z.string().optional(),
        abilities: z.array(z.string()).optional(),
      }),
    )
    .optional()
    .describe("Characters, NPCs, or entities in the simulation"),

  objectives: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        type: z
          .string()
          .describe(
            "Type of objective (e.g., primary, secondary, optional, hidden)",
          ),
        difficulty: z
          .string()
          .optional()
          .describe("Difficulty level (e.g., easy, medium, hard, expert)"),
      }),
    )
    .describe("Goals, missions, or objectives in the simulation"),

  // Technical Specifications
  mechanics: z.object({
    interaction: z
      .array(z.string())
      .describe("How users interact with the simulation"),
    progression: z
      .string()
      .describe("How users advance or progress through the simulation"),
    feedback: z
      .array(z.string())
      .describe("Types of feedback provided to users"),
    difficulty: z
      .enum(["beginner", "intermediate", "advanced", "adaptive"])
      .describe("Overall difficulty level"),
  }),

  // Visual and Audio Elements
  presentation: z.object({
    visualStyle: z.string().describe("Visual art style or aesthetic"),
    audioElements: z
      .array(z.string())
      .optional()
      .describe("Sound effects, music, or audio features"),
    uiElements: z
      .array(z.string())
      .optional()
      .describe("User interface components and design"),
  }),

  // Learning and Educational Aspects
  educational: z.object({
    learningOutcomes: z
      .array(z.string())
      .optional()
      .describe("What users will learn from this simulation"),
    targetAudience: z.string().describe("Who this simulation is designed for"),
    prerequisites: z
      .array(z.string())
      .optional()
      .describe("Required knowledge or skills"),
    assessment: z
      .string()
      .optional()
      .describe("How learning is measured or assessed"),
  }),

  // Implementation Details
  implementation: z.object({
    platform: z
      .array(z.string())
      .describe("Target platforms (web, mobile, desktop, VR, etc.)"),
    technology: z
      .array(z.string())
      .optional()
      .describe("Required technologies or frameworks"),
    estimatedDuration: z
      .string()
      .optional()
      .describe("Expected time to complete or play through"),
    multiplayer: z
      .boolean()
      .optional()
      .describe("Whether the simulation supports multiple users"),
  }),

  // Additional Features
  features: z
    .array(z.string())
    .optional()
    .describe("Special features, capabilities, or unique aspects"),
  constraints: z
    .array(z.string())
    .optional()
    .describe("Limitations, requirements, or constraints"),

  // Metadata
  tags: z.array(z.string()).describe("Keywords and tags for categorization"),
  complexity: z
    .enum(["simple", "moderate", "complex", "enterprise"])
    .describe("Overall complexity level"),
});

export type Simulation = z.infer<typeof SimulationSchema>;

// AI Elements Components Schema
export const AIElementsSchema = z.object({
  components: z
    .array(
      z.object({
        name: z.string().describe("Name of the AI Elements component"),
        usage: z
          .string()
          .describe("How this component is used in the simulation"),
        props: z
          .record(z.any())
          .optional()
          .describe("Configuration properties for the component"),
      }),
    )
    .describe(
      "AI Elements components that would be useful for this simulation",
    ),

  interactions: z
    .array(
      z.object({
        type: z
          .string()
          .describe("Type of interaction (chat, voice, gesture, etc.)"),
        component: z
          .string()
          .describe("Which AI Elements component handles this interaction"),
        description: z
          .string()
          .describe("How this interaction works in the simulation"),
      }),
    )
    .describe("User interactions enabled by AI Elements"),
});

export type AIElementsUsage = z.infer<typeof AIElementsSchema>;

// Combined Schema for Complete Simulation Generation
export const CompleteSimulationSchema = z.object({
  simulation: SimulationSchema,
  aiElements: AIElementsSchema,
  implementation: z.object({
    priority: z
      .enum(["low", "medium", "high"])
      .describe("Implementation priority"),
    estimatedEffort: z.string().describe("Estimated development effort"),
    recommendations: z
      .array(z.string())
      .describe("Implementation recommendations and next steps"),
  }),
});

export type CompleteSimulation = z.infer<typeof CompleteSimulationSchema>;
