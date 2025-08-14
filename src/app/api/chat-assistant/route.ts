import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    const uxSpec = await (async () => {
      try {
        const p = path.join(process.cwd(), 'docs', 'AI_CHAT_ASSISTANT_UX_SPEC.md');
        return await fs.readFile(p, 'utf-8');
      } catch {
        return '';
      }
    })();

    const basePrompt = `You are a knowledgeable credit card optimization assistant.
    You help users:
    - Choose the best credit cards for specific purchases
    - Optimize rewards and points earnings
    - Understand credit card benefits and features
    - Plan travel and spending strategies
    
    Context:
    - User is ${context?.isAuthenticated ? 'logged in' : 'anonymous'}
    - Mode: ${context?.mode}
    - User has ${context?.userCards?.length || 0} cards in wallet
    - Current location: ${context?.userLocation ? 'available' : 'not available'}
    
    Be conversational, helpful, and provide specific actionable advice.
    Always explain your reasoning transparently.
    For quick mode: be fast and direct.
    For planning mode: be exploratory and ask follow-up questions.`;
    const systemPrompt = uxSpec ? `${basePrompt}\n\nUX SPECIFICATION:\n${uxSpec}` : basePrompt;

    type HistMsg = { sender: 'user' | 'assistant'; content: string };
    const history: HistMsg[] = Array.isArray(context?.conversationHistory)
      ? (context.conversationHistory as HistMsg[])
      : [];
    const messages = [
      { role: 'system' as const, content: systemPrompt },
  ...history.map((msg) => ({
        role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.content as string,
      })),
      { role: 'user' as const, content: String(message ?? '') },
    ];

    let responseContent = "I'm sorry, I couldn't process that request.";

    if (openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });
      responseContent = completion.choices[0]?.message?.content || responseContent;
    } else {
      responseContent = 'AI is not configured. Add OPENAI_API_KEY to enable responses. Meanwhile, try a quick action below.';
    }

    const suggestions = generateSuggestions(String(message ?? ''), context);

    return NextResponse.json({
      content: responseContent,
      suggestions,
    });
  } catch (error) {
    console.error('Chat assistant error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

type SuggestionContext = {
  mode?: 'quick' | 'planning';
};

function generateSuggestions(message: string, context: SuggestionContext): string[] {
  const m = (message || '').toLowerCase();
  const out: string[] = [];
  if (m.includes('travel') || context?.mode === 'planning') {
    out.push('What about travel insurance benefits?', 'Show me airport lounge access', 'Best cards for foreign spending');
  } else if (m.includes('dining')) {
    out.push('What about grocery rewards?', 'Show me gas station benefits', 'Best overall rewards card');
  } else if (m.includes('card')) {
    out.push('Compare with other cards', 'What are the annual fees?', 'Show me sign-up bonuses');
  } else {
    out.push('Find nearby businesses', 'Optimize my current cards', 'Plan a trip', 'Analyze spending categories');
  }
  return out.slice(0, 4);
}
