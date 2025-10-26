import { NextRequest, NextResponse } from "next/server";
import { RunModel, TurnModel } from "@/lib/database";
import { imageGenerationService } from "@/lib/ai-image-service";

// POST /api/simulations/[simulation_id]/runs/[run_id]/turns - Submit user's next action
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; run_id: string }> },
) {
  try {
    const resolvedParams = await params;
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
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

    // Get previous turns for context
    const previousTurns = await TurnModel.getByRunId(resolvedParams.run_id);
    const nextTurnNumber = run.current_turn + 1;

    console.log("📝 Creating turn:", {
      runId: resolvedParams.run_id,
      turnNumber: nextTurnNumber,
      promptLength: prompt.length,
      previousTurnsCount: previousTurns.length,
    });

    // Generate simple AI response based on action
    const aiResponse = generateSimpleResponse(prompt, nextTurnNumber);

    // Generate 4 suggested next options
    const suggestedOptions = generateSimpleOptions();

    // Generate image for this turn
    let imageUrl: string | undefined = undefined;
    let imagePrompt: string | undefined = undefined;

    try {
      console.log("🎨 Generating image for turn:", nextTurnNumber);

      // Get previous turn images for continuity
      const previousImagePrompts = previousTurns
        .filter((turn) => turn.image_prompt)
        .map((turn) => turn.image_prompt!)
        .slice(-2); // Use last 2 images for continuity

      // Generate image for this turn
      const imageResult = await imageGenerationService.generateTurnImage(
        aiResponse, // Use the AI response as the scene description
        `Detective investigating: ${prompt}`, // Character context
        previousImagePrompts,
        "noir cinematic", // Style for detective mystery
      );

      imageUrl = imageResult.imageUrl;
      imagePrompt = imageResult.imagePrompt;

      console.log("✅ Image generated successfully for turn:", nextTurnNumber);
    } catch (error) {
      console.error("❌ Failed to generate image for turn:", error);
      // Continue without image if generation fails
    }

    // Create new turn
    const turnId = await TurnModel.create(
      resolvedParams.run_id,
      nextTurnNumber,
      prompt,
      aiResponse,
      imageUrl,
      imagePrompt,
      suggestedOptions,
    );

    // Update run with new turn number
    await RunModel.updateCurrentTurn(resolvedParams.run_id, nextTurnNumber);

    console.log("✅ Turn created:", {
      turnId,
      runId: resolvedParams.run_id,
      turnNumber: nextTurnNumber,
      optionsCount: suggestedOptions.length,
    });

    return NextResponse.json({
      turn: {
        id: turnId,
        turnNumber: nextTurnNumber,
        userPrompt: prompt,
        aiResponse: aiResponse,
        imageUrl: imageUrl,
        imagePrompt: imagePrompt,
        suggestedOptions: suggestedOptions,
        createdAt: new Date().toISOString(),
      },
      message: "Turn processed successfully",
    });
  } catch (error) {
    console.error("❌ Error processing turn:", error);
    return NextResponse.json(
      { error: "Failed to process turn" },
      { status: 500 },
    );
  }
}

/**
 * Generate simple AI response based on character and action
 */
function generateSimpleResponse(
  userAction: string,
  turnNumber: number,
): string {
  const responses = [
    `You take action: "${userAction}". The situation develops in an interesting way, presenting new challenges and opportunities.`,
    `As you execute "${userAction}", the environment responds dynamically, creating new possibilities for exploration and interaction.`,
    `Your decision to "${userAction}" leads to unexpected consequences that open up new paths forward in the story.`,
    `Following your action of "${userAction}", the world around you shifts, revealing new information and choices to consider.`,
  ];

  return responses[turnNumber % responses.length];
}

/**
 * Generate simple suggested options
 */
function generateSimpleOptions(): string[] {
  return [
    "Explore the area more carefully",
    "Look for clues or hidden elements",
    "Take decisive action",
    "Try a different approach",
  ];
}
