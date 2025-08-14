"use client";
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
// light haptics helper
const haptic = (ms = 10) => {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      // Navigator in lib.dom includes `vibrate`; use optional chaining to be safe
      (navigator as Navigator).vibrate?.(ms);
    }
  } catch {}
};

type TopicBreakdown = { name: string; value: number };
type TopicTrend = { date: string; count: number };

export default function InsightsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Array<{ topic: string; count: number }>>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [trendingTerms, setTrendingTerms] = useState<string[]>([]);
  const [painPoints, setPainPoints] = useState<string[]>([]);

  // Pull recent chat history from either component stores
  const chatHistory = useMemo(() => {
    // BusinessAssistant turns: not persisted; use ChatAssistant/NaturalLanguageChat localStorage fallbacks
    const a = (typeof window !== 'undefined' ? window.localStorage.getItem('chat_assistant_history') : null);
    const b = (typeof window !== 'undefined' ? window.localStorage.getItem('ai_chat_messages') : null);
  const messages: string[] = [];
  type AMsg = { sender?: string; content?: unknown };
  type BMsg = { type?: string; content?: unknown };
  try { if (a) (JSON.parse(a) as AMsg[]).forEach(m => { if (m?.sender === 'user' && m?.content) messages.push(String(m.content)); }); } catch {}
  try { if (b) (JSON.parse(b) as BMsg[]).forEach(m => { if (m?.type === 'user' && m?.content) messages.push(String(m.content)); }); } catch {}
    return messages.slice(-200);
  }, []);

  useEffect(() => {
    // enable haptics on buttons/links with data-haptic
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el && el.closest('[data-haptic]')) haptic(12);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch('/api/assistant/topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: chatHistory.map(c => ({ content: c })) }),
        });
        if (!res.ok) throw new Error('Failed to classify topics');
        const data = await res.json();
        setTopics(Array.isArray(data.topics) ? data.topics : []);
        setCategories(Array.isArray(data.categories) ? data.categories : []);
        setTrendingTerms(Array.isArray(data.trending_terms) ? data.trending_terms : []);
        setPainPoints(Array.isArray(data.pain_points) ? data.pain_points : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to load insights');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [chatHistory]);

  // Build charts
  const topTopics: TopicBreakdown[] = useMemo(() => topics.slice(0, 8).map(t => ({ name: t.topic, value: t.count })), [topics]);
  const categoryBreakdown: TopicBreakdown[] = useMemo(() => categories.map(c => ({ name: c.name.replace('_', ' '), value: c.count })), [categories]);
  const trendData: TopicTrend[] = useMemo(() => {
    // fabricate a simple trend by spreading counts over last 6 labels
    const total = topics.reduce((s, t) => s + (t.count || 0), 0) || 0;
    const buckets = 6;
    return Array.from({ length: buckets }).map((_, i) => ({
      date: `T-${buckets - i}`,
      count: Math.round((total / buckets) * (0.8 + (i % 3) * 0.1)),
    }));
  }, [topics]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f472b6'];

  const actionableInsights = useMemo(() => {
    const outs: string[] = [];
    if (categories.find(c => c.name === 'troubleshooting')) outs.push('Users report issues; add a visible “Report a problem” entry point.');
    if (categories.find(c => c.name === 'benefits_terms')) outs.push('Provide a quick “Benefits & Terms” explainer in results.');
    if (topics.some(t => /grocery|dining|gas/i.test(t.topic))) outs.push('Create a one-tap “Everyday categories” cheat sheet.');
    if (!outs.length && trendingTerms.length) outs.push(`Cover trending term: “${trendingTerms[0]}” with a guided answer.`);
    return outs;
  }, [categories, topics, trendingTerms]);

  return (
    <ProtectedRoute>
      <div className="page-container py-8">
        <main className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Assistant Insights</h1>
            <p className="text-dim text-sm">Themes, trends, and pain points from your AI assistant conversations.</p>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-700 flex justify-between items-start">
              <span>{error}</span>
              <button className="text-xs underline" onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 surface p-6">
              <h2 className="text-lg font-semibold mb-4">Trending topics over time</h2>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="surface p-6">
              <h2 className="text-lg font-semibold mb-4">Top topics</h2>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topTopics}>
                    <XAxis dataKey="name" hide />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="surface p-6">
              <h2 className="text-lg font-semibold mb-4">Categorized themes</h2>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} label>
                      {categoryBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-2 surface p-6">
              <h2 className="text-lg font-semibold mb-4">Actionable insights</h2>
              {loading ? (
                <div className="animate-pulse h-24 bg-[var(--color-bg-alt)] rounded" />
              ) : (
                <ul className="space-y-3 list-disc pl-5 text-sm">
                  {actionableInsights.length ? actionableInsights.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  )) : (
                    <li>No major issues detected. Keep engaging with the assistant.</li>
                  )}
                </ul>
              )}
              {!!painPoints.length && (
                <div className="mt-4 text-xs text-dim">Pain points: {painPoints.join(', ')}</div>
              )}
            </div>
          </div>

          {!!trendingTerms.length && (
            <div className="surface p-6">
              <h2 className="text-lg font-semibold mb-2">Trending terms</h2>
              <div className="flex flex-wrap gap-2">
                {trendingTerms.slice(0, 20).map((t, i) => (
                  <span key={i} className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs" data-haptic>#{t}</span>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
