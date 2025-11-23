'use client';
import React, { useState, useEffect } from 'react';

interface TransactionDetails {
  merchant?: string;
  amount?: number;
  category?: string;
}

interface Recommendation {
  id: string;
  transactionDetails: TransactionDetails;
  recommendedCard: string;
  actualCardUsed: string | null;
  pointsEarned: number | null;
  feedback: string | null;
  feedbackScore: number | null;
  createdAt: string;
}

export default function RecommendationHistory() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'followed' | 'ignored'>('all');

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch('/api/recommendations?limit=200', { credentials: 'include' });
        if (!response.ok) {
          throw new Error('Failed to load recommendations');
        }
        const payload = (await response.json()) as { recommendations?: Recommendation[] };
        setRecommendations(payload.recommendations || []);
      } catch (error) {
        console.error('Failed to load recommendation history:', error);
        setRecommendations([]);
      }
    }
    fetchRecommendations();
  }, []);

  // Filter and search logic
  const filtered = recommendations.filter(rec => {
    if (search && !rec.recommendedCard.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'followed' && rec.actualCardUsed !== rec.recommendedCard) return false;
    if (filter === 'ignored' && rec.actualCardUsed === rec.recommendedCard) return false;
    return true;
  });

  // Accuracy and points metrics
  const total = recommendations.length;
  const followed = recommendations.filter(r => r.actualCardUsed === r.recommendedCard).length;
  const accuracy = total ? ((followed / total) * 100).toFixed(1) : '0';
  const points = recommendations.reduce((sum, r) => sum + (r.pointsEarned || 0), 0);

  return (
    <div className="p-6 bg-white rounded shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">AI Recommendation History</h2>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          className="border rounded px-2 py-1"
          placeholder="Search by card..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="border rounded px-2 py-1" value={filter} onChange={e => setFilter(e.target.value as 'all' | 'followed' | 'ignored')}>
          <option value="all">All</option>
          <option value="followed">Followed</option>
          <option value="ignored">Ignored</option>
        </select>
      </div>
      <div className="mb-4 flex gap-8">
        <div>Accuracy: <span className="font-bold">{accuracy}%</span></div>
        <div>Total Points Earned: <span className="font-bold">{points}</span></div>
      </div>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Transaction</th>
            <th className="p-2 border">Recommended Card</th>
            <th className="p-2 border">Actual Card Used</th>
            <th className="p-2 border">Points Earned</th>
            <th className="p-2 border">Feedback</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(rec => (
            <tr key={rec.id} className="border-b">
              <td className="p-2 border">{new Date(rec.createdAt).toLocaleDateString()}</td>
              <td className="p-2 border">{rec.transactionDetails?.merchant || '-'}</td>
              <td className="p-2 border">{rec.recommendedCard}</td>
              <td className="p-2 border">{rec.actualCardUsed || '-'}</td>
              <td className="p-2 border">{rec.pointsEarned ?? '-'}</td>
              <td className="p-2 border">{rec.feedback ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
