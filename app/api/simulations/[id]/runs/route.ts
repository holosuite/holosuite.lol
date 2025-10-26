import { NextRequest, NextResponse } from "next/server";
import {
  SimulationModel,
  HologramModel,
  RunModel,
  TurnModel,
} from "@/lib/database";
import { imageGenerationService } from "@/lib/ai-image-service";

// POST /api/simulations/[simulation_id]/runs - Create new run
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const { hologramId } = await request.json();

    if (!hologramId) {
      return NextResponse.json(
        { error: "Hologram ID is required" },
        { status: 400 },
      );
    }

    // Validate simulation exists and is a story
    const simulation = await SimulationModel.getById(resolvedParams.id);
    if (!simulation) {
      return NextResponse.json(
        { error: "Simulation not found" },
        { status: 404 },
      );
    }

    // Parse simulation object to check if it's a story
    let simulationObject;
    try {
      simulationObject = JSON.parse(simulation.simulation_object || "{}");
    } catch {
      return NextResponse.json(
        { error: "Invalid simulation data" },
        { status: 400 },
      );
    }

    if (simulationObject.type !== "story") {
      return NextResponse.json(
        { error: "This simulation is not a story" },
        { status: 400 },
      );
    }

    // Validate hologram exists and belongs to this simulation
    const hologram = await HologramModel.getById(hologramId);
    if (!hologram || hologram.simulation_id !== resolvedParams.id) {
      return NextResponse.json(
        { error: "Invalid hologram for this simulation" },
        { status: 400 },
      );
    }

    // Create new run
    const runId = await RunModel.create(resolvedParams.id, hologramId);

    // Generate initial scene and image
    const story = simulationObject.story;
    const initialScene = story.initialScene;

    // Generate initial image
    const imageResult = await imageGenerationService.generateInitialSceneImage(
      story.title,
      initialScene,
      story.imageStyle || "cinematic",
    );

    // Create initial turn with opening scene
    const turnId = await TurnModel.create(
      runId,
      0,
      "Start the story",
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

    console.log("✅ Story run created:", {
      runId,
      simulationId: resolvedParams.id,
      hologramId,
      turnId,
    });

    return NextResponse.json({
      runId,
      redirectUrl: `/simulations/${resolvedParams.id}/runs/${runId}`,
      message: "Story run created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating story run:", error);
    return NextResponse.json(
      { error: "Failed to create story run" },
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

    // Get hologram info for each run
    const runsWithDetails = await Promise.all(
      runs.map(async (run) => {
        const hologram = await HologramModel.getById(run.user_hologram_id);
        return {
          id: run.id,
          status: run.status,
          currentTurn: run.current_turn,
          createdAt: run.created_at,
          hologram: hologram
            ? {
                id: hologram.id,
                name: hologram.name,
              }
            : null,
        };
      }),
    );

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
