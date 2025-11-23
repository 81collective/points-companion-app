"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CatRow { category: string; amount: number; count: number }
interface TxRow { amount: number; category?: string }

export default function MiniSpendingInsights() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [cats, setCats] = useState<CatRow[]>([]);

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      setLoading(true); setError(null);
      try {
        const res = await fetch('/api/transactions', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load transactions');
        const { transactions } = (await res.json()) as { transactions: (TxRow & { date: string })[] };
        const end = new Date();
        const start = new Date(); start.setDate(end.getDate() - 30);
        const byCat: Record<string, { amount: number; count: number }> = {};
        let sum = 0;
        (transactions || []).forEach((t) => {
          const txDate = new Date(t.date);
          if (txDate < start || txDate > end) return;
          const c = (t.category && t.category.length > 0 ? t.category : 'other');
          if (!byCat[c]) byCat[c] = { amount: 0, count: 0 };
          byCat[c].amount += Number.isFinite(t.amount) ? t.amount : 0;
          byCat[c].count += 1;
          sum += Number.isFinite(t.amount) ? t.amount : 0;
        });
        const rows = Object.entries(byCat)
          .map(([category, v]) => ({ category, amount: v.amount, count: v.count }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 3);
        setTotal(sum); setCats(rows);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load insights');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  if (!user) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-900">Your spending snapshot (30d)</div>
        {loading && <div className="text-xs text-gray-500">Loading…</div>}
      </div>
      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="mt-2 text-sm">
          <div className="text-gray-700 mb-2">Total: {new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(total)}</div>
          <div className="flex flex-col gap-1">
            {cats.map((c) => (
              <div key={c.category} className="flex items-center justify-between">
                <span className="capitalize text-gray-800">{c.category}</span>
                <span className="text-gray-700">{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(c.amount)}</span>
              </div>
            ))}
            {cats.length === 0 && (
              <div className="text-xs text-gray-500">No recent transactions</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
