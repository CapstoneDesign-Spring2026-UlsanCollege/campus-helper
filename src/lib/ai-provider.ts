import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';

export function getConfiguredAIModels() {
  const models = [];
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (geminiKey) {
    const google = createGoogleGenerativeAI({ apiKey: geminiKey });
    models.push({ name: 'Gemini', model: google('gemini-2.5-flash') });
  }

  if (process.env.OPENAI_API_KEY) {
    models.push({ name: 'OpenAI', model: openai('gpt-4o-mini') });
  }

  return models;
}

export function getConfiguredAIModel() {
  return getConfiguredAIModels()[0]?.model || null;
}

export function getAIErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (message.includes('insufficient_quota') || lower.includes('quota')) {
    return 'The AI assistant is connected, but the configured AI provider has no available quota. Please check billing, usage limits, or use a key from a project with available credits.';
  }

  if (lower.includes('api key') || lower.includes('authentication')) {
    return 'The AI assistant could not authenticate with the configured AI provider. Please check GEMINI_API_KEY or OPENAI_API_KEY.';
  }

  return 'The AI assistant could not complete the response. Please try again in a moment.';
}
