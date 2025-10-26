import { z } from "zod";

// Story Schema for interactive story simulations
export const StorySchema = z.object({
  title: z.string().describe("The title of the story"),
  description: z.string().describe("A brief description of the story"),
  genre: z
    .string()
    .describe(
      "The genre of the story (e.g., fantasy, sci-fi, mystery, adventure)",
    ),
  setting: z
    .string()
    .describe("The world/environment where the story takes place"),
  initialScene: z
    .string()
    .describe("The opening scene description for the story"),
  characters: z
    .array(
      z.object({
        name: z.string(),
        role: z.string().describe("The character's role in the story"),
        personality: z.string().describe("Key personality traits"),
        backstory: z.string().describe("Character background and motivation"),
      }),
    )
    .describe("Available characters for the user to play as"),
  storyArc: z
    .object({
      beginning: z.string().describe("How the story begins"),
      conflict: z.string().describe("The main conflict or challenge"),
      climax: z.string().describe("The peak dramatic moment"),
      resolution: z.string().describe("How the story concludes"),
    })
    .describe("The overall story structure"),
  estimatedTurns: z
    .number()
    .describe("Expected number of turns to complete the story"),
  imageStyle: z
    .string()
    .optional()
    .describe(
      "Visual style for generated images (e.g., 'cinematic', 'anime', 'realistic')",
    ),
  tone: z
    .string()
    .optional()
    .describe(
      "The tone of the story (e.g., 'dark', 'lighthearted', 'mysterious')",
    ),
});

export type Story = z.infer<typeof StorySchema>;

// Extended simulation schema that includes story-specific fields
export const StorySimulationSchema = z.object({
  type: z.literal("story"),
  story: StorySchema,
  // Include other simulation fields as needed
  name: z.string(),
  description: z.string(),
  status: z.string().default("active"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type StorySimulation = z.infer<typeof StorySimulationSchema>;

// Turn data structure for story progression
export const TurnDataSchema = z.object({
  id: z.string(),
  run_id: z.string(),
  turn_number: z.number(),
  user_prompt: z.string(),
  ai_response: z.string(),
  image_url: z.string().optional(),
  image_prompt: z.string().optional(),
  suggested_options: z.array(z.string()).optional(),
  created_at: z.string(),
});

export type TurnData = z.infer<typeof TurnDataSchema>;

// Run data structure
export const RunDataSchema = z.object({
  id: z.string(),
  simulation_id: z.string(),
  status: z
    .string()
    .describe("Run status (e.g., active, completed, abandoned)"),
  current_turn: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type RunData = z.infer<typeof RunDataSchema>;

// Video data structure
export const VideoDataSchema = z.object({
  id: z.string(),
  run_id: z.string(),
  video_url: z.string().optional(),
  status: z
    .string()
    .describe("Video status (e.g., generating, completed, failed)"),
  generation_prompt: z.string().optional(),
  created_at: z.string(),
  completed_at: z.string().optional(),
});

export type VideoData = z.infer<typeof VideoDataSchema>;
