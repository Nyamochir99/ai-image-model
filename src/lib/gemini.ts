import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Tried in order. If a model is overloaded (503) or rate limited, we fall
 * back to the next one instead of failing.
 */
export const FALLBACK_MODELS = [
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-flash-lite-latest",
  "gemini-2.5-flash",
];

export function getGeminiModel(model = FALLBACK_MODELS[0]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model });
}

type GenerateRequest = Parameters<
  ReturnType<typeof getGeminiModel>["generateContent"]
>[0];

function isTransient(message: string) {
  return /\b(429|503)\b|overloaded|quota|rate.?limit|high demand|unavailable/i.test(
    message
  );
}

/**
 * Generate content with automatic retry per model and fallback across models
 * when Gemini is overloaded or rate limited.
 */
export async function generateContent(request: GenerateRequest) {
  let lastError: unknown;
  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = getGeminiModel(modelName);
      return await withRetry(() => model.generateContent(request));
    } catch (error) {
      lastError = error;
      if (!isTransient((error as Error).message ?? "")) throw error;
    }
  }
  throw lastError;
}

/**
 * Retry a Gemini call when the model is temporarily overloaded (503) or
 * rate limited (429).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 4,
  delayMs = 2000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const message = (error as Error).message ?? "";
      const retriable = /\b(429|503)\b|overloaded|rate.?limit/i.test(message);
      if (!retriable || attempt === retries) break;
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
  throw lastError;
}
