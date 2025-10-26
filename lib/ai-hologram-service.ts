import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import {
  HologramsSchema,
  HologramCommandSchema,
  type Hologram,
  type Holograms,
  type HologramCommand,
} from "./hologram-schema";
import { AI_CONFIG } from "./ai-config";
import { withRetry, handleAIError, validateAIResponse } from "./ai-utils";

// AI service for generating and managing holograms from natural language
export class HologramGenerator {
  private getModel() {
    // Use Google Gemini 2.5-flash with configuration
    return google("gemini-2.5-flash");
  }

  async generateHolograms(
    prompt: string,
    simulationContext?: string,
  ): Promise<Holograms> {
    console.log("🎯 generateHolograms called with prompt:", prompt);
    console.log("🔑 Using Google Gemini 2.5-flash for hologram generation");

    const systemPrompt = `You are an expert character designer and AI simulation architect specializing in creating immersive holographic characters.

Your expertise includes:
- Character design and personality development
- Acting instruction creation for AI characters
- Wardrobe and appearance design
- Simulation character integration

When analyzing natural language descriptions, create comprehensive hologram specifications that include:

1. **Character Identity**: 
   - Name that fits the simulation context
   - Clear, memorable character identity

2. **Acting Instructions**: 
   - Specific behavioral guidelines
   - Personality traits and mannerisms
   - Communication style and tone

3. **Descriptions**: 
   - Physical appearance details
   - Personality characteristics
   - Background and role context

4. **Wardrobe**: 
   - Clothing appropriate to the simulation setting
   - Accessories and equipment
   - Style preferences

Focus on creating engaging, consistent characters that enhance the simulation experience.`;

    const userPrompt = simulationContext
      ? `Simulation Context: ${simulationContext}\n\nCreate holograms based on: "${prompt}"`
      : `Create holograms based on: "${prompt}"`;

    try {
      const result = await withRetry(async () => {
        return await generateObject({
          model: this.getModel(),
          schema: HologramsSchema,
          system: systemPrompt,
          prompt: userPrompt,
          temperature: AI_CONFIG.google.temperature,
          topP: AI_CONFIG.google.topP,
        });
      });

      const holograms = validateAIResponse(result, "Holograms");

      console.log("✅ Holograms generated successfully:", {
        hologramsCount: holograms.holograms.length,
        hologramNames: holograms.holograms.map((h) => h.name),
      });

      return holograms;
    } catch (error) {
      console.error("❌ Error generating holograms:", error);
      handleAIError(error);
    }
  }

  async updateHolograms(
    prompt: string,
    currentHolograms: Hologram[],
    simulationContext?: string,
  ): Promise<Holograms> {
    console.log("🔄 updateHolograms called with prompt:", prompt);
    console.log(
      "Current holograms:",
      currentHolograms.map((h) => h.name),
    );

    const systemPrompt = `You are an expert character designer updating existing holographic characters.

You will receive:
- Current hologram data
- Update instructions
- Simulation context

Your task is to update the holograms based on the instructions while maintaining consistency with existing character traits and the simulation setting.

Guidelines:
- Preserve core character identity unless explicitly asked to change
- Update specific aspects mentioned in the prompt
- Ensure changes are logical and enhance the character
- Maintain consistency with simulation context`;

    const userPrompt = `Simulation Context: ${simulationContext || "General simulation"}

Current Holograms:
${currentHolograms
  .map((h) => `- ${h.name}: ${h.descriptions.join(", ")}`)
  .join("\n")}

Update Request: "${prompt}"

Please update the holograms based on this request.`;

    try {
      const result = await withRetry(async () => {
        return await generateObject({
          model: this.getModel(),
          schema: HologramsSchema,
          system: systemPrompt,
          prompt: userPrompt,
          temperature: AI_CONFIG.google.temperature,
          topP: AI_CONFIG.google.topP,
        });
      });

      const holograms = validateAIResponse(result, "Holograms");

      console.log("✅ Holograms updated successfully:", {
        hologramsCount: holograms.holograms.length,
        hologramNames: holograms.holograms.map((h) => h.name),
      });

      return holograms;
    } catch (error) {
      console.error("❌ Error updating holograms:", error);
      handleAIError(error);
    }
  }

  async parseHologramCommand(
    prompt: string,
    existingHolograms: string[] = [],
  ): Promise<HologramCommand> {
    console.log("🔍 parseHologramCommand called with prompt:", prompt);
    console.log("📋 Existing holograms:", existingHolograms);

    const systemPrompt = `You are an expert command parser for hologram management.

Analyze the user's natural language input and determine:
1. The action to perform (create, update, remove, transfer)
2. Target hologram name (if applicable)
3. Target simulation (for transfer)

IMPORTANT RULES:
- If the prompt mentions an existing hologram name (from the list), it's likely an UPDATE
- If the prompt says "create", "add", "new" + a NEW name, it's CREATE
- If the prompt says "update", "modify", "change" + existing name, it's UPDATE
- If the prompt says "remove", "delete" + existing name, it's REMOVE
- If the prompt says "transfer", "move" + existing name, it's TRANSFER

Existing holograms: ${existingHolograms.join(", ")}

Command patterns:
- CREATE: "create hologram [NEW_NAME]", "add character [NEW_NAME]", "new hologram [NEW_NAME]"
- UPDATE: "update hologram [EXISTING_NAME]", "modify [EXISTING_NAME]", "change [EXISTING_NAME]"
- REMOVE: "remove hologram [EXISTING_NAME]", "delete [EXISTING_NAME]", "remove [EXISTING_NAME]"
- TRANSFER: "transfer hologram [EXISTING_NAME]", "move [EXISTING_NAME] to simulation"

Extract the hologram name and determine if it matches an existing hologram.`;

    const userPrompt = `Parse this hologram management command: "${prompt}"

Existing holograms: ${existingHolograms.join(", ")}

Determine the action and extract the target hologram name.`;

    try {
      const result = await withRetry(async () => {
        return await generateObject({
          model: this.getModel(),
          schema: HologramCommandSchema,
          system: systemPrompt,
          prompt: userPrompt,
          temperature: 0.3, // Lower temperature for more consistent parsing
          topP: 0.8,
        });
      });

      const command = validateAIResponse(result, "HologramCommand");

      console.log("✅ Command parsed successfully:", {
        action: command.action,
        targetHologram: command.targetHologram,
        targetSimulation: command.targetSimulation,
      });

      return command;
    } catch (error) {
      console.error("❌ Error parsing hologram command:", error);

      // Enhanced fallback parsing with existing hologram awareness
      const lowerPrompt = prompt.toLowerCase();
      const existingHologramsLower = existingHolograms.map((name) =>
        name.toLowerCase(),
      );

      // Check if any existing hologram name is mentioned
      const mentionedHologram = existingHologramsLower.find((name) =>
        lowerPrompt.includes(name),
      );

      if (
        lowerPrompt.includes("create") ||
        lowerPrompt.includes("add") ||
        lowerPrompt.includes("new")
      ) {
        return { action: "create" };
      } else if (
        lowerPrompt.includes("update") ||
        lowerPrompt.includes("modify") ||
        lowerPrompt.includes("change")
      ) {
        return {
          action: "update",
          targetHologram: mentionedHologram || undefined,
        };
      } else if (
        lowerPrompt.includes("remove") ||
        lowerPrompt.includes("delete")
      ) {
        return {
          action: "remove",
          targetHologram: mentionedHologram || undefined,
        };
      } else if (
        lowerPrompt.includes("transfer") ||
        lowerPrompt.includes("move")
      ) {
        return {
          action: "transfer",
          targetHologram: mentionedHologram || undefined,
        };
      }

      // If an existing hologram is mentioned but no clear action, assume update
      if (mentionedHologram) {
        return {
          action: "update",
          targetHologram: mentionedHologram,
        };
      }

      return { action: "create" }; // Default to create
    }
  }

  // Helper method to detect hologram-related commands
  static isHologramCommand(prompt: string): boolean {
    const hologramKeywords = [
      "hologram",
      "character",
      "npc",
      "actor",
      "persona",
      "create hologram",
      "add character",
      "new hologram",
      "update hologram",
      "modify character",
      "change character",
      "remove hologram",
      "delete character",
      "remove character",
      "transfer hologram",
      "move character",
      "move hologram",
    ];

    const lowerPrompt = prompt.toLowerCase();
    return hologramKeywords.some((keyword) => lowerPrompt.includes(keyword));
  }
}

// Singleton instance
export const hologramGenerator = new HologramGenerator();
