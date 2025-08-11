// Client-safe facade; real OpenAI client only available server-side via openai-server.ts
export const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;

// These functions are server-only; in client they return null to avoid bundling the SDK
export function getOpenAIClient() { return null; }
export const openai = null;
