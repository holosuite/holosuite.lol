/**
 * Navigation utilities for simulation-related routes
 */

export function createSimulationUrl(
  simulationId: string,
  prompt?: string,
): string {
  const baseUrl = `/simulations/${simulationId}`;

  if (prompt) {
    const encodedPrompt = encodeURIComponent(prompt.trim());
    return `${baseUrl}?prompt=${encodedPrompt}`;
  }

  return baseUrl;
}

export function navigateToSimulation(prompt: string): void {
  const encodedPrompt = encodeURIComponent(prompt.trim());
  window.location.href = `/simulations?prompt=${encodedPrompt}`;
}

export function createSimulationsUrl(prompt?: string): string {
  const baseUrl = "/simulations";

  if (prompt) {
    const encodedPrompt = encodeURIComponent(prompt.trim());
    return `${baseUrl}?prompt=${encodedPrompt}`;
  }

  return baseUrl;
}
