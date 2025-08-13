'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyBusinesses } from '@/hooks/useNearbyBusinesses';
import { converse, type ChatTurn } from '@/lib/ai/conversationEngine';
import { ConversationDisplay } from './ConversationDisplay';
import { SuggestionChips } from './SuggestionChips';
import { LocationConfirmation } from './LocationConfirmation';
import { fetchTopRecommendations } from '@/lib/ai/businessRecommendations';
import type { Recommendation } from '@/lib/ai/responseFormatter';
import { CardComparisonCards } from './CardComparisonCards';
import { useAssistantStore } from '@/stores/assistantStore';

export default function BusinessAssistant() {
  const { location, permissionState, requestLocation } = useLocation();
  const [mode, setMode] = useState<'quick' | 'planning'>('quick');
  const [selectedCategory, setSelectedCategory] = useState<string>('dining');
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [topRecs, setTopRecs] = useState<Recommendation[]>([]);
  const [planningRecs, setPlanningRecs] = useState<Recommendation[]>([]);
  const publish = useAssistantStore(s => s.setPicks);
  const [selectedPlaceName, setSelectedPlaceName] = useState<string | null>(null);
  const { businesses } = useNearbyBusinesses({
    latitude: location?.latitude,
    longitude: location?.longitude,
    radius: 1609 * 3,
    category: selectedCategory,
    enabled: permissionState.granted && !!location,
  });
  const place = useMemo(() => selectedPlaceName || businesses?.[0]?.name, [selectedPlaceName, businesses]);
  const [pendingConfirmAfterLocation, setPendingConfirmAfterLocation] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState<boolean>(() => !permissionState.granted);
  const [showedNearbyPrompt, setShowedNearbyPrompt] = useState(false);

  useEffect(() => {
    if (!turns.length) {
      const first: ChatTurn = { role: 'assistant', content: 'How can I help with your card choice today?' };
      setTurns([first]);
    }
  }, [turns.length]);

  // If user clicked Yes before granting, once permission is granted show nearby prompt (no second tap)
  useEffect(() => {
    if (permissionState.granted) {
      setShowLocationPrompt(false);
      if (pendingConfirmAfterLocation) {
        // Will show nearby prompt below
        setPendingConfirmAfterLocation(false);
      }
    }
  }, [permissionState.granted, pendingConfirmAfterLocation, place]);

  // After location available, prompt user with closest businesses in quick mode
  useEffect(() => {
    if (mode !== 'quick') return;
    if (!permissionState.granted) return;
    if (!businesses || businesses.length === 0) return;
    if (showedNearbyPrompt) return;

    const top = businesses.slice(0, 5);
    const lines = top.map((b, i) => `${i + 1}) ${b.name}`);
    const msg = `I found some nearby places:\n${lines.join('\n')}\n\nReply with a number (1-${top.length}) and I'll show the best card for that place. Or ask a different question.`;
    const assistantTurn: ChatTurn = { role: 'assistant', content: msg };
    setTurns((prev) => [...prev, assistantTurn]);
    setShowedNearbyPrompt(true);
  }, [mode, permissionState.granted, businesses, showedNearbyPrompt]);

  const send = async (text: string) => {
    const userTurn: ChatTurn = { role: 'user', content: text };
    const nextTurns: ChatTurn[] = [...turns, userTurn];
    setTurns(nextTurns);

    // If user typed a number selecting one of the listed businesses in quick mode
    const numMatch = text.trim().match(/^([1-9]\d*)$/);
    if (mode === 'quick' && numMatch && businesses.length > 0) {
      const idx = Math.max(1, Math.min(businesses.length, parseInt(numMatch[1], 10))) - 1;
      const chosen = businesses[idx];
      if (chosen?.name) {
        setSelectedPlaceName(chosen.name);
        const confirmTurn: ChatTurn = { role: 'assistant', content: `Great — let's look at ${chosen.name}.` };
        setTurns((prev) => [...prev, confirmTurn]);
        try {
          const recs = await fetchTopRecommendations({
            category: selectedCategory,
            businessName: chosen.name,
            lat: location?.latitude,
            lng: location?.longitude,
            limit: 3,
          });
          setTopRecs(recs);
          publish(recs, { mode, category: selectedCategory, place: chosen.name });
        } catch {}
        return;
      }
    }
  const ctx: Record<string, unknown> = { mode };
    if (location) ctx.location = location;
    if (place) ctx.business = place;
  const { reply, suggestions } = await converse(nextTurns, ctx);
  const assistantTurn: ChatTurn = { role: 'assistant', content: reply };
  setTurns([...nextTurns, assistantTurn]);
  setSuggestions(suggestions || []);

    // In quick mode, also pull top recommendations for the detected business/category
    if (mode === 'quick') {
      try {
        const recs = await fetchTopRecommendations({
          category: selectedCategory,
          businessName: place,
          lat: location?.latitude,
          lng: location?.longitude,
          limit: 3,
        });
  setTopRecs(recs);
  publish(recs, { mode, category: selectedCategory, place });
      } catch {}
    } else {
      // Planning mode: pull top category comps (no business needed)
      try {
        const recs = await fetchTopRecommendations({
          category: selectedCategory,
          limit: 3,
        });
  setPlanningRecs(recs);
  publish(recs, { mode, category: selectedCategory, place });
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

      {/* Quick mode category selector */}
      <div className="flex flex-wrap gap-2 text-xs">
        {['dining','groceries','gas','hotels','travel'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full border ${selectedCategory===cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-200'}`}
          >
            {cat.charAt(0).toUpperCase()+cat.slice(1)}
          </button>
        ))}
      </div>

      {showLocationPrompt && (
        <LocationConfirmation
          place={place}
          needsLocation={!permissionState.granted}
          onEnableLocation={() => {
            setPendingConfirmAfterLocation(true);
            requestLocation();
          }}
          onConfirm={() => {
            if (!permissionState.granted) {
              setPendingConfirmAfterLocation(true);
              requestLocation();
            } else if (place) {
              setInput(`I am at ${place}. Best card?`);
            }
            setShowLocationPrompt(false);
          }}
        />
      )}

      <ConversationDisplay messages={turns.map((t, i) => ({ ...t, id: String(i) }))} />

      <SuggestionChips items={suggestions} onPick={(s) => setInput(s)} />

      {mode === 'quick' && topRecs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Top picks nearby</h4>
          <CardComparisonCards items={topRecs} />
        </div>
      )}

      {mode === 'planning' && planningRecs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Planning comparison (Top 3 for {selectedCategory})</h4>
          <CardComparisonCards items={planningRecs} />
        </div>
      )}

      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about the best card…" className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
        <button onClick={() => input && send(input)} className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm">Send</button>
      </div>
    </div>
  );
}
