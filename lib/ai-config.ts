// Configuration for AI services
export const AI_CONFIG = {
  google: {
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    model: "gemini-2.5-flash",
  },
};

// Log AI configuration status
console.log("🤖 AI Configuration:", {
  model: AI_CONFIG.google.model,
  hasApiKey: !!AI_CONFIG.google.apiKey,
  apiKeyLength: AI_CONFIG.google.apiKey ? AI_CONFIG.google.apiKey.length : 0,
  apiKeyPrefix: AI_CONFIG.google.apiKey
    ? AI_CONFIG.google.apiKey.substring(0, 10) + "..."
    : "none",
  envVar: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "present" : "missing",
});
