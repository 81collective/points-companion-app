// Client-side conversation helper to call server API
export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export async function converse(turns: ChatTurn[], context?: Record<string, unknown>, opts?: { signal?: AbortSignal }) {
  const res = await fetch('/api/assistant/converse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ turns, context }),
    signal: opts?.signal,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Assistant API error');
  }
  return (await res.json()) as { reply: string; suggestions?: string[] };
}
