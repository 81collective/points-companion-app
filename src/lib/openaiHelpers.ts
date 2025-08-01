import { openai } from './openai';

export async function getOpenAICompletion(prompt: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are an expert at categorizing credit card transactions for rewards.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 100,
    temperature: 0.2,
  });
  // Expecting a JSON response from the AI
  try {
    const text = response.choices[0].message.content;
    return JSON.parse(text || '{}');
  } catch {
    return null;
  }
}
