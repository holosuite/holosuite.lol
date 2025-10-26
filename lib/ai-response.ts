export interface AIResponseConfig {
  prompt: string;
  delay?: {
    submitted?: number;
    streaming?: number;
  };
}

export const DEFAULT_AI_DELAYS = {
  submitted: 1000,
  streaming: 2000,
} as const;

export function simulateAIResponse(
  config: AIResponseConfig,
  callbacks: {
    onSubmitted: () => void;
    onStreaming: () => void;
    onComplete: (response: string) => void;
  },
): void {
  const { prompt, delay = DEFAULT_AI_DELAYS } = config;

  // Start with submitted status
  callbacks.onSubmitted();

  setTimeout(() => {
    // Move to streaming status
    callbacks.onStreaming();

    setTimeout(() => {
      // Complete with response
      const response = generateSimulationResponse(prompt);
      callbacks.onComplete(response);
    }, delay.streaming);
  }, delay.submitted);
}

function generateSimulationResponse(prompt: string): string {
  return `I understand you want to work on: "${prompt}". Let me help you design a simulation for this. I can create interactive environments, character behaviors, and dynamic scenarios. What specific aspects would you like me to focus on first?`;
}
