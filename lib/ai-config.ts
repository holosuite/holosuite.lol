// Configuration for AI services
export const AI_CONFIG = {
  google: {
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    model: "gemini-2.5-flash",
    temperature: 0.7, // For creative content generation
    topP: 0.9, // Alternative to temperature for nucleus sampling
  },
  retry: {
    maxAttempts: 3,
    backoffMs: 1000,
  },
  streaming: {
    enabled: true,
    chunkSize: 1000,
  },
};

// Log AI configuration status (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("🤖 AI Configuration:", {
    model: AI_CONFIG.google.model,
    temperature: AI_CONFIG.google.temperature,
    topP: AI_CONFIG.google.topP,
    hasApiKey: !!AI_CONFIG.google.apiKey,
    apiKeyLength: AI_CONFIG.google.apiKey ? AI_CONFIG.google.apiKey.length : 0,
    apiKeyPrefix: AI_CONFIG.google.apiKey
      ? AI_CONFIG.google.apiKey.substring(0, 10) + "..."
      : "none",
    envVar: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "present" : "missing",
  });
}
