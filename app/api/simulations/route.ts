import { NextRequest, NextResponse } from "next/server";
import { SimulationModel, MessageModel } from "@/lib/database";
import {
  createInitialMessages,
  createUserMessage,
  createAssistantMessage,
  generateSimulationResponse,
} from "@/lib/simulation";
import { simulationGenerator } from "@/lib/ai-simulation-service";

// GET /api/simulations - List all simulations
export async function GET() {
  try {
    const simulations = SimulationModel.getAll();
    return NextResponse.json({ simulations });
  } catch (error) {
    console.error("Error fetching simulations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/simulations - Create a new simulation
export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      simulationObject: existingSimulationObject,
      aiElementsUsage: existingAiElementsUsage,
    } = await request.json();

    let simulationObject = null;
    let aiElementsUsage = null;

    // If forking (existing data provided), use it; otherwise generate new
    if (existingSimulationObject && existingAiElementsUsage) {
      simulationObject = existingSimulationObject;
      aiElementsUsage = existingAiElementsUsage;
      console.log("🔄 Forking simulation with existing data:", {
        simulationName: simulationObject?.name,
        simulationType: simulationObject?.type,
      });
    } else if (prompt) {
      console.log(
        "🚀 Starting simulation object generation for prompt:",
        prompt,
      );
      try {
        const completeSimulation =
          await simulationGenerator.generateSimulation(prompt);
        simulationObject = completeSimulation.simulation;
        aiElementsUsage = completeSimulation.aiElements;
        console.log("✅ Simulation object generated successfully:", {
          simulationName: simulationObject?.name,
          simulationType: simulationObject?.type,
          aiElementsCount: aiElementsUsage?.components?.length || 0,
        });
      } catch (error) {
        console.error("❌ Error generating simulation object:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });

        // Create a basic simulation object as fallback
        simulationObject = {
          name: "Basic Simulation",
          description: "A basic simulation created from your prompt",
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
        };
        aiElementsUsage = {
          components: [],
          totalTokens: 0,
        };
        console.log("🔄 Created fallback simulation object");
      }
    }

    const simulationId = SimulationModel.create(
      prompt,
      simulationObject,
      aiElementsUsage,
    );
    console.log("💾 Simulation created in database:", {
      id: simulationId,
      hasSimulationObject: !!simulationObject,
      hasAiElementsUsage: !!aiElementsUsage,
    });

    // If prompt provided, create initial messages
    if (prompt) {
      const initialMessages = createInitialMessages();
      const userMessage = createUserMessage(prompt);

      // Save initial messages
      initialMessages.forEach((msg) => MessageModel.create(simulationId, msg));
      MessageModel.create(simulationId, userMessage);

      // Generate enhanced AI response with simulation details
      let aiResponse = generateSimulationResponse(prompt);
      if (simulationObject) {
        aiResponse += `\n\nI've analyzed your request and created a detailed simulation specification. Here's what I've designed for you:\n\n**${simulationObject.name}**\n${simulationObject.description}\n\n**Type:** ${simulationObject.type}\n**Environment:** ${simulationObject.environment.setting}\n**Target Audience:** ${simulationObject.educational.targetAudience}\n\nThis simulation will include ${simulationObject.objectives.length} objectives and leverage AI Elements components for an interactive experience. Would you like me to elaborate on any specific aspect of the simulation design?`;
      }

      const assistantMessage = createAssistantMessage(aiResponse);
      MessageModel.create(simulationId, assistantMessage);
    } else {
      // Just create initial welcome message
      const initialMessages = createInitialMessages();
      initialMessages.forEach((msg) => MessageModel.create(simulationId, msg));
    }

    return NextResponse.json({
      simulationId,
      url: `/simulations/${simulationId}`,
      simulationObject,
      aiElementsUsage,
    });
  } catch (error) {
    console.error("Error creating simulation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
