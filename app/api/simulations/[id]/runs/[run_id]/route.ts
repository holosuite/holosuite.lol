import { NextRequest, NextResponse } from "next/server";
import {
  SimulationModel,
  HologramModel,
  RunModel,
  TurnModel,
} from "@/lib/database";

// GET /api/simulations/[simulation_id]/runs/[run_id] - Get run details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; run_id: string }> },
) {
  try {
    const resolvedParams = await params;

    // Get run details
    const run = await RunModel.getById(resolvedParams.run_id);
    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    // Validate run belongs to simulation
    if (run.simulation_id !== resolvedParams.id) {
      return NextResponse.json(
        { error: "Run does not belong to this simulation" },
        { status: 400 },
      );
    }

    // Get simulation details
    const simulation = await SimulationModel.getById(resolvedParams.id);
    if (!simulation) {
      return NextResponse.json(
        { error: "Simulation not found" },
        { status: 404 },
      );
    }

    // Get hologram details
    const hologram = await HologramModel.getById(run.user_hologram_id);
    if (!hologram) {
      return NextResponse.json(
        { error: "Hologram not found" },
        { status: 404 },
      );
    }

    // Get all turns for this run
    const turns = await TurnModel.getByRunId(resolvedParams.run_id);

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

    console.log("📖 Retrieved run details:", {
      runId: resolvedParams.run_id,
      simulationId: resolvedParams.id,
      turnsCount: turns.length,
      status: run.status,
    });

    return NextResponse.json({
      run: {
        id: run.id,
        status: run.status,
        currentTurn: run.current_turn,
        createdAt: run.created_at,
        updatedAt: run.updated_at,
      },
      simulation: {
        id: simulation.id,
        title: simulationObject.story?.title || "Unknown Story",
        description: simulationObject.story?.description || "",
        genre: simulationObject.story?.genre || "",
        setting: simulationObject.story?.setting || "",
        estimatedTurns: simulationObject.story?.estimatedTurns || 10,
      },
      hologram: {
        id: hologram.id,
        name: hologram.name,
        descriptions: hologram.descriptions,
        actingInstructions: hologram.acting_instructions,
        wardrobe: hologram.wardrobe,
      },
      turns: turns.map((turn) => ({
        id: turn.id,
        turnNumber: turn.turn_number,
        userPrompt: turn.user_prompt,
        aiResponse: turn.ai_response,
        imageUrl: turn.image_url,
        imagePrompt: turn.image_prompt,
        suggestedOptions: turn.suggested_options,
        createdAt: turn.created_at,
      })),
    });
  } catch (error) {
    console.error("❌ Error retrieving run details:", error);
    return NextResponse.json(
      { error: "Failed to retrieve run details" },
      { status: 500 },
    );
  }
}

// PATCH /api/simulations/[simulation_id]/runs/[run_id] - Update run status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; run_id: string }> },
) {
  try {
    const resolvedParams = await params;
    const { status } = await request.json();

    if (!status || !["active", "completed", "abandoned"].includes(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Must be 'active', 'completed', or 'abandoned'",
        },
        { status: 400 },
      );
    }

    // Get run details
    const run = await RunModel.getById(resolvedParams.run_id);
    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    // Validate run belongs to simulation
    if (run.simulation_id !== resolvedParams.id) {
      return NextResponse.json(
        { error: "Run does not belong to this simulation" },
        { status: 400 },
      );
    }

    // Update run status
    await RunModel.updateStatus(resolvedParams.run_id, status);

    console.log("✅ Run status updated:", {
      runId: resolvedParams.run_id,
      newStatus: status,
    });

    return NextResponse.json({
      message: "Run status updated successfully",
      status,
    });
  } catch (error) {
    console.error("❌ Error updating run status:", error);
    return NextResponse.json(
      { error: "Failed to update run status" },
      { status: 500 },
    );
  }
}

// DELETE /api/simulations/[simulation_id]/runs/[run_id] - Delete run
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; run_id: string }> },
) {
  try {
    const resolvedParams = await params;

    // Get run details
    const run = await RunModel.getById(resolvedParams.run_id);
    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    // Validate run belongs to simulation
    if (run.simulation_id !== resolvedParams.id) {
      return NextResponse.json(
        { error: "Run does not belong to this simulation" },
        { status: 400 },
      );
    }

    // Delete run (this will cascade delete turns and videos)
    await RunModel.delete(resolvedParams.run_id);

    console.log("🗑️ Run deleted:", {
      runId: resolvedParams.run_id,
      simulationId: resolvedParams.id,
    });

    return NextResponse.json({
      message: "Run deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting run:", error);
    return NextResponse.json(
      { error: "Failed to delete run" },
      { status: 500 },
    );
  }
}
