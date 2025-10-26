import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import {
  CompleteSimulationSchema,
  type CompleteSimulation,
} from "./simulation-schema";

// AI service for generating simulation objects from natural language
export class SimulationGenerator {
  private getModel() {
    // Use Google Gemini 2.5-flash
    return google("gemini-2.5-flash");
  }

  async generateSimulation(prompt: string): Promise<CompleteSimulation> {
    console.log("🎯 generateSimulation called with prompt:", prompt);
    console.log(
      "🔑 Using Google Gemini 2.5-flash for production AI generation",
    );

    const systemPrompt = `You are an expert simulation designer and AI application architect specializing in creating immersive, interactive experiences.

Your expertise includes:
- Game design and simulation mechanics
- Educational technology and learning outcomes
- AI-powered user interfaces and interactions
- Technical implementation planning

When analyzing natural language descriptions, create comprehensive simulation specifications that include:

1. **Detailed Simulation Design**: 
   - Environment, characters, objectives, and mechanics
   - Educational aspects and learning outcomes
   - User experience and engagement strategies

2. **AI Elements Integration**: 
   - Identify relevant AI Elements components from the library
   - Suggest interactive components for enhanced user experience
   - Consider conversation, message, branch, canvas, and tool components

3. **Implementation Guidance**: 
   - Realistic development estimates
   - Technical requirements and recommendations
   - Priority and complexity assessments

Focus on creating engaging, educational, and technically feasible simulations that leverage modern AI capabilities for interactive experiences.`;

    const userPrompt = `Create a comprehensive simulation specification for: "${prompt}"

Please analyze this request and generate:
1. A detailed simulation design with all required components
2. Appropriate AI Elements components that would be useful for implementation
3. Implementation recommendations and next steps

Make sure to consider the interactive, AI-powered nature of modern simulations and how AI Elements can enhance the user experience.`;

    try {
      // Test with a simple schema first
      const testSchema = z.object({
        name: z.string(),
        description: z.string(),
      });

      console.log("🔍 Testing simple schema first:", {
        testSchemaType: typeof testSchema,
        testSchemaParse: typeof testSchema.parse,
        completeSchemaType: typeof CompleteSimulationSchema,
        completeSchemaParse: typeof CompleteSimulationSchema.parse,
      });

      const result = await generateObject({
        model: this.getModel(),
        schema: testSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });

      console.log("✅ Simple schema test successful:", {
        hasObject: !!result.object,
        objectKeys: result.object ? Object.keys(result.object) : [],
      });

      // Convert simple result to CompleteSimulation format
      const simpleResult = result.object;
      const completeSimulation: CompleteSimulation = {
        simulation: {
          name: simpleResult.name,
          description: simpleResult.description,
          type: "entertainment",
          environment: {
            setting: "Generic environment",
            atmosphere: "Neutral",
            scale: "medium",
          },
          characters: [],
          mechanics: {
            interaction: ["click", "type"],
            progression: "linear",
            feedback: ["visual", "text"],
            difficulty: "beginner",
          },
          objectives: [
            {
              title: "Complete the simulation",
              description: "Experience the basic simulation",
              type: "primary",
              difficulty: "easy",
            },
          ],
          presentation: {
            visualStyle: "modern",
            audioElements: [],
            uiElements: ["buttons", "text"],
          },
          educational: {
            learningOutcomes: ["Basic understanding"],
            targetAudience: "General audience",
            prerequisites: [],
            assessment: "Completion-based",
          },
          implementation: {
            platform: ["web"],
            technology: ["React", "Next.js"],
            estimatedDuration: "5-10 minutes",
            multiplayer: false,
          },
          features: [],
          constraints: [],
          tags: ["basic", "demo"],
          complexity: "simple",
        },
        aiElements: {
          components: [],
          interactions: [],
        },
        implementation: {
          priority: "medium",
          estimatedEffort: "2-4 weeks",
          recommendations: [
            "Start with basic UI components",
            "Implement core simulation mechanics",
            "Add AI Elements integration",
          ],
        },
      };

      return completeSimulation;
    } catch (error) {
      console.error("Error generating simulation:", error);

      // Check if it's a network connectivity issue
      if (
        error instanceof Error &&
        (error.message.includes("ENOTFOUND") ||
          error.message.includes("getaddrinfo") ||
          error.message.includes("Cannot connect to API"))
      ) {
        console.log(
          "🌐 Network connectivity issue detected, throwing specific error",
        );
        throw new Error("Network connectivity issue - cannot reach AI service");
      }

      throw new Error("Failed to generate simulation specification");
    }
  }

  async generateSimulationFromContext(
    prompt: string,
    context?: string,
  ): Promise<CompleteSimulation> {
    const enhancedPrompt = context
      ? `${prompt}\n\nAdditional context: ${context}`
      : prompt;

    return this.generateSimulation(enhancedPrompt);
  }
}

// Singleton instance
export const simulationGenerator = new SimulationGenerator();
