import { NextRequest, NextResponse } from "next/server";
import { SimulationModel, RunModel, TurnModel } from "@/lib/database";

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
        title:
          run.title ||
          simulationObject.title ||
          simulationObject.story?.title ||
          "Interactive Story",
        createdAt: run.created_at,
        updatedAt: run.updated_at,
      },
      simulation: {
        id: simulation.id,
        title:
          simulationObject.title ||
          simulationObject.story?.title ||
          "Interactive Story",
        description:
          simulationObject.description ||
          simulationObject.story?.description ||
          "",
        genre: simulationObject.genre || simulationObject.story?.genre || "",
        setting:
          simulationObject.setting || simulationObject.story?.setting || "",
        estimatedTurns:
          simulationObject.estimatedTurns ||
          simulationObject.story?.estimatedTurns ||
          10,
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

// PATCH /api/simulations/[simulation_id]/runs/[run_id] - Update run status or title
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; run_id: string }> },
) {
  try {
    const resolvedParams = await params;
    const { status, title } = await request.json();

    // Validate that at least one field is provided
    if (!status && !title) {
      return NextResponse.json(
        { error: "Must provide either 'status' or 'title' to update" },
        { status: 400 },
      );
    }

    // Validate status if provided
    if (status && !["active", "completed", "abandoned"].includes(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Must be 'active', 'completed', or 'abandoned'",
        },
        { status: 400 },
      );
    }

    // Validate title if provided
    if (title && (typeof title !== "string" || title.trim().length === 0)) {
      return NextResponse.json(
        { error: "Title must be a non-empty string" },
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

    // Update run fields
    if (status) {
      await RunModel.updateStatus(resolvedParams.run_id, status);
    }

    if (title) {
      await RunModel.updateTitle(resolvedParams.run_id, title.trim());
    }

    console.log("✅ Run updated:", {
      runId: resolvedParams.run_id,
      ...(status && { newStatus: status }),
      ...(title && { newTitle: title.trim() }),
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
