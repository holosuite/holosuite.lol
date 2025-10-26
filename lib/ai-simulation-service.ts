import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import {
  CompleteSimulationSchema,
  type CompleteSimulation,
} from "./simulation-schema";
import { AI_CONFIG } from "./ai-config";
import { withRetry, handleAIError, validateAIResponse } from "./ai-utils";

// AI service for generating simulation objects from natural language
export class SimulationGenerator {
  private getModel() {
    // Use Google Gemini 2.5-flash with configuration
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

IMPORTANT: Never ask the user for follow-up information or clarification. Instead, make intelligent assumptions and fill in any gaps with creative, practical solutions. Be proactive and comprehensive in your design approach. The user can always iterate and refine any aspects you've imagined.

Focus on creating engaging, educational, and technically feasible simulations that leverage modern AI capabilities for interactive experiences.`;

    const userPrompt = `Create a comprehensive simulation specification for: "${prompt}"

Analyze this request and generate:
1. A detailed simulation design with all required components
2. Appropriate AI Elements components that would be useful for implementation
3. Implementation recommendations and next steps

Make intelligent assumptions to fill any gaps in the user's request. Be comprehensive and proactive in your design approach. Consider the interactive, AI-powered nature of modern simulations and how AI Elements can enhance the user experience.`;

    try {
      const result = await withRetry(async () => {
        return await generateObject({
          model: this.getModel(),
          schema: CompleteSimulationSchema, // Use full schema instead of test schema
          system: systemPrompt,
          prompt: userPrompt,
          temperature: AI_CONFIG.google.temperature,
          topP: AI_CONFIG.google.topP,
        });
      });

      const completeSimulation = validateAIResponse(
        result,
        "CompleteSimulation",
      );

      console.log("✅ Simulation generated successfully:", {
        simulationName: completeSimulation.simulation?.name,
        simulationType: completeSimulation.simulation?.type,
        objectivesCount: completeSimulation.simulation?.objectives?.length || 0,
        aiElementsCount: completeSimulation.aiElements?.components?.length || 0,
      });

      return completeSimulation;
    } catch (error) {
      console.error("❌ Error generating simulation:", error);
      handleAIError(error);
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
