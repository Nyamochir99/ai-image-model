import { GoogleGenerativeAI } from "@google/generative-ai";

// Stable, high-capacity text/vision model.
export const GEMINI_MODEL = "gemini-2.0-flash";
// Image generation model ("nano banana").
export const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";

export function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local (see .env.example)."
    );
  }
  return apiKey;
}

export function getGeminiModel(model: string = GEMINI_MODEL) {
  return new GoogleGenerativeAI(getApiKey()).getGenerativeModel({ model });
}

/**
 * Retry a Gemini call when the model is temporarily overloaded (503 / 429).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 1200
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const message = (error as Error)?.message ?? "";
      // Only retry transient overloads (503). Do NOT retry 429 quota errors —
      // the daily quota will not recover within seconds and retrying wastes it.
      const retryable = /\b(503|overloaded|high demand|unavailable)\b/i.test(
        message
      );
      if (!retryable || attempt === retries) break;
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
  throw lastError;
}
