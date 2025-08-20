import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient, isOpenAIConfigured } from '@/lib/openai-server';
import { getBestAvailableModel } from '@/lib/modelAccess';
import { getUserFromRequest } from '@/lib/apiUtils';
import fs from 'fs/promises';
import path from 'path';

const baseSystem = `You are a knowledgeable, friendly assistant helping users optimize credit card rewards.
- Be transparent and explain simple math when recommending cards
- Start with concise guidance; expand details only on request
- When location/business context is present, tailor suggestions to that merchant type
- Never invent fees/terms; if unsure, say so and suggest verifying
`;

let uxSpecCache: string | null = null;
async function getUxSpec(): Promise<string> {
  if (uxSpecCache !== null) return uxSpecCache;
  try {
    const filePath = path.join(process.cwd(), 'docs', 'AI_CHAT_ASSISTANT_UX_SPEC.md');
    uxSpecCache = await fs.readFile(filePath, 'utf-8');
  } catch {
    uxSpecCache = '';
  }
  return uxSpecCache;
}

export async function POST(req: NextRequest) {
  try {
    const { turns = [], context = {} } = await req.json();

    if (!isOpenAIConfigured) {
      // Fallback mock for dev with no key
      return NextResponse.json({ reply: 'AI is not configured. Here’s a generic tip: use your dining card at restaurants for 3x+ rewards.', suggestions: ['Best cards for groceries', 'Plan a trip strategy'] });
    }

    const openai = getOpenAIClient();
    if (!openai) return NextResponse.json({ reply: 'AI unavailable right now.' });

    // Get user to determine their subscription plan and available models
    const user = await getUserFromRequest(req);
    let selectedModel = 'gpt-3.5-turbo'; // fallback for unauthenticated users
    
    if (user) {
      try {
        selectedModel = await getBestAvailableModel(user.id);
      } catch (error) {
        console.error('Error getting best available model:', error);
        selectedModel = 'gpt-4o'; // fallback to previous default
      }
    }

  const uxSpec = await getUxSpec();
  const systemPrompt = uxSpec ? `${baseSystem}\n\nUX SPECIFICATION:\n${uxSpec}` : baseSystem;

  const messages = [
    { role: 'system', content: systemPrompt },
      ...turns,
    ] as { role: 'system' | 'user' | 'assistant'; content: string }[];

    // Append minimal context as a final user note for steerability
    const ctxStr = Object.keys(context).length ? `\n\nContext: ${JSON.stringify(context)}` : '';
    if (ctxStr) messages.push({ role: 'user', content: `Use this extra context when helpful.${ctxStr}` });

    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages,
      temperature: 0.4,
      max_tokens: 400,
    });

    const reply = completion.choices[0]?.message?.content || 'I had trouble generating a response.';

    // Rudimentary suggestion extraction
    const suggestions: string[] = [];
    if (/dining/i.test(reply)) suggestions.push('What about groceries?');
    if (/travel|flight|hotel/i.test(reply)) suggestions.push('Compare lounge access');
    if (!suggestions.length) suggestions.push('Show me alternatives');

    // Include model information in response for transparency
    const response: any = { reply, suggestions };
    if (user) {
      response.modelUsed = selectedModel;
    }

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json({ error: 'Assistant error', details: String(err) }, { status: 500 });
  }
}
