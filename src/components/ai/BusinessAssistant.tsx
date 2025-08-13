'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyBusinesses } from '@/hooks/useNearbyBusinesses';
import { converse, type ChatTurn } from '@/lib/ai/conversationEngine';
import { getTopCardsForContext, type Recommendation } from '@/lib/ai/businessRecommendations';
import { formatTransparentMath } from '@/lib/ai/responseFormatter';
import { ConversationDisplay } from './ConversationDisplay';
import { SuggestionChips } from './SuggestionChips';
import { LocationConfirmation } from './LocationConfirmation';

export default function BusinessAssistant() {
  const { location, permissionState, requestLocation } = useLocation();
  const { businesses } = useNearbyBusinesses({
    latitude: location?.latitude,
    longitude: location?.longitude,
    radius: 1609 * 3,
    category: 'dining',
    enabled: permissionState.granted && !!location,
  });

  const [mode, setMode] = useState<'quick' | 'planning'>('quick');
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const place = useMemo(() => businesses?.[0]?.name, [businesses]);

  useEffect(() => {
    if (!turns.length) {
      const first: ChatTurn = { role: 'assistant', content: 'How can I help with your card choice today?' };
      setTurns([first]);
    }
  }, [turns.length]);

  const send = async (text: string) => {
    const userTurn: ChatTurn = { role: 'user', content: text };
    const nextTurns: ChatTurn[] = [...turns, userTurn];
    setTurns(nextTurns);
    const ctx: Record<string, unknown> = { mode };
    if (location) ctx.location = location;
    if (place) ctx.business = place;
  const { reply, suggestions } = await converse(nextTurns, ctx);
  const assistantTurn: ChatTurn = { role: 'assistant', content: reply };
  setTurns([...nextTurns, assistantTurn]);
  setSuggestions(suggestions || []);

    // Quick-mode: also fetch top cards for the detected business
    if (mode === 'quick') {
      try {
        const category = 'dining'; // simple default; could parse from input
        const top = await getTopCardsForContext({
          category,
          businessName: place,
          lat: location?.latitude,
          lng: location?.longitude,
          limit: 3,
        });
        setRecs(top);
      } catch {}
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg text-sm">
          <button onClick={() => setMode('quick')} className={`px-3 py-1 rounded ${mode==='quick' ? 'bg-white shadow-sm' : ''}`}>Quick</button>
          <button onClick={() => setMode('planning')} className={`px-3 py-1 rounded ${mode==='planning' ? 'bg-white shadow-sm' : ''}`}>Planning</button>
        </div>
        {!permissionState.granted && (
          <button onClick={requestLocation} className="text-xs px-3 py-1 rounded bg-blue-600 text-white">Enable location</button>
        )}
      </div>

      <LocationConfirmation place={place} onConfirm={() => place && setInput(`I am at ${place}. Best card?`)} />

      <ConversationDisplay messages={turns.map((t, i) => ({ ...t, id: String(i) }))} />

      <SuggestionChips items={suggestions} onPick={(s) => setInput(s)} />

      {mode === 'quick' && recs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">Top picks here</h4>
          {recs.map((r, i) => {
            const math = formatTransparentMath(r, 100);
            return (
              <div key={r.card.card_name + i} className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{r.card.card_name}</div>
                    <div className="text-xs text-gray-600">{r.card.issuer} • {r.reward_multiplier}x</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">$100 spend → {math.points} pts</div>
                    <div className="text-xs text-emerald-700">≈ ${math.estValue} value ({math.netMonthly >= 0 ? '+' : ''}{math.netMonthly}/mo net)</div>
                  </div>
                </div>
                {r.reasons?.length > 0 && (
                  <div className="mt-1 text-[11px] text-gray-700">{r.reasons.slice(0,2).join(' · ')}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about the best card…" className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
        <button onClick={() => input && send(input)} className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm">Send</button>
      </div>
    </div>
  );
}
