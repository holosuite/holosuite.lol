import { NextRequest, NextResponse } from "next/server";
import {
  RunModel,
  TurnModel,
  VideoModel,
  SimulationModel,
} from "@/lib/database";
import { videoGenerationService } from "@/lib/ai-video-service";

// Type definition for turn objects
interface TurnObject {
  ai_response: string;
  user_prompt: string;
  image_url?: string | null;
}

// POST /api/simulations/[simulation_id]/runs/[run_id]/video - Trigger video generation
export async function POST(
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

    // Check if run is completed
    if (run.status !== "completed") {
      return NextResponse.json(
        { error: "Run must be completed before generating video" },
        { status: 400 },
      );
    }

    // Get simulation details for title
    const simulation = await SimulationModel.getById(resolvedParams.id);
    if (!simulation) {
      return NextResponse.json(
        { error: "Simulation not found" },
        { status: 404 },
      );
    }

    const simulationObject = JSON.parse(simulation.simulation_object || "{}");
    const storyTitle =
      simulationObject.title ||
      simulationObject.story?.title ||
      simulationObject.name ||
      "Interactive Story";

    // Get all turns for this run
    const turns = await TurnModel.getByRunId(resolvedParams.run_id);
    if (turns.length === 0) {
      return NextResponse.json(
        { error: "No turns found for this run" },
        { status: 400 },
      );
    }

    // Check if video already exists
    const existingVideos = await VideoModel.getByRunId(resolvedParams.run_id);
    if (existingVideos.length > 0) {
      return NextResponse.json(
        { error: "Video already exists for this run" },
        { status: 400 },
      );
    }

    // Generate video prompt
    const videoPrompt = buildVideoPrompt(turns);

    // Create video record with operation name placeholder
    const videoId = await VideoModel.create(resolvedParams.run_id, videoPrompt);

    console.log("🎬 Starting video generation:", {
      videoId,
      runId: resolvedParams.run_id,
      turnsCount: turns.length,
    });

    // Start video generation
    const videoResult = await videoGenerationService.generateHighlightVideo(
      turns.map((turn) => ({
        ...turn,
        image_url: turn.image_url || undefined,
        image_prompt: turn.image_prompt || undefined,
        suggested_options: turn.suggested_options ?? undefined,
      })),
      storyTitle, // Use the actual story title
    );

    // Update video record with operation object (stored as JSON string)
    VideoModel.updateStatus(
      videoId,
      "generating",
      JSON.stringify(videoResult.operation),
    );

    const operationName =
      (videoResult.operation as { name?: string })?.name || "unknown";

    console.log("✅ Video generation started:", {
      videoId,
      operationName,
    });

    return NextResponse.json({
      videoId,
      operationName,
      status: "generating",
      message: "Video generation started",
    });
  } catch (error) {
    console.error("❌ Error starting video generation:", error);
    return NextResponse.json(
      { error: "Failed to start video generation" },
      { status: 500 },
    );
  }
}

// GET /api/simulations/[simulation_id]/runs/[run_id]/video - Check video status
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

    // Get video records for this run
    const videos = await VideoModel.getByRunId(resolvedParams.run_id);
    if (videos.length === 0) {
      return NextResponse.json(
        { error: "No video found for this run" },
        { status: 404 },
      );
    }

    const video = videos[0]; // Get the most recent video

    // If video is still generating, poll the status
    if (video.status === "generating") {
      try {
        // We need to reconstruct the operation object from stored JSON
        const operationJson = video.video_url;

        if (operationJson) {
          const operation = JSON.parse(operationJson);
          const statusResult =
            await videoGenerationService.pollVideoStatus(operation);

          if (statusResult.status === "completed" && statusResult.videoUrl) {
            // Download and store video in Vercel Blob for persistence
            try {
              const videoFile = (
                statusResult.operation as {
                  response?: { generatedVideos?: Array<{ video?: unknown }> };
                }
              )?.response?.generatedVideos?.[0]?.video;
              if (videoFile) {
                const blobUrl =
                  await videoGenerationService.downloadAndStoreVideo(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    videoFile as any,
                    video.id,
                  );

                // Update video record with completion and blob URL
                VideoModel.updateStatus(video.id, "completed", blobUrl);

                return NextResponse.json({
                  videoId: video.id,
                  status: "completed",
                  videoUrl: blobUrl,
                  message: "Video generation completed and stored",
                });
              }
            } catch (downloadError) {
              console.error("❌ Error downloading video:", downloadError);
              return NextResponse.json(
                { error: "Video generated but failed to download" },
                { status: 500 },
              );
            }
          } else if (statusResult.status === "failed") {
            // Update video record with failure
            VideoModel.updateStatus(video.id, "failed");

            return NextResponse.json({
              videoId: video.id,
              status: "failed",
              message: "Video generation failed",
            });
          } else {
            // Still generating
            return NextResponse.json({
              videoId: video.id,
              status: "generating",
              message: "Video generation in progress",
            });
          }
        }
      } catch (error) {
        console.error("❌ Error polling video status:", error);
        // Continue to return current status
      }
    }

    // Return current video status
    return NextResponse.json({
      videoId: video.id,
      status: video.status,
      videoUrl: video.video_url,
      createdAt: video.created_at,
      completedAt: video.completed_at,
      message:
        video.status === "completed"
          ? "Video ready"
          : video.status === "failed"
            ? "Video generation failed"
            : "Video generation in progress",
    });
  } catch (error) {
    console.error("❌ Error checking video status:", error);
    return NextResponse.json(
      { error: "Failed to check video status" },
      { status: 500 },
    );
  }
}

/**
 * Build video prompt from story turns
 */
function buildVideoPrompt(turns: TurnObject[]): string {
  let prompt =
    "Create a cinematic highlight video showing the key moments of this interactive story. ";

  // Add key scenes from turns
  const keyScenes = turns
    .filter((turn) => turn.ai_response && turn.ai_response.length > 50)
    .slice(0, 8) // Limit to 8 key scenes
    .map((turn, index) => {
      return `Scene ${index + 1}: ${turn.ai_response.substring(0, 200)}...`;
    });

  prompt += keyScenes.join(" ");

  // Add video style instructions
  prompt +=
    " Style: cinematic, dramatic lighting, smooth transitions between scenes. ";
  prompt += "Duration: 8 seconds. ";
  prompt += "Focus on the most dramatic and visually interesting moments. ";
  prompt += "Maintain visual consistency throughout the video.";

  return prompt;
}
