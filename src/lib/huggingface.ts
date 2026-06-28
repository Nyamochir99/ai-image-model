import { InferenceClient } from "@huggingface/inference";

export const FLUX_IMAGE_MODEL = "black-forest-labs/FLUX.1-schnell";

export function getHfClient() {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error(
      "HF_TOKEN is not set. Create a token at https://huggingface.co/settings/tokens and add it to .env."
    );
  }
  return new InferenceClient(token);
}

/**
 * Retry a Hugging Face call when the model is temporarily loading/overloaded
 * (503) or rate limited (429).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 3000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const message = (error as Error).message ?? "";
      const retriable = /\b(429|503)\b|loading|overloaded|rate.?limit/i.test(
        message
      );
      if (!retriable || attempt === retries) break;
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
  throw lastError;
}
