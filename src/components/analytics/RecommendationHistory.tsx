import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface TransactionDetails {
  merchant?: string;
  amount?: number;
  category?: string;
}

interface Recommendation {
  id: string;
  transaction_details: TransactionDetails;
  recommended_card: string;
  actual_card_used: string | null;
  points_earned: number | null;
  feedback: string | null;
  feedback_score: number | null;
  created_at: string;
}

export default function RecommendationHistory() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'followed' | 'ignored'>('all');

  useEffect(() => {
    async function fetchRecommendations() {
      const supabase = createClient();
      const { data } = await supabase
        .from('recommendations')
        .select('*')
        .order('created_at', { ascending: false });
      setRecommendations(data || []);
    }
    fetchRecommendations();
  }, []);

  // Filter and search logic
  const filtered = recommendations.filter(rec => {
    if (search && !rec.recommended_card.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'followed' && rec.actual_card_used !== rec.recommended_card) return false;
    if (filter === 'ignored' && rec.actual_card_used === rec.recommended_card) return false;
    return true;
  });

  // Accuracy and points metrics
  const total = recommendations.length;
  const followed = recommendations.filter(r => r.actual_card_used === r.recommended_card).length;
  const accuracy = total ? ((followed / total) * 100).toFixed(1) : '0';
  const points = recommendations.reduce((sum, r) => sum + (r.points_earned || 0), 0);

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
              <td className="p-2 border">{new Date(rec.created_at).toLocaleDateString()}</td>
              <td className="p-2 border">{rec.transaction_details?.merchant || '-'}</td>
              <td className="p-2 border">{rec.recommended_card}</td>
              <td className="p-2 border">{rec.actual_card_used || '-'}</td>
              <td className="p-2 border">{rec.points_earned ?? '-'}</td>
              <td className="p-2 border">{rec.feedback ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
