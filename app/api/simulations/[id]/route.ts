import { NextRequest, NextResponse } from "next/server";
import { SimulationModel, MessageModel } from "@/lib/database";
import {
  createInitialMessages,
  createUserMessage,
  createAssistantMessage,
  generateSimulationResponse,
} from "@/lib/simulation";
import { simulationGenerator } from "@/lib/ai-simulation-service";

// GET /api/simulations/[id] - Get simulation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const simulation = await SimulationModel.getById(id);
    if (!simulation) {
      return NextResponse.json(
        { error: "Simulation not found" },
        { status: 404 },
      );
    }

    const messages = await MessageModel.getBySimulationId(id);

    return NextResponse.json({
      simulation,
      messages: messages.length > 0 ? messages : createInitialMessages(),
    });
  } catch (error) {
    console.error("Error fetching simulation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/simulations/[id]/messages - Add a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { content } = await request.json();

    // Verify simulation exists
    const simulation = await SimulationModel.getById(id);
    if (!simulation) {
      return NextResponse.json(
        { error: "Simulation not found" },
        { status: 404 },
      );
    }

    // Create user message
    const userMessage = createUserMessage(content);
    await MessageModel.create(
      id,
      userMessage.from,
      userMessage.content,
      userMessage.name,
      userMessage.avatar,
    );

    // Generate AI response
    const aiResponse = generateSimulationResponse(content);
    const assistantMessage = createAssistantMessage(aiResponse);
    await MessageModel.create(
      id,
      assistantMessage.from,
      assistantMessage.content,
      assistantMessage.name,
      assistantMessage.avatar,
    );

    return NextResponse.json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/simulations/[id] - Update simulation state
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { updatePrompt, currentSimulationObject } = await request.json();

    // Verify simulation exists
    const simulation = await SimulationModel.getById(id);
    if (!simulation) {
      return NextResponse.json(
        { error: "Simulation not found" },
        { status: 404 },
      );
    }

    console.log("🔄 Updating simulation state:", {
      simulationId: id,
      updatePrompt,
    });

    // Generate updated simulation object using AI
    let updatedSimulationObject = null;
    let updatedAiElementsUsage = null;

    try {
      // Create a prompt that includes the current state and the update request
      const contextualPrompt = `Current simulation: ${JSON.stringify(currentSimulationObject, null, 2)}

Update request: ${updatePrompt}

Please update the simulation object based on this request while maintaining consistency with the existing structure.`;

      const completeSimulation =
        await simulationGenerator.generateSimulation(contextualPrompt);
      updatedSimulationObject = completeSimulation.simulation;
      updatedAiElementsUsage = completeSimulation.aiElements;

      console.log("✅ Simulation state updated successfully:", {
        simulationName: updatedSimulationObject?.name,
        simulationType: updatedSimulationObject?.type,
      });
    } catch (error) {
      console.error("❌ Error updating simulation state:", error);
      throw error;
    }

    // Update the simulation in the database
    await SimulationModel.update(
      id,
      undefined,
      undefined,
      updatedSimulationObject,
      updatedAiElementsUsage,
    );

    // Create user message for the update
    const userMessage = createUserMessage(updatePrompt);
    await MessageModel.create(
      id,
      userMessage.from,
      userMessage.content,
      userMessage.name,
      userMessage.avatar,
    );

    // Generate AI response about the update
    const aiResponse = `I've updated the simulation based on your request: "${updatePrompt}". The simulation now has new properties and characteristics. You can continue to refine it further by describing additional changes you'd like to make.`;
    const assistantMessage = createAssistantMessage(aiResponse);
    await MessageModel.create(
      id,
      assistantMessage.from,
      assistantMessage.content,
      assistantMessage.name,
      assistantMessage.avatar,
    );

    return NextResponse.json({
      simulation: await SimulationModel.getById(id),
      updatedSimulationObject,
      updatedAiElementsUsage,
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    console.error("Error updating simulation state:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
