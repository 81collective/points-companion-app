'use client';
import React, { useEffect, useMemo, useState, useRef as useRefReact } from 'react';
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
import { useRouter } from 'next/navigation';

export default function BusinessAssistant() {
  const router = useRouter();
  const { location, permissionState, requestLocation } = useLocation();
  const [mode, setMode] = useState<'quick' | 'planning'>('quick');
  const [selectedCategory, setSelectedCategory] = useState<string>('dining');
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [anonQueryCount, setAnonQueryCount] = useState(0);
  const [input, setInput] = useState('');
  const [_topRecs, setTopRecs] = useState<Recommendation[]>([]); // kept for publishing to store
  // Planning mode no longer auto-injects picks; keep state lean
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
  const lastInteractionWasChipRef = useRef<boolean>(false);
  const nearbyMsgIndexRef = useRef<number | null>(null);
  const cancelRef = useRef<boolean>(false);
  const hydratingRef = useRef<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRefReact<HTMLDivElement | null>(null);
  const inputRef = useRefReact<HTMLInputElement | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const fileInputRef = useRefReact<HTMLInputElement | null>(null);

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
    // Insert empty assistant bubble and capture its index reliably
    let assistantIndex = -1;
    setTurns(prev => {
      assistantIndex = prev.length;
      return [...prev, { role: 'assistant', content: '' }];
    });

    const appendChar = (ch: string) => {
      setTurns(prev => {
        const copy = [...prev];
        const idx = assistantIndex >= 0 ? assistantIndex : copy.findIndex((m, i) => i === copy.length - 1);
        if (idx < 0 || !copy[idx]) return prev;
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
  abortRef.current?.abort();
      setInput('');
      setShowedNearbyPrompt(false);
  nearbyMsgIndexRef.current = null;
  // small refocus
  setTimeout(() => inputRef.current?.focus(), 0);
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
  }, [mode, inputRef]);

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
  const cappedTurns = turns.slice(-50);
  const payload = JSON.stringify({ mode, selectedCategory, turns: cappedTurns });
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

  // Auto-scroll to latest and refocus input after updates
  useEffect(() => {
    const behavior: ScrollBehavior = lastInteractionWasChipRef.current ? 'auto' : 'smooth';
    endRef.current?.scrollIntoView({ behavior, block: 'end' });
    lastInteractionWasChipRef.current = false;
  }, [turns.length, isThinking, endRef]);

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

  const isUserAuthed = () => {
    if (typeof window === 'undefined') return false;
    try {
      const w = window as unknown as { __USER_ID__?: unknown };
      return Boolean(w.__USER_ID__);
    } catch {
      return false;
    }
  };

  // Helper to compute and display the closest options message
  const showClosestOptions = React.useCallback((list?: typeof businesses) => {
    if (mode !== 'quick') return;
    if (!permissionState.granted) return;
    const src = list && list.length ? list : businesses;
    if (!src || src.length === 0) return;

    const sorted = src
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
      return `${i + 1}. ${b.name}${mi ? ` • ${mi}` : ''}`;
    });
    const msg = `Closest options:\n${lines.join('\n')}\n\nReply 1–${top.length} to pick one, or ask anything else.`;

    setTurns((prev) => {
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

  // Simple savings teaser for common categories (spec demo only)
  const getSavingsTeaser = (category?: string) => {
    const cat = (category || selectedCategory || '').toLowerCase();
    if (cat.includes('dining')) {
      return 'Quick insight: $500/mo dining → right card ≈ $300/yr vs $60/yr basic.';
    }
    if (cat.includes('grocer')) {
      return 'Quick insight: $600/mo groceries → right card ≈ $288–$432/yr vs $72/yr basic.';
    }
    return '';
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    if (mode === 'quick') {
      const label = cat.charAt(0).toUpperCase() + cat.slice(1);
      setTurns(prev => [...prev, { role: 'user', content: `Selected category: ${label}` } as ChatTurn]);
      // Assistant hint and category-tailored suggestions
      setTurns(prev => [...prev, { role: 'assistant', content: `Got it — set to ${label}. Ask for a store (e.g., Starbucks) or say “Show top 3 nearby places.”` } as ChatTurn]);
      setSuggestions([
        `Best card for ${label.toLowerCase()} today`,
        'Show me the top 3 nearby places',
        `Compare ${label.toLowerCase()} vs groceries`,
      ]);
  // Immediately refresh closest options (using current data) for better responsiveness
  try { showClosestOptions(); } catch {}
    }
  };

  // Slash commands: /help, /wallet, /best [place], /missing, /compare, /simulate
  const handleSlashCommand = async (raw: string): Promise<boolean> => {
    const trimmed = (raw || '').trim();
    if (!trimmed.startsWith('/')) return false;
    const parts = trimmed.slice(1).split(/\s+/);
    const cmd = (parts.shift() || '').toLowerCase();
    const arg = parts.join(' ').trim();

    // Stop any streaming/thinking
    cancelRef.current = true;
    clearTyping();
    setIsThinking(false);

    switch (cmd) {
      case 'help': {
        const help = `Slash commands you can use:
• /help — show this menu
• /wallet — open your Wallet (cards) in the dashboard
• /best [place] — quick pick for a specific store/merchant
• /missing — report missing data (business or card)
• /compare — compare cards, categories, or setups
• /simulate — simulate a plan given your spend/goals`;
        setTurns(prev => [...prev, { role: 'assistant', content: help } as ChatTurn]);
        setSuggestions([
          '/best Starbucks',
          'Compare Amex Gold vs Citi Strata Premier',
          'Design a grocery + gas combo for $800/mo',
          'Open my Wallet',
        ]);
        return true;
      }
      case 'wallet': {
        setTurns(prev => [...prev, { role: 'assistant', content: 'Opening your Wallet…' } as ChatTurn]);
        try {
          router.push('/dashboard/cards');
        } catch {}
        return true;
      }
      case 'best': {
        const placeName = arg || '';
        if (!placeName) {
          setTurns(prev => [...prev, { role: 'assistant', content: 'Usage: /best [place]. Example: /best Whole Foods' } as ChatTurn]);
          setSuggestions(['/best Starbucks', 'Best card for groceries today']);
          return true;
        }
        setMode('quick');
        setSelectedPlaceName(placeName);
        const confirm: ChatTurn = { role: 'assistant', content: `Locked in: ${placeName}. Pulling your top cards…` } as ChatTurn;
        setTurns(prev => [...prev, confirm]);
        try {
          abortRef.current?.abort();
          abortRef.current = new AbortController();
          const recs = await fetchTopRecommendations({
            category: selectedCategory,
            businessName: placeName,
            lat: location?.latitude,
            lng: location?.longitude,
            limit: 3,
          }, { signal: abortRef.current.signal });
          setTopRecs(recs);
          publish(recs, { mode: 'quick', category: selectedCategory, place: placeName });
          const lines = recs.map((rec, i) => {
            const math = formatTransparentMath(rec);
            const reasons = (math.reasons || []).slice(0, 3);
            const reasonsLine = reasons.length ? `\n   Why: ${reasons.join(', ')}` : '';
            const match = typeof rec.match_score === 'number' ? ` (${Math.round(rec.match_score)} match)` : '';
            return `${i + 1}) ${rec.card.card_name} — ${rec.card.issuer}${match}\n   Est. value per $100: $${math.estValueUSD}; Monthly net: $${math.netMonthlyUSD}${reasonsLine}`;
          });
          const recMsg: ChatTurn = { role: 'assistant', content: `Top picks for ${placeName}:\n${lines.join('\n')}` } as ChatTurn;
          setTurns(prev => [...prev, recMsg]);
          // Savings teaser for anonymous users
          try {
            const teaser = getSavingsTeaser(selectedCategory);
            if (!isUserAuthed() && teaser) {
              setTurns(prev => [...prev, { role: 'assistant', content: `💡 ${teaser}` } as ChatTurn]);
            }
          } catch {}
        } catch {}
        return true;
      }
      case 'missing': {
        const msg = `Tell me what's missing and I'll flag it:
• Business: name + city/state (e.g., “Joe's Coffee, Austin TX”)
• Card: which card and what's off/missing (benefit, multiplier, terms)
I’ll log this for review and improve future results.`;
        setTurns(prev => [...prev, { role: 'assistant', content: msg } as ChatTurn]);
        setSuggestions(['Report missing business: [name, city]', 'Report card issue: [card] [what’s wrong]']);
        return true;
      }
      case 'compare': {
        setMode('planning');
        const msg = `What would you like to compare?
Examples:
• Amex Gold vs Citi Strata Premier vs Chase Sapphire Preferred
• Gas vs Groceries for $600/mo
• My current setup vs a 2‑card alternative`;
        setTurns(prev => [...prev, { role: 'assistant', content: msg } as ChatTurn]);
        setSuggestions([
          'Compare Amex Gold vs Citi Strata Premier vs CSP',
          'Compare gas vs groceries',
          'Audit my current cards and find overlaps',
        ]);
        return true;
      }
      case 'simulate': {
        setMode('planning');
        const msg = `Give me a quick brief and I’ll simulate a plan:
• Monthly spend by category (dining, groceries, gas, travel, online, other)
• Goals and timing (e.g., Hawaii in March, 2 travelers)
• Preferences (cash back vs points/miles, favorite programs)
• Current cards and constraints (e.g., 5/24)
• Annual fee comfort`;
        setTurns(prev => [...prev, { role: 'assistant', content: msg } as ChatTurn]);
        setSuggestions([
          'Simulate: $800 groceries, $200 gas; plan 2‑card setup',
          'Plan welcome bonuses for Hawaii in March',
        ]);
        return true;
      }
      default: {
        setTurns(prev => [...prev, { role: 'assistant', content: 'Unknown command. Type /help to see options.' } as ChatTurn]);
        return true;
      }
    }
  };

  // After location available, show/refresh closest businesses in quick mode (top 5 with distance)
  useEffect(() => {
    if (mode !== 'quick') return;
    if (!permissionState.granted) return;
    if (!businesses || businesses.length === 0) return;
  showClosestOptions(businesses);
  }, [mode, permissionState.granted, businesses, location?.latitude, location?.longitude, showClosestOptions]);

  const send = async (text: string, opts?: { silentUser?: boolean }) => {
  cancelRef.current = false;
    // Track soft conversion triggers (anonymous sessions only)
    // Heuristic: increment on each user message; after 3, surface a signup CTA
    try {
      if (!isUserAuthed()) {
        setAnonQueryCount((n) => n + 1);
      }
    } catch {}
    const userTurn: ChatTurn = { role: 'user', content: text };
    const nextTurns: ChatTurn[] = [...turns, userTurn];
    if (!opts?.silentUser) {
      setTurns(nextTurns);
    }
    // Slash command short-circuit
  if (text.trim().startsWith('/')) {
      const handled = await handleSlashCommand(text);
      if (handled) return;
    }

    // Planning-mode: intercept explicit rec request chip to fetch picks tied to current plan
  const lc = text.trim().toLowerCase();
  if (mode === 'planning' && (lc === 'show recommendations for this plan' || lc === 'show recommendations' || lc.startsWith('show recommendations for'))) {
      try {
        setIsThinking(true);
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        const recs = await fetchTopRecommendations({
          category: selectedCategory,
          businessName: place,
          lat: location?.latitude,
          lng: location?.longitude,
          limit: 3,
        }, { signal: abortRef.current.signal });
        setIsThinking(false);
        setTopRecs(recs);
        publish(recs, { mode, category: selectedCategory, place });
        const lines = recs.map((rec, i) => {
          const math = formatTransparentMath(rec);
          const reasons = (math.reasons || []).slice(0, 3);
          const reasonsLine = reasons.length ? `\n   Why: ${reasons.join(', ')}` : '';
          const match = typeof rec.match_score === 'number' ? ` (${Math.round(rec.match_score)} match)` : '';
          return `${i + 1}) ${rec.card.card_name} — ${rec.card.issuer}${match}\n   Est. value per $100: $${math.estValueUSD}; Monthly net: $${math.netMonthlyUSD}${reasonsLine}`;
        });
        const header = place ? `Top picks for ${place}:` : `Top picks for ${selectedCategory}:`;
        setTurns(prev => [...prev, { role: 'assistant', content: `${header}\n${lines.join('\n')}` } as ChatTurn]);
        const simple = recs.map(r => ({ card: { card_name: r.card.card_name, issuer: r.card.issuer }, summary: (formatTransparentMath(r).reasons || []).slice(0,1).join(', '), est_value_usd: formatTransparentMath(r).estValueUSD }));
        setTurns(prev => [...prev, { role: 'assistant', content: `RECS_JSON:${JSON.stringify(simple)}` } as ChatTurn]);
      } catch {
        setIsThinking(false);
      }
      return;
    }
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
          abortRef.current?.abort();
          abortRef.current = new AbortController();
          const recs = await fetchTopRecommendations({
            category: selectedCategory,
            businessName: chosen.name,
            lat: location?.latitude,
            lng: location?.longitude,
            limit: 3,
          }, { signal: abortRef.current.signal });
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
          // Embedded cards bubble data (lightweight fields)
          const simple = recs.map(r => ({ card: { card_name: r.card.card_name, issuer: r.card.issuer }, summary: (formatTransparentMath(r).reasons || []).slice(0,1).join(', '), est_value_usd: formatTransparentMath(r).estValueUSD }));
          setTurns(prev => [...prev, { role: 'assistant', content: `RECS_JSON:${JSON.stringify(simple)}` } as ChatTurn]);
        } catch {}
        return;
      }
    }
  const ctx: Record<string, unknown> = { mode };
    if (location) ctx.location = location;
    if (place) ctx.business = place;
  abortRef.current?.abort();
  abortRef.current = new AbortController();
  const { reply, suggestions } = await converse(nextTurns, ctx, { signal: abortRef.current.signal });
  setIsThinking(false);
  await typeOutReply(reply, mode === 'planning');
  setSuggestions(suggestions || []);
  // Nudge with a lightweight, opt-in recs chip in Planning mode
  if (mode === 'planning') {
    setSuggestions(prev => {
      const label = place
        ? `Show recommendations for ${place}`
        : `Show recommendations for ${selectedCategory}`;
      // Remove any prior rec chips to avoid duplicates when context changes
      const filtered = prev.filter(s => !s.toLowerCase().startsWith('show recommendations'));
      return [label, ...filtered].slice(0, 6);
    });
  }
  // Append soft signup suggestion for anonymous users after a few queries
  try {
    if (!isUserAuthed() && anonQueryCount + 1 >= 3) {
      setSuggestions((prev) => {
        const plus = 'Save my picks to a profile';
        return prev.includes(plus) ? prev : [plus, ...prev].slice(0, 6);
      });
    }
  } catch {}

  // Also pull top recommendations based on mode
  if (mode === 'quick') {
    try {
  abortRef.current?.abort();
  abortRef.current = new AbortController();
  const recs = await fetchTopRecommendations({
        category: selectedCategory,
        businessName: place,
        lat: location?.latitude,
        lng: location?.longitude,
        limit: 3,
  }, { signal: abortRef.current.signal });
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
  const simple = recs.map(r => ({ card: { card_name: r.card.card_name, issuer: r.card.issuer }, summary: (formatTransparentMath(r).reasons || []).slice(0,1).join(', '), est_value_usd: formatTransparentMath(r).estValueUSD }));
  setTurns(prev => [...prev, { role: 'assistant', content: `RECS_JSON:${JSON.stringify(simple)}` } as ChatTurn]);
    } catch {}
    // Surface a small savings teaser for anonymous users
    try {
      const teaser = getSavingsTeaser(selectedCategory);
      if (!isUserAuthed() && teaser) {
        setTurns(prev => [...prev, { role: 'assistant', content: `💡 ${teaser}` }]);
      }
    } catch {}
  }
  };

  return (
    <div className="bg-[#F7F7F7] border border-gray-200 p-0 sm:p-0 md:p-0 w-full">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-white">
        <div className="text-sm font-medium">AI Assistant</div>
        <div className="text-xs text-gray-500">Online{(typingTimerRef.current || isThinking) ? ' • Typing…' : ''}</div>
      </div>
      <div className="p-4 space-y-4">
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
      onClick={() => handleSelectCategory(cat)}
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
        <ConversationDisplay
          typing={Boolean(typingTimerRef.current) || isThinking}
          messages={turns.map((t, i) => ({ ...t, id: String(i) }))}
          onViewCard={(name, issuer) => {
            try {
              const params = new URLSearchParams({ view: 'card', name });
              if (issuer) params.set('issuer', issuer);
              router.push(`/dashboard/cards?${params.toString()}`);
            } catch {
              router.push('/dashboard/cards');
            }
          }}
          onAddCard={(name, issuer) => {
            try {
              const params = new URLSearchParams({ add: 'card', name });
              if (issuer) params.set('issuer', issuer);
              router.push(`/dashboard/cards?${params.toString()}`);
            } catch {
              router.push('/dashboard/cards');
            }
          }}
        />
  <div ref={endRef} />
      </div>

      {(mode === 'planning' && isThinking) && (
        <div className="inline-flex items-center gap-3 p-3 border bg-gray-50 text-gray-700 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Thinking…
          <button
            onClick={() => { cancelRef.current = true; abortRef.current?.abort(); clearTyping(); setIsThinking(false); }}
            className="px-2 py-1 text-xs bg-red-600 text-white"
          >Stop</button>
        </div>
      )}

      {/* Stop control while streaming typed replies in any mode */}
      {typingTimerRef.current && (
        <div className="inline-flex items-center gap-2 p-2 border bg-gray-50 text-gray-700 text-xs">
          <span>Streaming…</span>
          <button
            onClick={() => { cancelRef.current = true; abortRef.current?.abort(); clearTyping(); setIsThinking(false); }}
            className="px-2 py-0.5 bg-red-600 text-white"
          >Stop</button>
        </div>
      )}

  <SuggestionChips
    items={suggestions}
    onPick={(s) => {
      // Show the chip as a user bubble, then trigger normal send to produce assistant reply
      setInput('');
      setTurns(prev => [...prev, { role: 'user', content: s } as ChatTurn]);
      // Call send with silent user so we don't duplicate the user message
      lastInteractionWasChipRef.current = true;
      send(s, { silentUser: true });
    }}
  />

      {/* Recommendations are now shown directly in the chat above */}
      <div className="sticky bottom-0 left-0 right-0 bg-[#F7F7F7] pt-2">
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="h-10 w-10 rounded-full grid place-items-center text-gray-600 hover:bg-gray-200"
            aria-label="More actions"
            title="More actions"
            onClick={() => setShowQuickActions(true)}
          >
            +
          </button>
          <div className="flex-1 bg-white border border-[#E0E0E0] rounded-3xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
            <textarea
              ref={inputRef as unknown as React.RefObject<HTMLTextAreaElement>}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              rows={1}
              className="w-full resize-none outline-none text-base placeholder:text-gray-400 max-h-[120px]"
            />
          </div>
          {input?.trim() ? (
            <button
              onClick={() => input && send(input)}
              className="h-10 px-4 rounded-full bg-[#007AFF] text-white text-sm active:scale-95 transition-transform"
              aria-label="Send"
            >
              Send
            </button>
          ) : (
            <button
              type="button"
              className="h-10 w-10 rounded-full grid place-items-center text-gray-600 hover:bg-gray-200"
              aria-label="Voice input"
              title="Voice input"
            >
              🎤
            </button>
          )}
        </div>
      </div>
      {/* Quick Actions Bottom Sheet */}
      {showQuickActions && (
        <div className="fixed inset-0 z-40" aria-modal="true" role="dialog" aria-label="Quick actions">
          <button className="absolute inset-0 bg-black/30" aria-label="Close" onClick={() => setShowQuickActions(false)} />
          <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-xl p-4 space-y-3">
            <div className="h-1 w-10 bg-gray-300 rounded mx-auto" />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { requestLocation(); setShowQuickActions(false); setTurns(prev=>[...prev,{role:'assistant',content:'Using your location to improve nearby picks.'} as ChatTurn]); }} className="p-3 border rounded-xl text-left hover:bg-gray-50">
                <div className="text-base">Share location</div>
                <div className="text-xs text-gray-500">Get nearby recommendations</div>
              </button>
              <button onClick={() => { fileInputRef.current?.click(); }} className="p-3 border rounded-xl text-left hover:bg-gray-50">
                <div className="text-base">Upload receipt</div>
                <div className="text-xs text-gray-500">Analyze rewards opportunities</div>
              </button>
              <button onClick={() => { setShowQuickActions(false); try { (window as unknown as { __routerPush?: (p:string)=>void }).__routerPush?.('/dashboard/cards'); } catch {}; }} className="p-3 border rounded-xl text-left hover:bg-gray-50">
                <div className="text-base">View card wallet</div>
                <div className="text-xs text-gray-500">See your saved cards</div>
              </button>
              <button onClick={() => { setMode('planning'); setShowQuickActions(false); setTurns(prev=>[...prev,{role:'assistant',content:'Switched to Planning — tell me your goals, spend, and timeline.'} as ChatTurn]); }} className="p-3 border rounded-xl text-left hover:bg-gray-50">
                <div className="text-base">Start planning</div>
                <div className="text-xs text-gray-500">Design a step‑by‑step strategy</div>
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={() => { setShowQuickActions(false); setTurns(prev=>[...prev,{role:'assistant',content:'Thanks — receipt analysis is coming soon.'} as ChatTurn]); }} />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
