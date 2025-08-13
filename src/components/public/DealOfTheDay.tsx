// src/components/public/DealOfTheDay.tsx
"use client";

import { useEffect, useMemo, useState } from 'react';

// Simple score type
type Bonus = {
  id: string;
  cardName: string;
  cardIssuer: string;
  bonusAmount: number; // points or cash
  bonusType: 'points' | 'miles' | 'cashback';
  estimatedValue?: number; // if provided by API
  deadline?: string;
  notes?: string;
};

function estimateValue(b: Bonus): number {
  if (typeof b.estimatedValue === 'number') return b.estimatedValue;
  // Simple heuristic: points/miles @ 1.25 cpp, cash at face value
  const cpp = 0.0125;
  if (b.bonusType === 'cashback') return b.bonusAmount;
  return Math.round(b.bonusAmount * cpp);
}

export default function DealOfTheDay() {
  const [bonuses, setBonuses] = useState<Bonus[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Try read from localStorage for same-day cache
    const key = 'dealOfDayCacheV1';
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const cached = JSON.parse(raw) as { date: string; data: Bonus[] };
        const today = new Date().toISOString().slice(0, 10);
        if (cached.date === today) {
          setBonuses(cached.data);
          setLoading(false);
          return;
        }
      }
    } catch {}

    (async () => {
      try {
        const res = await fetch(`/api/bonuses?status=active&sortBy=value&sortOrder=desc&limit=5`, { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) {
          if (data?.success) {
            setBonuses(data.data as Bonus[]);
            try {
              const today = new Date().toISOString().slice(0, 10);
              localStorage.setItem(key, JSON.stringify({ date: today, data: data.data }));
            } catch {}
          } else {
            setBonuses([]);
          }
        }
      } catch {
        if (!cancelled) setBonuses([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const best = useMemo(() => {
    return (bonuses || [])
      .map(b => ({ ...b, score: estimateValue(b) }))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  }, [bonuses]);

  if (loading) {
    return <div className="bg-white rounded-2xl border border-gray-200 p-6">Loading deal…</div>;
  }

  if (!best) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
        <p className="text-gray-600">No bonus deals available today. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Best Welcome Bonus Today</h3>
          <p className="text-sm text-gray-600 mt-1">{best.cardIssuer} • {best.cardName}</p>
        </div>
        {best.deadline && (
          <span className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">Ends by {best.deadline}</span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-xs text-blue-800">Estimated First-Year Value</p>
          <p className="text-2xl font-bold text-blue-900">${estimateValue(best)}</p>
        </div>
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <p className="text-xs text-gray-700">Offer</p>
          <p className="font-medium text-gray-900">{best.bonusAmount.toLocaleString()} {best.bonusType}</p>
        </div>
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <p className="text-xs text-gray-700">Notes</p>
          <p className="text-sm text-gray-900">{best.notes || 'High-value welcome offer with strong everyday utility.'}</p>
        </div>
      </div>

      <div className="mt-6">
        <a href="/bonuses" className="inline-flex items-center px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">See all bonuses</a>
      </div>
    </div>
  );
}
