import { z } from "zod";

// Hologram Schema for AI Object Generation
export const HologramSchema = z.object({
  name: z.string().describe("The name of the hologram character"),
  actingInstructions: z
    .array(z.string())
    .describe("Array of acting instructions for the hologram"),
  descriptions: z
    .array(z.string())
    .describe(
      "Array of descriptions for the hologram's appearance and personality",
    ),
  wardrobe: z
    .array(z.string())
    .describe("Array of clothing and accessories for the hologram"),
});

export type Hologram = z.infer<typeof HologramSchema>;

// Schema for multiple holograms
export const HologramsSchema = z.object({
  holograms: z
    .array(HologramSchema)
    .describe("Array of holograms to create or update"),
});

export type Holograms = z.infer<typeof HologramsSchema>;

// Schema for hologram command parsing
export const HologramCommandSchema = z.object({
  action: z
    .enum(["create", "update", "remove", "transfer"])
    .describe("The action to perform on holograms"),
  targetHologram: z
    .string()
    .optional()
    .describe(
      "Name or ID of the hologram to target (for update/remove/transfer)",
    ),
  targetSimulation: z
    .string()
    .optional()
    .describe("Target simulation ID (for transfer action)"),
  holograms: z
    .array(HologramSchema)
    .optional()
    .describe("Holograms to create or update"),
});

export type HologramCommand = z.infer<typeof HologramCommandSchema>;

// Database hologram interface (includes database fields)
export interface HologramRow {
  id: string;
  simulation_id: string;
  name: string;
  acting_instructions: string[];
  descriptions: string[];
  wardrobe: string[];
  created_at: string;
  updated_at: string;
}
