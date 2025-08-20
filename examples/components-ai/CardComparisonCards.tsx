"use client";
import React, { useState } from 'react';
import { formatTransparentMath, type Recommendation, estimateWelcomeBonusValue, estimateBreakEvenMonthlySpend, deltaPerBasis } from '@/lib/ai/responseFormatter';

export function CardComparisonCards({ items }: { items: Recommendation[] }) {
  if (!items?.length) return null;
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map((rec, idx) => (
        <CardRow key={idx} rec={rec} idx={idx} top={items[0]} />
      ))}
    </div>
  );
}

function CardRow({ rec, idx, top }: { rec: Recommendation; idx: number; top: Recommendation }) {
  const [open, setOpen] = useState(false);
  const math = formatTransparentMath(rec);
  const bonusEst = estimateWelcomeBonusValue(rec.card.bonus_offer);
  const breakEven = estimateBreakEvenMonthlySpend(rec);
  const deltaVsTop = idx === 0 ? 0 : deltaPerBasis(top, rec);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">{rec.card.card_name}</h4>
          <p className="text-xs text-gray-600">{rec.card.issuer}</p>
        </div>
        {typeof rec.match_score === 'number' && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">{Math.round(rec.match_score)} match</span>
        )}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded bg-blue-50 border border-blue-200 p-2">
          <div className="text-[10px] text-blue-800">Est. points/$100</div>
          <div className="text-blue-900 font-semibold">{math.points}</div>
        </div>
        <div className="rounded bg-gray-50 border border-gray-200 p-2">
          <div className="text-[10px] text-gray-700">Est. value</div>
          <div className="text-gray-900 font-semibold">${math.estValueUSD}</div>
        </div>
        <div className="rounded bg-gray-50 border border-gray-200 p-2">
          <div className="text-[10px] text-gray-700">Monthly net</div>
          <div className="text-gray-900 font-semibold">${math.netMonthlyUSD}</div>
        </div>
      </div>

      {!!math.reasons.length && (
        <div className="mt-2 flex flex-wrap gap-1">
          {math.reasons.slice(0, 3).map((r, i) => (
            <span key={i} className="text-[10px] bg-gray-100 text-gray-800 rounded-full px-2 py-0.5">{r}</span>
          ))}
        </div>
      )}

      <div className="mt-3">
        <button onClick={() => setOpen(v => !v)} className="text-xs font-medium text-blue-700 hover:underline">
          {open ? 'Hide transparent math' : 'Show transparent math'}
        </button>
      </div>

      {open && (
        <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-gray-600">Welcome bonus est.</div>
              <div className="font-semibold">${bonusEst}</div>
            </div>
            <div>
              <div className="text-gray-600">Break-even monthly spend</div>
              <div className="font-semibold">${Number.isFinite(breakEven) ? breakEven : '—'}</div>
            </div>
          </div>

          {idx !== 0 && (
            <div>
              <div className="text-gray-600">Delta vs top per $100</div>
              <div className={`font-semibold ${deltaVsTop < 0 ? 'text-red-700' : 'text-emerald-700'}`}>${deltaVsTop}</div>
            </div>
          )}

          <div className="text-[11px] text-gray-600">
            Estimates use 1.25¢/point heuristic and assume $100 basis spending. Actual value varies by program and redemption.
          </div>
        </div>
      )}
    </div>
  );
}
