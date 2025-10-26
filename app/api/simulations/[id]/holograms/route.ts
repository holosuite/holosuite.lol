import { NextRequest, NextResponse } from "next/server";
import { SimulationModel, HologramModel } from "@/lib/database";
import { hologramGenerator } from "@/lib/ai-hologram-service";
import { createAssistantMessage } from "@/lib/simulation";

// Interface for simulation object from database
interface SimulationRow {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  initial_prompt?: string;
  simulation_object?: string;
  ai_elements_usage?: string;
}

// GET /api/simulations/[id]/holograms - List all holograms for a simulation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Verify simulation exists
    const simulation = await SimulationModel.getById(id);
    if (!simulation) {
      return NextResponse.json(
        { error: "Simulation not found" },
        { status: 404 },
      );
    }

    const holograms = await HologramModel.getBySimulationId(id);

    return NextResponse.json({ holograms });
  } catch (error) {
    console.error("Error fetching holograms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/simulations/[id]/holograms - Process natural language command to manage holograms
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { prompt } = await request.json();

    // Verify simulation exists
    const simulation = await SimulationModel.getById(id);
    if (!simulation) {
      return NextResponse.json(
        { error: "Simulation not found" },
        { status: 404 },
      );
    }

    console.log("🎭 Processing hologram command:", {
      simulationId: id,
      prompt,
    });

    // Get current holograms to help with command parsing
    const currentHolograms = await HologramModel.getBySimulationId(id);
    const existingHologramNames = currentHolograms.map((h) => h.name);

    // Parse the command to determine action
    const command = await hologramGenerator.parseHologramCommand(
      prompt,
      existingHologramNames,
    );
    console.log("📋 Parsed command:", command);

    let responseMessage = "";
    let updatedHolograms = currentHolograms;

    // Get simulation context for AI generation
    const simulationContext = (simulation as SimulationRow).simulation_object
      ? JSON.parse((simulation as SimulationRow).simulation_object!).name ||
        "Unknown simulation"
      : "General simulation";

    switch (command.action) {
      case "create": {
        console.log("🆕 Creating new holograms...");
        const hologramsData = await hologramGenerator.generateHolograms(
          prompt,
          simulationContext,
        );

        // Create each hologram in the database
        for (const hologram of hologramsData.holograms) {
          await HologramModel.create(
            id,
            hologram.name,
            hologram.actingInstructions,
            hologram.descriptions,
            hologram.wardrobe,
          );
        }

        responseMessage = `Created ${hologramsData.holograms.length} hologram(s): ${hologramsData.holograms.map((h) => h.name).join(", ")}`;
        updatedHolograms = await HologramModel.getBySimulationId(id);
        break;
      }

      case "update": {
        console.log("🔄 Updating holograms...");

        if (currentHolograms.length === 0) {
          responseMessage =
            "No holograms found to update. Create some holograms first.";
          break;
        }

        // If specific hologram mentioned, update only that one
        if (command.targetHologram) {
          const targetHologram = currentHolograms.find((h) =>
            h.name
              .toLowerCase()
              .includes(command.targetHologram!.toLowerCase()),
          );

          if (!targetHologram) {
            responseMessage = `Hologram "${command.targetHologram}" not found. Available holograms: ${currentHolograms.map((h) => h.name).join(", ")}`;
            break;
          }

          // Update only the specific hologram
          const hologramsData = await hologramGenerator.updateHolograms(
            prompt,
            [
              {
                name: targetHologram.name,
                actingInstructions: targetHologram.acting_instructions,
                descriptions: targetHologram.descriptions,
                wardrobe: targetHologram.wardrobe,
              },
            ],
            simulationContext,
          );

          if (hologramsData.holograms.length > 0) {
            const updatedHologram = hologramsData.holograms[0];
            await HologramModel.update(
              targetHologram.id,
              updatedHologram.name,
              updatedHologram.actingInstructions,
              updatedHologram.descriptions,
              updatedHologram.wardrobe,
            );
            responseMessage = `Updated hologram: ${updatedHologram.name}`;
          } else {
            responseMessage = `Failed to update hologram "${command.targetHologram}".`;
          }
        } else {
          // Update all holograms
          const hologramsData = await hologramGenerator.updateHolograms(
            prompt,
            currentHolograms.map((h) => ({
              name: h.name,
              actingInstructions: h.acting_instructions,
              descriptions: h.descriptions,
              wardrobe: h.wardrobe,
            })),
            simulationContext,
          );

          // Update existing holograms
          for (const hologram of hologramsData.holograms) {
            const existingHologram = currentHolograms.find(
              (h) => h.name === hologram.name,
            );
            if (existingHologram) {
              await HologramModel.update(
                existingHologram.id,
                hologram.name,
                hologram.actingInstructions,
                hologram.descriptions,
                hologram.wardrobe,
              );
            }
          }

          responseMessage = `Updated hologram(s): ${hologramsData.holograms.map((h) => h.name).join(", ")}`;
        }

        updatedHolograms = await HologramModel.getBySimulationId(id);
        break;
      }

      case "remove": {
        console.log("🗑️ Removing holograms...");

        if (currentHolograms.length === 0) {
          responseMessage = "No holograms found to remove.";
          break;
        }

        // If specific hologram mentioned, try to find and remove it
        if (command.targetHologram) {
          const targetHologram = currentHolograms.find((h) =>
            h.name
              .toLowerCase()
              .includes(command.targetHologram!.toLowerCase()),
          );

          if (targetHologram) {
            await HologramModel.delete(targetHologram.id);
            responseMessage = `Removed hologram: ${targetHologram.name}`;
          } else {
            responseMessage = `Hologram "${command.targetHologram}" not found.`;
          }
        } else {
          // Remove all holograms
          await HologramModel.deleteBySimulationId(id);
          responseMessage = "Removed all holograms from this simulation.";
        }

        updatedHolograms = await HologramModel.getBySimulationId(id);
        break;
      }

      case "transfer": {
        console.log("🔄 Transferring holograms...");

        if (currentHolograms.length === 0) {
          responseMessage = "No holograms found to transfer.";
          break;
        }

        if (!command.targetSimulation) {
          responseMessage =
            "Please specify a target simulation ID for the transfer.";
          break;
        }

        // Verify target simulation exists
        const targetSimulation = await SimulationModel.getById(
          command.targetSimulation,
        );
        if (!targetSimulation) {
          responseMessage = `Target simulation "${command.targetSimulation}" not found.`;
          break;
        }

        // Transfer specific hologram or all holograms
        if (command.targetHologram) {
          const targetHologram = currentHolograms.find((h) =>
            h.name
              .toLowerCase()
              .includes(command.targetHologram!.toLowerCase()),
          );

          if (targetHologram) {
            await HologramModel.update(
              targetHologram.id,
              undefined,
              undefined,
              undefined,
              undefined,
            );
            responseMessage = `Transferred hologram "${targetHologram.name}" to simulation "${command.targetSimulation}".`;
          } else {
            responseMessage = `Hologram "${command.targetHologram}" not found.`;
          }
        } else {
          // Transfer all holograms
          for (const hologram of currentHolograms) {
            await HologramModel.update(
              hologram.id,
              undefined,
              undefined,
              undefined,
              undefined,
            );
          }
          responseMessage = `Transferred all holograms to simulation "${command.targetSimulation}".`;
        }

        updatedHolograms = await HologramModel.getBySimulationId(id);
        break;
      }

      default:
        responseMessage =
          "Unknown hologram command. Please specify create, update, remove, or transfer.";
    }

    // Create assistant message for the response
    const assistantMessage = createAssistantMessage(responseMessage);

    return NextResponse.json({
      holograms: updatedHolograms,
      message: assistantMessage,
      command: command.action,
    });
  } catch (error) {
    console.error("Error processing hologram command:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
