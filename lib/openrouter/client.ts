import OpenAI from "openai";

// Lazy initialization to avoid build-time errors
let _openrouter: OpenAI | null = null;

export function getOpenRouter(): OpenAI {
  if (!_openrouter) {
    _openrouter = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Sincron Grupos",
      },
    });
  }
  return _openrouter;
}

// Legacy export for compatibility
export const openrouter = {
  get chat() {
    return getOpenRouter().chat;
  },
};

// Available models
export const MODELS = {
  // Main model for function calling
  GPT_4_1_MINI: "openai/gpt-4.1-mini",
  GPT_4O_MINI: "openai/gpt-4o-mini",
  GPT_4O: "openai/gpt-4o",
  CLAUDE_HAIKU: "anthropic/claude-3-haiku",
  CLAUDE_SONNET: "anthropic/claude-3.5-sonnet",
} as const;

export type ModelId = (typeof MODELS)[keyof typeof MODELS];

// Default model for agent
export const DEFAULT_MODEL = MODELS.GPT_4_1_MINI;
