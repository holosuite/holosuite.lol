import { AI_CONFIG } from "./ai-config";
import type { TurnData } from "./story-schema";
import { put } from "@vercel/blob";

// Video generation result interface
export interface VideoGenerationResult {
  operationName: string;
  status: string;
  videoUrl?: string;
  blobUrl?: string; // Vercel Blob URL for persistent storage
}

// Video generation service for story highlights using Veo 3
export class VideoGenerationService {
  private static instance: VideoGenerationService;
  private readonly apiKey: string;
  private readonly baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  private constructor() {
    this.apiKey = AI_CONFIG.google.apiKey;
    if (!this.apiKey) {
      throw new Error("Google GenAI API key is required for video generation");
    }
  }

  static getInstance(): VideoGenerationService {
    if (!VideoGenerationService.instance) {
      VideoGenerationService.instance = new VideoGenerationService();
    }
    return VideoGenerationService.instance;
  }

  /**
   * Generate a highlight video from story turns
   * @param turns - Array of story turns with images and descriptions
   * @param storyTitle - Title of the story
   * @returns Promise<VideoGenerationResult>
   */
  async generateHighlightVideo(
    turns: TurnData[],
    storyTitle: string,
  ): Promise<VideoGenerationResult> {
    try {
      console.log("🎬 Generating highlight video:", {
        turnsCount: turns.length,
        storyTitle,
        hasImages: turns.some((t) => t.image_url),
      });

      // Compile video prompt from turns
      const videoPrompt = this.compileVideoPrompt(turns, storyTitle);

      console.log("📝 Video prompt:", videoPrompt);

      // Call Veo 3 API to start video generation
      const response = await fetch(
        `${this.baseUrl}/models/veo-3.1-generate-preview:predictLongRunning`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instances: [
              {
                prompt: videoPrompt,
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Video generation API error: ${response.status} ${errorText}`,
        );
      }

      const result = await response.json();
      const operationName = result.name;

      console.log("✅ Video generation started:", { operationName });

      return {
        operationName,
        status: "generating",
      };
    } catch (error) {
      console.error("❌ Error generating highlight video:", error);
      throw new Error(
        `Failed to generate video: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Poll the status of a video generation operation
   * @param operationName - The operation name returned from generateHighlightVideo
   * @returns Promise<VideoGenerationResult>
   */
  async pollVideoStatus(operationName: string): Promise<VideoGenerationResult> {
    try {
      console.log("🔄 Polling video status:", { operationName });

      const response = await fetch(`${this.baseUrl}/${operationName}`, {
        headers: {
          "x-goog-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Video status API error: ${response.status} ${errorText}`,
        );
      }

      const result = await response.json();

      if (result.done) {
        if (
          result.response?.generateVideoResponse?.generatedSamples?.[0]?.video
            ?.uri
        ) {
          const videoUrl =
            result.response.generateVideoResponse.generatedSamples[0].video.uri;
          console.log("✅ Video generation completed:", { videoUrl });

          return {
            operationName,
            status: "completed",
            videoUrl,
          };
        } else {
          console.error(
            "❌ Video generation failed - no video URL in response",
          );
          return {
            operationName,
            status: "failed",
          };
        }
      } else {
        console.log("⏳ Video generation still in progress");
        return {
          operationName,
          status: "generating",
        };
      }
    } catch (error) {
      console.error("❌ Error polling video status:", error);
      throw new Error(
        `Failed to poll video status: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Compile a video prompt from story turns
   */
  private compileVideoPrompt(turns: TurnData[], storyTitle: string): string {
    let prompt = `Create a cinematic highlight video for the story "${storyTitle}". `;

    // Add story progression
    prompt += `The video should show the key moments of the story: `;

    // Compile key scenes from turns
    const keyScenes = turns
      .filter((turn) => turn.ai_response && turn.ai_response.length > 50)
      .slice(0, 8) // Limit to 8 key scenes for video length
      .map((turn, index) => {
        return `Scene ${index + 1}: ${turn.ai_response.substring(0, 200)}...`;
      });

    prompt += keyScenes.join(" ");

    // Add video style instructions
    prompt += ` Style: cinematic, dramatic lighting, smooth transitions between scenes. `;
    prompt += `Duration: 8 seconds. `;
    prompt += `Focus on the most dramatic and visually interesting moments. `;
    prompt += `Maintain visual consistency throughout the video.`;

    return prompt;
  }

  /**
   * Download a generated video
   * @param videoUrl - URL of the generated video
   * @returns Promise<Buffer> - Video file data
   */
  async downloadVideo(videoUrl: string): Promise<Buffer> {
    try {
      console.log("📥 Downloading video:", { videoUrl });

      const response = await fetch(videoUrl, {
        headers: {
          "x-goog-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Video download error: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log("✅ Video downloaded:", { sizeBytes: buffer.length });
      return buffer;
    } catch (error) {
      console.error("❌ Error downloading video:", error);
      throw new Error(
        `Failed to download video: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Download and store video in Vercel Blob storage
   * @param videoUrl - URL of the generated video
   * @param videoId - Unique identifier for the video
   * @returns Promise<string> - Vercel Blob URL
   */
  async downloadAndStoreVideo(
    videoUrl: string,
    videoId: string,
  ): Promise<string> {
    try {
      console.log("📥 Downloading and storing video:", { videoUrl, videoId });

      const response = await fetch(videoUrl, {
        headers: {
          "x-goog-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Video download error: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log("✅ Video downloaded:", { sizeBytes: buffer.length });

      // Store in Vercel Blob
      const blob = await put(`story-videos/${videoId}.mp4`, buffer, {
        access: "public",
        contentType: "video/mp4",
      });

      console.log("✅ Video stored in Vercel Blob:", { blobUrl: blob.url });
      return blob.url;
    } catch (error) {
      console.error("❌ Error downloading and storing video:", error);
      throw new Error(
        `Failed to download and store video: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

// Export singleton instance
export const videoGenerationService = VideoGenerationService.getInstance();
