import { GoogleGenAI } from "@google/genai";
import type { TurnData } from "./story-schema";
import { put } from "@vercel/blob";

// Define proper types for Google GenAI API responses
interface VideoFile {
  uri?: string;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface GenerateVideosOperation {
  name?: string;
  done?: boolean;
  response?: {
    generatedVideos?: Array<{
      video?: VideoFile;
    }>;
  };
  [key: string]: unknown;
}

// Video generation result interface
export interface VideoGenerationResult {
  operation: unknown; // Store the operation object for polling
  status: string;
  videoUrl?: string;
  blobUrl?: string; // Vercel Blob URL for persistent storage
}

// Video generation service for story highlights using Veo 3
export class VideoGenerationService {
  private static instance: VideoGenerationService;
  private ai: GoogleGenAI;

  private constructor() {
    this.ai = new GoogleGenAI({});
  }

  static getInstance(): VideoGenerationService {
    if (!VideoGenerationService.instance) {
      VideoGenerationService.instance = new VideoGenerationService();
    }
    return VideoGenerationService.instance;
  }

  /**
   * Generate a highlight video from story turns with image references
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
        imageCount: turns.filter((t) => t.image_url).length,
      });

      // Compile video prompt from turns with image references
      const videoPrompt = this.compileVideoPrompt(turns, storyTitle);

      console.log("📝 Video prompt:", videoPrompt);

      // Prepare image references for video generation
      const imageReferences = turns
        .filter((turn) => turn.image_url && turn.image_prompt)
        .slice(0, 5) // Limit to 5 key images to avoid overwhelming the model
        .map((turn) => ({
          imageUrl: turn.image_url,
          description: turn.image_prompt,
        }));

      console.log("🖼️ Image references:", {
        count: imageReferences.length,
        descriptions: imageReferences.map((ref) => ref.description),
      });

      // Call Veo 3 API to start video generation with image references
      const operation = await this.ai.models.generateVideos({
        model: "veo-3.1-generate-preview",
        prompt: videoPrompt,
        // Include image references if available
        ...(imageReferences.length > 0 && {
          imageReferences: imageReferences.map((ref) => ({
            image: ref.imageUrl,
            description: ref.description,
          })),
        }),
      });

      console.log("✅ Video generation started:", {
        operationName: operation.name,
        hasImageReferences: imageReferences.length > 0,
      });

      return {
        operation: operation,
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
   * @param operation - The operation object returned from generateHighlightVideo
   * @returns Promise<VideoGenerationResult>
   */
  async pollVideoStatus(operation: unknown): Promise<VideoGenerationResult> {
    try {
      const operationName = (operation as { name?: string })?.name || "unknown";
      console.log("🔄 Polling video status:", { operationName });

      // Poll the operation status until the video is ready (following official docs)
      const updatedOperation = await this.ai.operations.getVideosOperation({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        operation: operation as any,
      });

      if (updatedOperation.done) {
        if (updatedOperation.response?.generatedVideos?.[0]?.video) {
          const videoUrl =
            updatedOperation.response.generatedVideos[0].video.uri;
          console.log("✅ Video generation completed:", { videoUrl });

          return {
            operation: updatedOperation,
            status: "completed",
            videoUrl,
          };
        } else {
          console.error(
            "❌ Video generation failed - no video URL in response",
          );
          return {
            operation: updatedOperation,
            status: "failed",
          };
        }
      } else {
        console.log("⏳ Video generation still in progress");
        return {
          operation: updatedOperation,
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
   * Compile a video prompt from story turns with image references
   */
  private compileVideoPrompt(turns: TurnData[], storyTitle: string): string {
    let prompt = `Create a cinematic masterpiece highlight video for the story "${storyTitle}". `;
    prompt += `This video should be inspired by the sequence of images generated for each story turn, creating a truly unique and engaging visual experience. `;

    // Add story progression with enhanced image references
    prompt += `The video should showcase the key moments of the story with seamless visual continuity: `;

    // Compile key scenes from turns with enhanced image prompts
    const keyScenes = turns
      .filter((turn) => turn.ai_response && turn.ai_response.length > 50)
      .slice(0, 8) // Limit to 8 key scenes for video length
      .map((turn, index) => {
        let scene = `Scene ${index + 1}: ${turn.ai_response.substring(0, 200)}...`;

        // Add enhanced image prompt if available for visual inspiration
        if (turn.image_prompt) {
          scene += ` Visual inspiration: "${turn.image_prompt}". `;
          scene += `Use this visual style to maintain artistic consistency and create smooth transitions. `;
        }

        return scene;
      });

    prompt += keyScenes.join(" ");

    // Add enhanced video style instructions for maximum appeal
    prompt += ` Style: cinematic masterpiece, dramatic lighting, professional cinematography, smooth transitions between scenes. `;
    prompt += `Use the visual style and composition from the reference images to maintain artistic consistency throughout the video. `;
    prompt += `Create dynamic camera movements and engaging visual effects that will captivate viewers. `;
    prompt += `Duration: 8 seconds. `;
    prompt += `Focus on the most dramatic, emotional, and visually stunning moments that will resonate with audiences. `;
    prompt += `Create smooth transitions that flow naturally between the different visual styles shown in the images. `;
    prompt += `Ensure the video captures the same mood, atmosphere, and visual quality as the reference images. `;
    prompt += `Make it visually spectacular and emotionally engaging - something that will truly inspire and delight viewers. `;
    prompt += `Use advanced cinematography techniques like depth of field, dynamic lighting, and creative framing to create a professional, movie-quality result.`;

    return prompt;
  }

  /**
   * Download a generated video (following official docs pattern)
   * @param videoFile - The video file object from the operation response
   * @returns Promise<Buffer> - Video file data
   */
  async downloadVideo(videoFile: VideoFile): Promise<Buffer> {
    try {
      console.log("📥 Downloading video:", { videoFile });

      // Download the video file to a temporary path (following official docs)
      const tempPath = `/tmp/video_${Date.now()}.mp4`;
      await this.ai.files.download({
        file: videoFile,
        downloadPath: tempPath,
      });

      // Read the file and return as buffer
      const fs = await import("fs");
      const buffer = fs.readFileSync(tempPath);

      // Clean up temporary file
      fs.unlinkSync(tempPath);

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
   * Download and store video in Vercel Blob storage (following official docs)
   * @param videoFile - The video file object from the operation response
   * @param videoId - Unique identifier for the video
   * @returns Promise<string> - Vercel Blob URL
   */
  async downloadAndStoreVideo(
    videoFile: VideoFile,
    videoId: string,
  ): Promise<string> {
    try {
      console.log("📥 Downloading and storing video:", { videoId });

      // Download the video file to a temporary path (following official docs)
      const tempPath = `/tmp/video_${videoId}_${Date.now()}.mp4`;
      await this.ai.files.download({
        file: videoFile,
        downloadPath: tempPath,
      });

      // Read the file
      const fs = await import("fs");
      const videoBuffer = fs.readFileSync(tempPath);

      // Clean up temporary file
      fs.unlinkSync(tempPath);

      console.log("✅ Video downloaded:", { sizeBytes: videoBuffer.length });

      // Store in Vercel Blob
      const blob = await put(`story-videos/${videoId}.mp4`, videoBuffer, {
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
