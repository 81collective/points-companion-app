'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyBusinesses } from '@/hooks/useNearbyBusinesses';
import { converse, type ChatTurn } from '@/lib/ai/conversationEngine';
import { ConversationDisplay } from './ConversationDisplay';
import { SuggestionChips } from './SuggestionChips';
import { LocationConfirmation } from './LocationConfirmation';
import { fetchTopRecommendations } from '@/lib/ai/businessRecommendations';
import { formatTransparentMath, type Recommendation } from '@/lib/ai/responseFormatter';
import { useAssistantStore } from '@/stores/assistantStore';
import { useRef } from 'react';
import { Loader2 } from 'lucide-react';

export default function BusinessAssistant() {
  const { location, permissionState, requestLocation } = useLocation();
  const [mode, setMode] = useState<'quick' | 'planning'>('quick');
  const [selectedCategory, setSelectedCategory] = useState<string>('dining');
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [_topRecs, setTopRecs] = useState<Recommendation[]>([]); // kept for publishing to store
  const [_planningRecs, setPlanningRecs] = useState<Recommendation[]>([]); // kept for publishing to store
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
  const [_showedNearbyPrompt, setShowedNearbyPrompt] = useState(false);
  const [nearbyPromptList, setNearbyPromptList] = useState<typeof businesses>([]);
  const prevModeRef = useRef(mode);
  const [isThinking, setIsThinking] = useState(false);
  const typingTimerRef = useRef<number | null>(null);
  const nearbyMsgIndexRef = useRef<number | null>(null);
  const cancelRef = useRef<boolean>(false);
  const hydratingRef = useRef<boolean>(false);

  const clearTyping = () => {
    if (typingTimerRef.current) {
      window.clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  };

  const splitSentences = (text: string) => {
    const parts = text.match(/[^.!?\n]+[.!?]?/g) || [text];
    return parts.map(s => s.trim()).filter(Boolean);
  };

  const typeOutReply = async (text: string, conversational: boolean) => {
    cancelRef.current = false;
    const typingIndex = turns.length + 1; // after we push user turn and maybe other items
    // Insert empty assistant bubble
    setTurns(prev => [...prev, { role: 'assistant', content: '' }]);

    const appendChar = (ch: string) => {
      setTurns(prev => {
        const copy = [...prev];
        const idx = typingIndex - 1; // zero-based
        if (!copy[idx]) return prev;
        copy[idx] = { ...copy[idx], content: copy[idx].content + ch } as ChatTurn;
        return copy;
      });
    };

    const typeSentence = (sentence: string) => new Promise<void>((resolve) => {
      let i = 0;
      clearTyping();
      typingTimerRef.current = window.setInterval(() => {
        if (cancelRef.current) {
          clearTyping();
          resolve();
          return;
        }
        if (i >= sentence.length) {
          clearTyping();
          resolve();
          return;
        }
        appendChar(sentence[i]);
        i += 1;
      }, 14); // ~70 chars/sec
    });

    if (conversational) {
  const sentences = splitSentences(text);
  for (const s of sentences) {
        if (cancelRef.current) break;
        await typeSentence(s);
        // slight pause and newline
        if (!cancelRef.current) {
          appendChar('\n');
          await new Promise(r => setTimeout(r, 180));
        }
      }
    } else {
      await typeSentence(text);
    }
  };

  // When switching modes: clear chat and show mode-specific intro and prompts
  useEffect(() => {
    const prev = prevModeRef.current;
    if (prev !== mode) {
      clearTyping();
  cancelRef.current = true;
      setInput('');
      setShowedNearbyPrompt(false);
  nearbyMsgIndexRef.current = null;
      if (mode === 'planning') {
        const intro = `Planning designs a winning card strategy for your bigger goals.\n\nWhat I’ll do:\n• Compare cards and call the trade‑offs\n• Map welcome bonuses to your timeline\n• Optimize category multipliers across your spend\n• Hand you a simple step‑by‑step plan\n\nTo get the full picture, quick hits (answer freely, skip anything):\n1) Top 1–2 goals in the next 6–12 months (e.g., Hawaii in March)\n2) Monthly spend by category (dining, groceries, gas, travel, online, other)\n3) Preference: cash back vs points/miles; any favorite programs (Chase/Amex/Citi/CapOne; Marriott/Hyatt/AA/UA/Delta)\n4) Upcoming big purchases/trips (dates, destinations, travelers)\n5) Current cards/issuers and rules to consider (e.g., 5/24)\n6) Annual fee comfort; business cards okay?\n7) Keep it simple (1–2 cards) or maximize value (3–5)?`;
        setTurns([{ role: 'assistant', content: intro } as ChatTurn]);
        setSuggestions([
          'Plan a 2‑card strategy for the next 12 months',
          'Optimize my travel setup for 3 domestic trips + 1 international',
          'Compare Amex Gold vs Citi Strata Premier vs CSP',
          'Map welcome bonuses to a Hawaii trip in March',
          'Design a grocery + gas combo for $800/mo',
          'Audit my current cards and find overlaps',
        ]);
      } else if (mode === 'quick') {
        const intro = `Quick calls the best card for right now. Flip on location for instant nearby picks, or tell me where you are (e.g., Starbucks, Whole Foods).\n\nTry:`;
        setTurns([{ role: 'assistant', content: `${intro}\n• What’s the best card at Starbucks right now?\n• Show me the top 3 nearby places\n• Best card for groceries today\n• Compare gas vs groceries\n• I’m at Costco — what should I use?` } as ChatTurn]);
        setSuggestions([
          'What’s the best card at Starbucks right now?',
          'Show me the top 3 nearby places',
          'Best card for groceries today',
          'Compare gas vs groceries',
          'I’m at Costco — what should I use?',
        ]);
      }
    }
    prevModeRef.current = mode;
  }, [mode]);

  // If category changes in quick mode, refresh the nearby prompt list
  useEffect(() => {
    if (mode === 'quick') {
      setShowedNearbyPrompt(false);
      setNearbyPromptList([]);
  nearbyMsgIndexRef.current = null;
    }
  }, [selectedCategory, mode]);

  useEffect(() => {
    // Hydrate from localStorage on first mount
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('businessAssistant:v1') : null;
      if (raw) {
        const saved = JSON.parse(raw) as { mode?: 'quick'|'planning'; selectedCategory?: string; turns?: ChatTurn[] };
        hydratingRef.current = true;
        if (saved.mode) {
          // Prevent mode switch effect from nuking restored chat
          prevModeRef.current = saved.mode;
          setMode(saved.mode);
        }
        if (saved.selectedCategory) setSelectedCategory(saved.selectedCategory);
        if (Array.isArray(saved.turns) && saved.turns.length) setTurns(saved.turns);
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Seed first message if empty and not hydrating
    if (!turns.length && !hydratingRef.current) {
      const first: ChatTurn = { role: 'assistant', content: 'I’m your rewards co‑pilot — what should we optimize right now?' };
      setTurns([first]);
    }
  }, [turns.length]);

  useEffect(() => {
    // End hydration after initial render pass
    if (hydratingRef.current) {
      hydratingRef.current = false;
    }
  }, [mode, selectedCategory, turns.length]);

  useEffect(() => {
    // Persist minimal state for session continuity
    try {
      const payload = JSON.stringify({ mode, selectedCategory, turns });
      localStorage.setItem('businessAssistant:v1', payload);
    } catch {}
  }, [mode, selectedCategory, turns]);

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

  // Haversine distance in miles
  const distanceMiles = (la1?: number, lo1?: number, la2?: number, lo2?: number) => {
    if (!la1 || !lo1 || !la2 || !lo2) return Number.POSITIVE_INFINITY;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 3959; // miles
    const dLat = toRad(la2 - la1);
    const dLon = toRad(lo2 - lo1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(la1)) * Math.cos(toRad(la2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // After location available, show/refresh closest businesses in quick mode (top 5 with distance)
  useEffect(() => {
    if (mode !== 'quick') return;
    if (!permissionState.granted) return;
    if (!businesses || businesses.length === 0) return;

    const sorted = businesses
      .slice()
      .sort((a, b) =>
        distanceMiles(location?.latitude, location?.longitude, a.latitude, a.longitude) -
        distanceMiles(location?.latitude, location?.longitude, b.latitude, b.longitude)
      );
    const top = sorted.slice(0, 5);
    setNearbyPromptList(top);
    const lines = top.map((b, i) => {
      const miles = distanceMiles(location?.latitude, location?.longitude, b.latitude, b.longitude);
      const mi = Number.isFinite(miles) ? `${miles.toFixed(1)} mi` : '';
      return `${i + 1}) ${b.name}${mi ? ` • ${mi}` : ''}`;
    });
    const msg = `Closest options:\n${lines.join('\n')}\n\nReply 1–${top.length} to pick one, or ask anything else.`;

    setTurns((prev) => {
      // Update existing nearby message if present, else append
      if (nearbyMsgIndexRef.current != null && prev[nearbyMsgIndexRef.current]) {
        const copy = [...prev];
        copy[nearbyMsgIndexRef.current] = { role: 'assistant', content: msg } as ChatTurn;
        return copy;
      }
      const newIdx = prev.length;
      nearbyMsgIndexRef.current = newIdx;
      setShowedNearbyPrompt(true);
      return [...prev, { role: 'assistant', content: msg } as ChatTurn];
    });
  }, [mode, permissionState.granted, businesses, location?.latitude, location?.longitude]);

  const send = async (text: string) => {
  cancelRef.current = false;
    const userTurn: ChatTurn = { role: 'user', content: text };
    const nextTurns: ChatTurn[] = [...turns, userTurn];
    setTurns(nextTurns);
  if (mode === 'planning') setIsThinking(true);

    // If user typed a number selecting one of the listed businesses in quick mode
    const numMatch = text.trim().match(/^([1-9]\d*)$/);
    if (mode === 'quick' && numMatch) {
      const list = nearbyPromptList && nearbyPromptList.length > 0 ? nearbyPromptList : businesses;
      if (!list || list.length === 0) return;
      const idx = Math.max(1, Math.min(list.length, parseInt(numMatch[1], 10))) - 1;
      const chosen = list[idx];
      if (chosen?.name) {
        setSelectedPlaceName(chosen.name);
  const confirmTurn: ChatTurn = { role: 'assistant', content: `Locked in: ${chosen.name}. Pulling your top cards…` };
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
          // Append recommendations as a chat message
          const lines = recs.map((rec, i) => {
            const math = formatTransparentMath(rec);
            const reasons = (math.reasons || []).slice(0, 3);
            const reasonsLine = reasons.length ? `\n   Why: ${reasons.join(', ')}` : '';
            const match = typeof rec.match_score === 'number' ? ` (${Math.round(rec.match_score)} match)` : '';
            return `${i + 1}) ${rec.card.card_name} — ${rec.card.issuer}${match}\n   Est. value per $100: $${math.estValueUSD}; Monthly net: $${math.netMonthlyUSD}${reasonsLine}`;
          });
          const recMsg: ChatTurn = { role: 'assistant', content: `Top picks for ${chosen.name}:\n${lines.join('\n')}` };
          setTurns(prev => [...prev, recMsg]);
        } catch {}
        return;
      }
    }
  const ctx: Record<string, unknown> = { mode };
    if (location) ctx.location = location;
    if (place) ctx.business = place;
  const { reply, suggestions } = await converse(nextTurns, ctx);
  setIsThinking(false);
  await typeOutReply(reply, mode === 'planning');
  setSuggestions(suggestions || []);

  // Also pull top recommendations based on mode
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
      const lines = recs.map((rec, i) => {
        const math = formatTransparentMath(rec);
        const reasons = (math.reasons || []).slice(0, 3);
        const reasonsLine = reasons.length ? `\n   Why: ${reasons.join(', ')}` : '';
        const match = typeof rec.match_score === 'number' ? ` (${Math.round(rec.match_score)} match)` : '';
        return `${i + 1}) ${rec.card.card_name} — ${rec.card.issuer}${match}\n   Est. value per $100: $${math.estValueUSD}; Monthly net: $${math.netMonthlyUSD}${reasonsLine}`;
      });
      const recMsg: ChatTurn = { role: 'assistant', content: `Top picks${place ? ` for ${place}` : ''}:\n${lines.join('\n')}` };
      setTurns(prev => [...prev, recMsg]);
    } catch {}
  } else {
    try {
      const recs = await fetchTopRecommendations({
        category: selectedCategory,
        limit: 3,
      });
      setPlanningRecs(recs);
      publish(recs, { mode, category: selectedCategory, place });
      const lines = recs.map((rec, i) => {
        const math = formatTransparentMath(rec);
        const reasons = (math.reasons || []).slice(0, 3);
        const reasonsLine = reasons.length ? `\n   Why: ${reasons.join(', ')}` : '';
        const match = typeof rec.match_score === 'number' ? ` (${Math.round(rec.match_score)} match)` : '';
        return `${i + 1}) ${rec.card.card_name} — ${rec.card.issuer}${match}\n   Est. value per $100: $${math.estValueUSD}; Monthly net: $${math.netMonthlyUSD}${reasonsLine}`;
      });
      const recMsg: ChatTurn = { role: 'assistant', content: `Top picks for ${selectedCategory}:\n${lines.join('\n')}` };
      setTurns(prev => [...prev, recMsg]);
    } catch {}
  }
  };

  return (
    <div className="bg-white border border-gray-200 p-4 sm:p-5 md:p-6 space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 p-1 bg-gray-100 text-sm">
          <button onClick={() => setMode('quick')} className={`px-3 py-1 ${mode==='quick' ? 'bg-white shadow-sm' : ''}`}>Quick</button>
          <button onClick={() => setMode('planning')} className={`px-3 py-1 ${mode==='planning' ? 'bg-white shadow-sm' : ''}`}>Planning</button>
        </div>
        {!permissionState.granted && (
          <button onClick={requestLocation} className="text-xs px-3 py-1 bg-blue-600 text-white">Enable location</button>
        )}
      </div>

      {/* Quick mode category selector */}
      {mode === 'quick' && (
        <div className="flex flex-wrap gap-2 text-xs">
          {['dining','groceries','gas','hotels','travel'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 border ${selectedCategory===cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-200'}`}
            >
              {cat.charAt(0).toUpperCase()+cat.slice(1)}
            </button>
          ))}
        </div>
      )}

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

      <div className="text-base">
        <ConversationDisplay messages={turns.map((t, i) => ({ ...t, id: String(i) }))} />
      </div>

      {(mode === 'planning' && isThinking) && (
        <div className="inline-flex items-center gap-3 p-3 border bg-gray-50 text-gray-700 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Thinking…
          <button
            onClick={() => { cancelRef.current = true; clearTyping(); setIsThinking(false); }}
            className="px-2 py-1 text-xs bg-red-600 text-white"
          >Stop</button>
        </div>
      )}

      {/* Stop control while streaming typed replies in any mode */}
      {typingTimerRef.current && (
        <div className="inline-flex items-center gap-2 p-2 border bg-gray-50 text-gray-700 text-xs">
          <span>Streaming…</span>
          <button
            onClick={() => { cancelRef.current = true; clearTyping(); setIsThinking(false); }}
            className="px-2 py-0.5 bg-red-600 text-white"
          >Stop</button>
        </div>
      )}

  <SuggestionChips items={suggestions} onPick={(s) => { setInput(''); send(s); }} />

  {/* Recommendations are now shown directly in the chat above */}

      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about the best card…" className="flex-1 border border-gray-300 px-3 py-3 text-base" />
        <button onClick={() => input && send(input)} className="px-5 py-3 bg-blue-600 text-white text-sm">Send</button>
      </div>
    </div>
  );
}
