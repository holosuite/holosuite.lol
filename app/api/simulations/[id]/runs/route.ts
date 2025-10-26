import { NextRequest, NextResponse } from "next/server";
import { SimulationModel, RunModel, TurnModel } from "@/lib/database";
import { imageGenerationService } from "@/lib/ai-image-service";

// POST /api/simulations/[simulation_id]/runs - Create new run
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;

    // Validate simulation exists
    const simulation = await SimulationModel.getById(resolvedParams.id);
    if (!simulation) {
      return NextResponse.json(
        { error: "Simulation not found" },
        { status: 404 },
      );
    }

    // Parse simulation object
    let simulationObject;
    try {
      simulationObject = JSON.parse(simulation.simulation_object || "{}");
    } catch {
      return NextResponse.json(
        { error: "Invalid simulation data" },
        { status: 400 },
      );
    }

    // Create new run
    const runId = await RunModel.create(resolvedParams.id);

    // Generate initial scene and image based on simulation type
    let initialScene, title, imageStyle;

    if (simulationObject.type === "story" && simulationObject.story) {
      // Story simulation
      const story = simulationObject.story;
      initialScene = story.initialScene;
      title = story.title;
      imageStyle = story.imageStyle || "cinematic";
    } else {
      // Other simulation types - use generic content
      initialScene =
        simulationObject.description || "Welcome to your simulation!";
      title = simulationObject.name || "Simulation";
      imageStyle = "cinematic";
    }

    // Generate initial image
    const imageResult = await imageGenerationService.generateInitialSceneImage(
      title,
      initialScene,
      imageStyle,
    );

    // Create initial turn with opening scene
    const turnId = await TurnModel.create(
      runId,
      0,
      simulationObject.type === "story"
        ? "Start the story"
        : "Start the simulation",
      initialScene,
      imageResult.imageUrl,
      imageResult.imagePrompt,
      [
        "Explore the area carefully",
        "Look for clues or hidden passages",
        "Call out to see if anyone is nearby",
        "Examine the mysterious glow",
      ],
    );

    // Update run with current turn
    await RunModel.updateCurrentTurn(runId, 0);

    console.log("✅ Simulation run created:", {
      runId,
      simulationId: resolvedParams.id,
      turnId,
      simulationType: simulationObject.type,
    });

    return NextResponse.json({
      runId,
      redirectUrl: `/simulations/${resolvedParams.id}/runs/${runId}`,
      message: "Simulation run created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating simulation run:", error);
    return NextResponse.json(
      { error: "Failed to create simulation run" },
      { status: 500 },
    );
  }
}

// GET /api/simulations/[simulation_id]/runs - List all runs for simulation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;

    // Get all runs for this simulation
    const runs = await RunModel.getBySimulationId(resolvedParams.id);

    // Format runs data
    const runsWithDetails = runs.map((run) => ({
      id: run.id,
      status: run.status,
      currentTurn: run.current_turn,
      createdAt: run.created_at,
    }));

    console.log("📋 Retrieved runs:", {
      simulationId: resolvedParams.id,
      runsCount: runsWithDetails.length,
    });

    return NextResponse.json({
      runs: runsWithDetails,
    });
  } catch (error) {
    console.error("❌ Error retrieving runs:", error);
    return NextResponse.json(
      { error: "Failed to retrieve runs" },
      { status: 500 },
    );
  }
}
