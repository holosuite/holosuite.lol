import { GoogleGenAI } from "@google/genai";
import { put } from "@vercel/blob";
import { AI_CONFIG } from "./ai-config";

// Image generation result interface
export interface ImageGenerationResult {
  imageUrl: string; // Data URL for immediate display
  imageData: string; // Base64 encoded image data
  imagePrompt: string;
  blobUrl?: string; // Vercel Blob URL for persistent storage
  imageId?: string; // Unique identifier for the image
}

// Image generation service for story simulations
export class ImageGenerationService {
  private static instance: ImageGenerationService;
  private ai: GoogleGenAI;

  private constructor() {
    this.ai = new GoogleGenAI({});
  }

  static getInstance(): ImageGenerationService {
    if (!ImageGenerationService.instance) {
      ImageGenerationService.instance = new ImageGenerationService();
    }
    return ImageGenerationService.instance;
  }

  /**
   * Generate an image for a story scene with visual continuity
   * @param sceneDescription - Description of the current scene
   * @param characterContext - Information about the character being played
   * @param previousImages - Array of previous image prompts for continuity
   * @param storyStyle - Visual style of the story
   * @param uploadToBlob - Whether to upload the image to Vercel Blob storage
   * @returns Promise<ImageGenerationResult>
   */
  async generateStoryImage(
    sceneDescription: string,
    characterContext: string,
    previousImages: string[] = [],
    storyStyle: string = "cinematic",
    uploadToBlob: boolean = true,
  ): Promise<ImageGenerationResult> {
    try {
      console.log("🎨 Generating story image:", {
        sceneLength: sceneDescription.length,
        hasCharacterContext: !!characterContext,
        previousImagesCount: previousImages.length,
        storyStyle,
        uploadToBlob,
      });

      // Build the image prompt with continuity considerations
      const imagePrompt = this.buildImagePrompt(
        sceneDescription,
        characterContext,
        previousImages,
        storyStyle,
      );

      console.log("📝 Image prompt:", imagePrompt);

      // Generate image using Imagen 4.0
      const imageData = await this.generateImageViaAPI(imagePrompt);

      // Generate unique image ID
      const imageId = `story-image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const result: ImageGenerationResult = {
        imageUrl: `data:image/png;base64,${imageData}`,
        imageData: imageData,
        imagePrompt: imagePrompt,
        imageId: imageId,
      };

      // Upload to Vercel Blob storage if requested
      if (uploadToBlob) {
        try {
          const blobUrl = await this.uploadImageToBlob(imageData, imageId);
          result.blobUrl = blobUrl;
          console.log("✅ Image uploaded to Vercel Blob:", { blobUrl });
        } catch (blobError) {
          console.error(
            "⚠️ Failed to upload to Vercel Blob, continuing with data URL:",
            blobError,
          );
        }
      }

      return result;
    } catch (error) {
      console.error("❌ Error generating story image:", error);
      throw new Error(
        `Failed to generate image: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Build a comprehensive image prompt for story generation
   */
  private buildImagePrompt(
    sceneDescription: string,
    characterContext: string,
    previousImages: string[],
    storyStyle: string,
  ): string {
    let prompt = `Create a ${storyStyle} image for an interactive story. `;

    // Add scene description
    prompt += `Scene: ${sceneDescription}. `;

    // Add character context
    if (characterContext) {
      prompt += `Character: ${characterContext}. `;
    }

    // Add continuity instructions if we have previous images
    if (previousImages.length > 0) {
      prompt += `Maintain visual consistency with previous scenes. `;
      prompt += `Previous scene elements to consider: ${previousImages.slice(-2).join(", ")}. `;
    }

    // Add style and quality instructions
    prompt += `Style: ${storyStyle}, high quality, detailed, atmospheric lighting. `;
    prompt += `Avoid text or words in the image. Focus on the environment, characters, and mood.`;

    return prompt;
  }

  /**
   * Generate image via Google GenAI API using Imagen 4.0
   * This uses the actual Google GenAI image generation API or fake generator
   */
  private async generateImageViaAPI(prompt: string): Promise<string> {
    // Check if we should use fake image generator
    if (AI_CONFIG.fakeGenerators.useFakeImageGenerator) {
      console.log("🎭 Using fake image generator for prompt:", prompt);
      return this.generateFakeImage(prompt);
    }

    try {
      console.log("🔄 Calling Google GenAI API with prompt:", prompt);

      // Use Google's Imagen 4.0 model for image generation
      const imageResponse = await this.ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt: prompt,
        config: {
          numberOfImages: 1,
          imageSize: "1K",
          aspectRatio: "1:1",
        },
      });

      const imageData = imageResponse.generatedImages?.[0]?.image?.imageBytes;

      if (!imageData) {
        throw new Error("No image generated by GenAI API");
      }

      console.log("✅ Image generation completed successfully");
      return imageData;
    } catch (error) {
      console.error("❌ Error calling Google GenAI API:", error);

      // Fallback to fake image if API fails
      console.log("🔄 Falling back to fake image generator");
      return this.generateFakeImage(prompt);
    }
  }

  /**
   * Generate a fake image using SVG for development/testing
   * Creates a deterministic placeholder image with scene information
   */
  private async generateFakeImage(prompt: string): Promise<string> {
    try {
      // Add simulated delay for realism
      await new Promise((resolve) =>
        setTimeout(resolve, AI_CONFIG.fakeGenerators.imageDelayMs),
      );

      // Create a deterministic color scheme based on prompt hash
      const promptHash = this.simpleHash(prompt);
      const colors = this.getColorScheme(promptHash);

      // Truncate prompt for display (max 100 chars)
      const displayPrompt =
        prompt.length > 100 ? prompt.substring(0, 100) + "..." : prompt;

      // Generate timestamp
      const timestamp = new Date().toLocaleTimeString();

      // Create SVG image with scene information
      const svg = `
        <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="1024" height="1024" fill="url(#bg)" />
          <rect x="50" y="50" width="924" height="924" fill="none" stroke="${colors.accent}" stroke-width="4" rx="20" />
          
          <!-- Title -->
          <text x="512" y="200" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
                text-anchor="middle" fill="${colors.text}" stroke="${colors.accent}" stroke-width="2">
            FAKE IMAGE GENERATOR
          </text>
          
          <!-- Scene Description -->
          <text x="512" y="300" font-family="Arial, sans-serif" font-size="24" 
                text-anchor="middle" fill="${colors.text}" stroke="${colors.accent}" stroke-width="1">
            Scene: ${this.escapeXml(displayPrompt)}
          </text>
          
          <!-- Decorative elements -->
          <circle cx="200" cy="400" r="80" fill="${colors.accent}" opacity="0.3" />
          <circle cx="824" cy="600" r="60" fill="${colors.accent}" opacity="0.3" />
          <rect x="300" y="500" width="200" height="100" fill="${colors.accent}" opacity="0.2" rx="10" />
          
          <!-- Timestamp -->
          <text x="512" y="800" font-family="Arial, sans-serif" font-size="20" 
                text-anchor="middle" fill="${colors.text}" opacity="0.7">
            Generated: ${timestamp}
          </text>
          
          <!-- Hash indicator -->
          <text x="512" y="850" font-family="Arial, sans-serif" font-size="16" 
                text-anchor="middle" fill="${colors.text}" opacity="0.5">
            Hash: ${promptHash.toString(16)}
          </text>
        </svg>
      `;

      // Convert SVG to base64 PNG data
      const base64Svg = Buffer.from(svg).toString("base64");
      const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

      // For simplicity, we'll return the SVG as base64
      // In a real implementation, you might want to convert SVG to PNG using canvas
      const svgBuffer = Buffer.from(svg);
      const base64Data = svgBuffer.toString("base64");

      console.log("✅ Fake image generated successfully");
      return base64Data;
    } catch (error) {
      console.error("❌ Error generating fake image:", error);

      // Ultimate fallback - minimal placeholder
      const placeholderImage =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

      return placeholderImage;
    }
  }

  /**
   * Simple hash function for deterministic color schemes
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get color scheme based on hash
   */
  private getColorScheme(hash: number): {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  } {
    const schemes = [
      {
        primary: "#1e3a8a",
        secondary: "#3b82f6",
        accent: "#fbbf24",
        text: "#ffffff",
      }, // Blue theme
      {
        primary: "#7c2d12",
        secondary: "#dc2626",
        accent: "#f59e0b",
        text: "#ffffff",
      }, // Red theme
      {
        primary: "#14532d",
        secondary: "#16a34a",
        accent: "#84cc16",
        text: "#ffffff",
      }, // Green theme
      {
        primary: "#581c87",
        secondary: "#9333ea",
        accent: "#a855f7",
        text: "#ffffff",
      }, // Purple theme
      {
        primary: "#7c2d12",
        secondary: "#ea580c",
        accent: "#f97316",
        text: "#ffffff",
      }, // Orange theme
    ];

    return schemes[hash % schemes.length];
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Upload image data to Vercel Blob storage
   * @param imageData - Base64 encoded image data
   * @param imageId - Unique identifier for the image
   * @returns Promise<string> - Vercel Blob URL
   */
  private async uploadImageToBlob(
    imageData: string,
    imageId: string,
  ): Promise<string> {
    try {
      console.log("📤 Uploading image to Vercel Blob:", { imageId });

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(imageData, "base64");

      // Upload to Vercel Blob storage
      const blob = await put(`story-images/${imageId}.png`, imageBuffer, {
        access: "public",
        contentType: "image/png",
      });

      console.log("✅ Image uploaded to Vercel Blob:", { blobUrl: blob.url });
      return blob.url;
    } catch (error) {
      console.error("❌ Error uploading image to Vercel Blob:", error);
      throw new Error(
        `Failed to upload image to blob storage: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Generate an image for the initial story scene
   */
  async generateInitialSceneImage(
    storyTitle: string,
    initialScene: string,
    storyStyle: string,
    uploadToBlob: boolean = true,
  ): Promise<ImageGenerationResult> {
    const sceneDescription = `Opening scene of "${storyTitle}": ${initialScene}`;
    const characterContext = "The main character entering the scene";

    return this.generateStoryImage(
      sceneDescription,
      characterContext,
      [],
      storyStyle,
      uploadToBlob,
    );
  }

  /**
   * Generate an image for a story turn with continuity
   */
  async generateTurnImage(
    turnDescription: string,
    characterContext: string,
    previousTurnImages: string[],
    storyStyle: string,
    uploadToBlob: boolean = true,
  ): Promise<ImageGenerationResult> {
    return this.generateStoryImage(
      turnDescription,
      characterContext,
      previousTurnImages,
      storyStyle,
      uploadToBlob,
    );
  }
}

// Export singleton instance
export const imageGenerationService = ImageGenerationService.getInstance();
