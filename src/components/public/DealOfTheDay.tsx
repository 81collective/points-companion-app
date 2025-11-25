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
    return (
      <div className="card animate-pulse">
        <div className="h-6 w-48 bg-neutral-200 rounded mb-4" />
        <div className="h-4 w-32 bg-neutral-100 rounded" />
      </div>
    );
  }

  if (!best) {
    return (
      <div className="card text-center py-8">
        <p className="text-neutral-500">No bonus deals available today. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-overline mb-1">Featured Offer</p>
          <h3 className="text-h3 text-neutral-900">{best.cardName}</h3>
          <p className="text-body-sm text-neutral-500 mt-1">{best.cardIssuer}</p>
        </div>
        {best.deadline && (
          <span className="badge badge-warning">Ends {best.deadline}</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-brand-50 border border-brand-100">
          <p className="text-caption text-brand-600 font-medium mb-1">Estimated Value</p>
          <p className="text-2xl font-bold text-brand-700">${estimateValue(best)}</p>
        </div>
        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
          <p className="text-caption text-neutral-500 mb-1">Bonus</p>
          <p className="text-body font-semibold text-neutral-900">
            {best.bonusAmount.toLocaleString()} {best.bonusType}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
          <p className="text-caption text-neutral-500 mb-1">Details</p>
          <p className="text-body-sm text-neutral-700">
            {best.notes || 'High-value welcome offer'}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-neutral-100">
        <a href="/bonuses" className="btn btn-primary">
          View all offers
        </a>
      </div>
    </div>
  );
}
