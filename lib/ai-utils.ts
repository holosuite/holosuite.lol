import { AI_CONFIG } from "./ai-config";

// AI SDK error types
export class AIError extends Error {
  constructor(
    message: string,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = "AIError";
  }
}

export class NetworkError extends AIError {
  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
    this.name = "NetworkError";
  }
}

export class ValidationError extends AIError {
  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
    this.name = "ValidationError";
  }
}

export class ParseError extends AIError {
  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
    this.name = "ParseError";
  }
}

// Retry utility with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = AI_CONFIG.retry.maxAttempts,
  baseDelayMs: number = AI_CONFIG.retry.backoffMs,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      console.log(`🔄 Attempt ${attempt} failed, retrying in ${delayMs}ms...`, {
        error: error instanceof Error ? error.message : String(error),
      });

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

// Check if an error is retryable
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network-related errors are retryable
    if (
      message.includes("enotfound") ||
      message.includes("getaddrinfo") ||
      message.includes("cannot connect") ||
      message.includes("timeout") ||
      message.includes("network") ||
      message.includes("fetch")
    ) {
      return true;
    }

    // Rate limiting errors are retryable
    if (
      message.includes("rate limit") ||
      message.includes("too many requests") ||
      message.includes("429")
    ) {
      return true;
    }

    // Server errors (5xx) are retryable
    if (
      message.includes("500") ||
      message.includes("502") ||
      message.includes("503") ||
      message.includes("504")
    ) {
      return true;
    }
  }

  return false;
}

// Enhanced error handling for AI SDK operations
export function handleAIError(error: unknown): never {
  console.error("🚨 AI Operation Error:", error);

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network connectivity issues
    if (
      message.includes("enotfound") ||
      message.includes("getaddrinfo") ||
      message.includes("cannot connect to api")
    ) {
      throw new NetworkError(
        "Network connectivity issue - cannot reach AI service",
        error,
      );
    }

    // JSON parsing errors
    if (message.includes("json") && message.includes("parse")) {
      throw new ParseError("Failed to parse AI response", error);
    }

    // Schema validation errors
    if (message.includes("validation") || message.includes("schema")) {
      throw new ValidationError(
        "AI response doesn't match expected format",
        error,
      );
    }

    // Rate limiting
    if (
      message.includes("rate limit") ||
      message.includes("too many requests")
    ) {
      throw new AIError("Rate limit exceeded - please try again later", error);
    }

    // Generic AI error
    throw new AIError("AI service error", error);
  }

  // Unknown error type
  throw new AIError("Unknown error occurred", error);
}

// Validate AI response object
export function validateAIResponse<T>(
  response: { object?: T },
  schemaName: string,
): T {
  if (!response.object) {
    throw new ValidationError(`No object generated for ${schemaName}`);
  }

  console.log(`✅ ${schemaName} validation successful:`, {
    hasObject: !!response.object,
    objectKeys: response.object ? Object.keys(response.object as object) : [],
  });

  return response.object;
}
