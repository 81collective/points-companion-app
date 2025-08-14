import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

type TopicRequest = {
  messages: Array<{ content: string; timestamp?: string | number }>; // user-side prompts only
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TopicRequest;
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const texts = messages.map((m) => String(m.content || '')).filter(Boolean).slice(0, 500);

    if (!texts.length) {
      return NextResponse.json({
        success: true,
        topics: [],
        categories: [],
        pain_points: [],
        classified: [],
        trending_terms: [],
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const openai = apiKey ? new OpenAI({ apiKey }) : null;

    if (openai) {
      const system = `You are an analytics classifier for a credit card optimization assistant.
Classify user questions into concise topics and one of these categories:
- rewards_optimization
- card_recommendations
- spending_analysis
- benefits_terms
- travel_planning
- troubleshooting
- other

Return strict JSON with fields: topics (array of { topic: string, count: number }), categories (array of { name: string, count: number }), pain_points (array of string), trending_terms (array of string), classified (array of { text: string, topic: string, category: string }).`;

      const user = `Here are recent user messages (one per line). Classify them:
${texts.map((t, i) => `${i + 1}. ${t}`).join('\n')}
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 600,
      });

      const content = completion.choices[0]?.message?.content || '{}';
      let parsed: unknown;
      try { parsed = JSON.parse(content); } catch { parsed = {}; }
      return NextResponse.json({ success: true, ...(parsed as object) });
    }

    // Fallback heuristic classification with keywords
    const categoryMap: Record<string, string> = {
      dining: 'rewards_optimization',
      grocery: 'rewards_optimization',
      groceries: 'rewards_optimization',
      gas: 'rewards_optimization',
      best: 'card_recommendations',
      recommend: 'card_recommendations',
      compare: 'card_recommendations',
      spend: 'spending_analysis',
      budget: 'spending_analysis',
      analysis: 'spending_analysis',
      terms: 'benefits_terms',
      lounge: 'benefits_terms',
      insurance: 'benefits_terms',
      travel: 'travel_planning',
      flight: 'travel_planning',
      hotel: 'travel_planning',
      error: 'troubleshooting',
      missing: 'troubleshooting',
    };

    const classified = texts.map((t) => {
      const lower = t.toLowerCase();
      const kv = Object.entries(categoryMap).find(([k]) => lower.includes(k));
      const category = kv ? kv[1] : 'other';
      // topic: pick first 3 words as a naive summary
      const topic = t.trim().split(/\s+/).slice(0, 3).join(' ').replace(/[\.,!?;:]+$/, '');
      return { text: t, topic, category };
    });

    const categoryCounts = classified.reduce<Record<string, number>>((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});
    const topicCounts = classified.reduce<Record<string, number>>((acc, c) => {
      acc[c.topic] = (acc[c.topic] || 0) + 1;
      return acc;
    }, {});

    const categories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const topics = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // simple trending terms by word frequency
    const wordCounts: Record<string, number> = {};
    texts.join(' ').toLowerCase().split(/[^a-z0-9]+/).forEach((w) => {
      if (!w || w.length < 3) return;
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    });
    const trending_terms = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([w]) => w);

    const pain_points = categories
      .filter((c) => ['troubleshooting', 'benefits_terms'].includes(c.name))
      .map((c) => `Users frequently ask about ${c.name.replace('_', ' ')}.`);

    return NextResponse.json({ success: true, topics, categories, pain_points, classified, trending_terms });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
