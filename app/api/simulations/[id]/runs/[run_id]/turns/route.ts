import { NextRequest, NextResponse } from "next/server";
import {
  SimulationModel,
  HologramModel,
  RunModel,
  TurnModel,
} from "@/lib/database";
import { imageGenerationService } from "@/lib/ai-image-service";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

// Type definitions for better type safety
interface StoryObject {
  title: string;
  genre: string;
  tone?: string;
  story: {
    setting: string;
    description: string;
  };
  storyArc: {
    beginning: string;
  };
}

interface HologramObject {
  name: string;
  descriptions: string[];
  acting_instructions: string[];
}

interface TurnObject {
  turn_number: number;
  user_prompt: string;
  ai_response: string;
  image_url?: string;
}

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

    // Get simulation and hologram details
    const simulation = await SimulationModel.getById(resolvedParams.id);
    const hologram = await HologramModel.getById(run.user_hologram_id);

    if (!simulation || !hologram) {
      return NextResponse.json(
        { error: "Simulation or hologram not found" },
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

    const story = simulationObject.story;
    if (!story) {
      return NextResponse.json(
        { error: "Story data not found" },
        { status: 400 },
      );
    }

    // Get previous turns for context
    const previousTurns = await TurnModel.getByRunId(resolvedParams.run_id);
    const nextTurnNumber = run.current_turn + 1;

    // Build context for AI story generation
    const contextPrompt = buildStoryContextPrompt(
      story,
      hologram,
      previousTurns,
      prompt,
      nextTurnNumber,
    );

    console.log("📝 Generating story continuation:", {
      runId: resolvedParams.run_id,
      turnNumber: nextTurnNumber,
      promptLength: prompt.length,
      previousTurnsCount: previousTurns.length,
    });

    // Generate story continuation using AI
    const result = await streamText({
      model: google("gemini-2.5-flash"),
      prompt: contextPrompt,
      temperature: 0.8,
      maxTokens: 1000,
    });

    // Collect the full response
    let aiResponse = "";
    for await (const delta of result.textStream) {
      aiResponse += delta;
    }

    // Generate 4 suggested next options
    const suggestedOptions = await generateSuggestedOptions(
      story,
      hologram,
      aiResponse,
      nextTurnNumber,
    );

    // Generate image for this turn with continuity
    const previousImagePrompts = previousTurns
      .filter((turn) => turn.image_prompt)
      .map((turn) => turn.image_prompt!)
      .slice(-3); // Use last 3 images for continuity

    const imageResult = await imageGenerationService.generateTurnImage(
      aiResponse,
      `${hologram.name}: ${hologram.descriptions.join(", ")}`,
      previousImagePrompts,
      story.imageStyle || "cinematic",
    );

    // Create new turn
    const turnId = await TurnModel.create(
      resolvedParams.run_id,
      nextTurnNumber,
      prompt,
      aiResponse,
      imageResult.imageUrl,
      imageResult.imagePrompt,
      suggestedOptions,
    );

    // Update run with new turn number
    await RunModel.updateCurrentTurn(resolvedParams.run_id, nextTurnNumber);

    console.log("✅ Turn created:", {
      turnId,
      runId: resolvedParams.run_id,
      turnNumber: nextTurnNumber,
      hasImage: !!imageResult.imageUrl,
      optionsCount: suggestedOptions.length,
    });

    return NextResponse.json({
      turn: {
        id: turnId,
        turnNumber: nextTurnNumber,
        userPrompt: prompt,
        aiResponse: aiResponse,
        imageUrl: imageResult.imageUrl,
        imagePrompt: imageResult.imagePrompt,
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
 * Build context prompt for AI story generation
 */
function buildStoryContextPrompt(
  story: StoryObject,
  hologram: HologramObject,
  previousTurns: TurnObject[],
  userPrompt: string,
  turnNumber: number,
): string {
  let prompt = `You are the narrator of an interactive story called "${story.title}". `;

  prompt += `Genre: ${story.genre}. Setting: ${story.story.setting}. `;
  prompt += `Tone: ${story.tone || "adventurous"}. `;

  prompt += `The user is playing as ${hologram.name}, ${hologram.descriptions.join(", ")}. `;
  prompt += `Character personality: ${hologram.acting_instructions.join(", ")}. `;

  // Add story context
  prompt += `Story context: ${story.storyArc.beginning}. `;

  // Add previous turns for continuity
  if (previousTurns.length > 0) {
    prompt += `Previous story progression: `;
    previousTurns.slice(-5).forEach((turn, index) => {
      prompt += `Turn ${turn.turn_number}: User said "${turn.user_prompt}". Result: ${turn.ai_response.substring(0, 200)}... `;
    });
  }

  prompt += `Current turn ${turnNumber}: The user says "${userPrompt}". `;

  prompt += `Respond with a vivid, descriptive continuation of the story that: `;
  prompt += `1. Advances the plot based on the user's action `;
  prompt += `2. Maintains character consistency `;
  prompt += `3. Creates atmosphere and tension `;
  prompt += `4. Sets up interesting choices for the next turn `;
  prompt += `5. Keeps the story engaging and immersive `;
  prompt += `6. Is 2-3 paragraphs long `;
  prompt += `7. Ends with a clear situation that requires the user to make a decision `;

  return prompt;
}

/**
 * Generate suggested options for the next turn
 */
async function generateSuggestedOptions(
  story: StoryObject,
  hologram: HologramObject,
  aiResponse: string,
  turnNumber: number,
): Promise<string[]> {
  try {
    const optionsPrompt = `Based on this story continuation: "${aiResponse.substring(0, 300)}..."
    
    Generate 4 different action options that ${hologram.name} could take next. Each option should:
    1. Be 1-2 sentences long
    2. Be specific and actionable
    3. Fit the character's personality: ${hologram.acting_instructions.join(", ")}
    4. Advance the story in different directions
    5. Be interesting and engaging
    
    Return only the 4 options, one per line, without numbering or bullets.`;

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      prompt: optionsPrompt,
      temperature: 0.9,
      maxTokens: 200,
    });

    let optionsText = "";
    for await (const delta of result.textStream) {
      optionsText += delta;
    }

    // Parse options from response
    const options = optionsText
      .split("\n")
      .map((option) => option.trim())
      .filter((option) => option.length > 0)
      .slice(0, 4);

    // Ensure we have exactly 4 options
    while (options.length < 4) {
      options.push(`Take a different approach to the situation`);
    }

    return options;
  } catch (error) {
    console.error("❌ Error generating suggested options:", error);
    // Fallback options
    return [
      "Investigate the area more carefully",
      "Try a different approach",
      "Look for clues or hidden elements",
      "Take decisive action",
    ];
  }
}
