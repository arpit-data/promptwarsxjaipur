/**
 * @module ai-gateway.server
 * @description Gemini AI provider factory for server-side API routes.
 * Uses @ai-sdk/google for Vercel AI SDK compatibility.
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Creates a Google Generative AI provider instance.
 * Checks multiple env var names for compatibility with different deployment targets.
 */
export function createGeminiProvider() {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable. " +
      "Get a key from https://aistudio.google.com/app/apikey"
    );
  }
  return createGoogleGenerativeAI({ apiKey });
}
