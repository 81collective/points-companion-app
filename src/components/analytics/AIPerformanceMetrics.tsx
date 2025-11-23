'use client';
import React, { useEffect, useState } from 'react';

interface Recommendation {
  id: string;
  createdAt: string;
  recommendedCard: string;
  actualCardUsed?: string | null;
  feedbackScore?: number | null;
  pointsEarned?: number | null;
}

interface Metrics {
  accuracy: number;
  satisfaction: number;
  totalPoints: number;
  monthly: Array<{ month: string; accuracy: number; points: number }>;
}

export default function AIPerformanceMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setError(null);
        const response = await fetch('/api/recommendations?limit=500', { credentials: 'include' });
        if (!response.ok) {
          throw new Error('Failed to load recommendations');
        }
        const payload = (await response.json()) as { recommendations?: Recommendation[] };
        const recs = payload.recommendations || [];
        if (!recs.length) {
          setMetrics({ accuracy: 0, satisfaction: 0, totalPoints: 0, monthly: [] });
          return;
        }
      const total = recs.length;
      const followed = recs.filter((r) => r.actualCardUsed === r.recommendedCard).length;
      const accuracy = total ? (followed / total) * 100 : 0;
      const satisfaction = total ? (recs.filter((r) => r.feedbackScore === 1).length / total) * 100 : 0;
      const totalPoints = recs.reduce((sum, r) => sum + (r.pointsEarned || 0), 0);
      // Monthly trend
      const monthly: Array<{ month: string; accuracy: number; points: number }> = [];
      const grouped: Record<string, Recommendation[]> = {};
      recs.forEach((r) => {
        const month = new Date(r.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!grouped[month]) grouped[month] = [];
        grouped[month].push(r);
      });
      Object.entries(grouped).forEach(([month, records]) => {
        const mTotal = records.length;
        const mFollowed = records.filter(r => r.actualCardUsed === r.recommendedCard).length;
        const mAccuracy = mTotal ? (mFollowed / mTotal) * 100 : 0;
        const mPoints = records.reduce((sum, r) => sum + (r.pointsEarned || 0), 0);
        monthly.push({ month, accuracy: mAccuracy, points: mPoints });
      });
      setMetrics({ accuracy, satisfaction, totalPoints, monthly });
      } catch (err) {
        console.error('Failed to load AI performance metrics:', err);
        setError('Unable to load AI performance metrics');
        setMetrics(null);
      }
    }
    fetchMetrics();
  }, []);

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!metrics) return <div>Loading AI performance metrics...</div>;

  return (
    <div className="p-6 bg-white rounded shadow max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">AI Performance Metrics</h2>
      <div className="mb-4 grid grid-cols-2 gap-6">
        <div>
          <div className="text-lg font-bold">{metrics.accuracy.toFixed(1)}%</div>
          <div className="text-xs text-gray-500">Recommendation Accuracy</div>
        </div>
        <div>
          <div className="text-lg font-bold">{metrics.satisfaction.toFixed(1)}%</div>
          <div className="text-xs text-gray-500">User Satisfaction</div>
        </div>
        <div>
          <div className="text-lg font-bold">{metrics.totalPoints}</div>
          <div className="text-xs text-gray-500">Total Points Optimized</div>
        </div>
      </div>
      <h3 className="mt-6 mb-2 font-semibold">Monthly Trends</h3>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Month</th>
            <th className="p-2 border">Accuracy (%)</th>
            <th className="p-2 border">Points</th>
          </tr>
        </thead>
        <tbody>
          {metrics.monthly.map(m => (
            <tr key={m.month} className="border-b">
              <td className="p-2 border">{m.month}</td>
              <td className="p-2 border">{m.accuracy.toFixed(1)}</td>
              <td className="p-2 border">{m.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
