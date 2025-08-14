'use client';
import React from 'react';
import type { Recommendation } from '@/lib/ai/responseFormatter';

export function CardRecommendation({ rec, onView, onAdd }: { rec: Recommendation; onView?: () => void; onAdd?: () => void }) {
  const valueLine = (() => {
    const maybeEV = (rec as unknown as { est_value_usd?: number })?.est_value_usd;
    return typeof maybeEV === 'number' ? `Est. value per $100: $${maybeEV}` : undefined;
  })();
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 p-3 shadow-sm">
      <div className="text-sm font-medium flex items-center gap-2">
        <span role="img" aria-label="card">💳</span>
        <span>{rec.card.card_name}</span>
        <span className="text-gray-500">— {rec.card.issuer}</span>
      </div>
      <div className="text-sm text-gray-700 mt-1">
        {Array.isArray((rec as unknown as { highlights?: string[] })?.highlights) && (rec as unknown as { highlights?: string[] }).highlights?.length
          ? (rec as unknown as { highlights?: string[] }).highlights![0]
          : (rec as unknown as { summary?: string })?.summary || 'Top pick for this merchant/category'}
      </div>
      {valueLine && <div className="text-xs text-gray-500 mt-1">{valueLine}</div>}
      <div className="flex gap-2 mt-3">
        <button
          onClick={onView}
          className="px-3 py-1.5 text-sm rounded-full border border-gray-300 hover:bg-gray-50"
        >View Details</button>
        <button
          onClick={onAdd}
          className="px-3 py-1.5 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700"
        >Add to Wallet</button>
      </div>
    </div>
  );
}
