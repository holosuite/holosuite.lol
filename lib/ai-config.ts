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
  // Fake generators configuration for development/testing
  fakeGenerators: {
    // Auto-detect: use fake generators when API key is missing
    // Manual override: USE_FAKE_IMAGE_GENERATOR=true/false
    useFakeImageGenerator: true,
    // process.env.USE_FAKE_IMAGE_GENERATOR
    //   ? process.env.USE_FAKE_IMAGE_GENERATOR === "true"
    //   : !process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    // Manual override: USE_FAKE_VIDEO_GENERATOR=true/false
    useFakeVideoGenerator: true,
    //  process.env.USE_FAKE_VIDEO_GENERATOR
    //   ? process.env.USE_FAKE_VIDEO_GENERATOR === "true"
    //   : !process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    // Fake generator behavior settings
    imageDelayMs: 500, // Simulated delay for image generation
    videoDelayMs: 1000, // Simulated delay for video generation
    successRate: 1.0, // Always succeed for testing
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
    fakeGenerators: {
      useFakeImageGenerator: AI_CONFIG.fakeGenerators.useFakeImageGenerator,
      useFakeVideoGenerator: AI_CONFIG.fakeGenerators.useFakeVideoGenerator,
      imageDelayMs: AI_CONFIG.fakeGenerators.imageDelayMs,
      videoDelayMs: AI_CONFIG.fakeGenerators.videoDelayMs,
    },
  });
}
