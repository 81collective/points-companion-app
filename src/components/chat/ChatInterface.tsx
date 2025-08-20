"use client";
import React, { useRef, useState } from 'react';
import ChatBubble from '@/components/chat/ChatBubble';
import CategoryChips from '@/components/chat/CategoryChips';
import type { Message, UserCard } from '../../types/ai-assistant';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyBusinesses } from '@/hooks/useNearbyBusinesses';
import { useCardRecommendations } from '@/hooks/useCardRecommendations';
import BusinessCardInChat from './BusinessCardInChat';
import TypingIndicator from './TypingIndicator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MiniSpendingInsights from './MiniSpendingInsights';
import { useAuth } from '@/contexts/AuthContext';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { MapPin, Star } from 'lucide-react';
import { useBestCardsForBusinesses } from '@/hooks/useBestCardsForBusinesses';

export interface ChatInterfaceProps {
  mode: 'quick' | 'planning';
  isAuthenticated: boolean;
  // Accept full UserCard or minimal objects with at least a name
  userCards?: Array<UserCard | { id: string; name: string; issuer?: string }>;
  /**
   * When false, the chat will not persist UI state (activeTab/category) to localStorage
   * and will not read it back on mount. Useful for embedded homepage toggle.
   */
  persistUiState?: boolean;
}

const initialMessage = (mode: 'quick' | 'planning'): Message => ({
  id: 'intro',
  role: 'assistant',
  content: mode === 'quick'
    ? "I'm ready to help pick the best card for where you are. Tell me the place or pick a category."
    : 'Planning mode designs a winning card strategy for your bigger goals. Share your goals and spend to begin.',
  timestamp: Date.now(),
});

export default function ChatInterface({ mode, isAuthenticated: _isAuthenticated, userCards: _userCards, persistUiState = true }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([initialMessage(mode)]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<string>(mode === 'quick' ? 'all' : 'dining');
  const [activeTab, setActiveTab] = useState<'quick' | 'planning'>(mode);
  const [showAllNearby, setShowAllNearby] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | undefined>();
  const [selectedBusinessName, setSelectedBusinessName] = useState<string | undefined>();
  const [walletOnly, setWalletOnly] = useState<boolean>(!!(_userCards && _userCards.length > 0));
  const [walletOnlyTouched, setWalletOnlyTouched] = useState<boolean>(false);
  const isMountedRef = useRef(false);
  // If user has a wallet and hasn't manually changed the toggle yet, default to ON
  React.useEffect(() => {
    if (!walletOnlyTouched && _userCards && _userCards.length > 0 && !walletOnly) {
      setWalletOnly(true);
    }
  }, [_userCards, walletOnly, walletOnlyTouched]);
  // Load persisted walletOnly preference
  React.useEffect(() => {
    if (!persistUiState) return;
    try {
      const v = localStorage.getItem('chat.walletOnly');
      if (v === 'true' || v === 'false') {
        setWalletOnly(v === 'true');
        setWalletOnlyTouched(true); // respect user’s prior choice
      }
    } catch {}
  }, [persistUiState]);
  // Persist walletOnly when it changes
  React.useEffect(() => {
    if (!persistUiState) return;
    try { localStorage.setItem('chat.walletOnly', walletOnly ? 'true' : 'false'); } catch {}
  }, [walletOnly, persistUiState]);

  // Persist tab & category (optional)
  React.useEffect(() => {
    if (!persistUiState) return;
    try { localStorage.setItem('chat.activeTab', activeTab); } catch {}
  }, [activeTab, persistUiState]);
  React.useEffect(() => {
    if (!persistUiState) return;
    try { localStorage.setItem('chat.category', category); } catch {}
  }, [category, persistUiState]);
  React.useEffect(() => {
    if (!persistUiState) return;
    try {
      const t = localStorage.getItem('chat.activeTab');
      const c = localStorage.getItem('chat.category');
      if (t === 'quick' || t === 'planning') setActiveTab(t);
      if (c) setCategory(c);
    } catch {}
    // run once on mount only
     
  }, [persistUiState]);

  // Location and data hooks
  const { location, permissionState, requestLocation } = useLocation();
  const { businesses: nearbyBusinesses } = useNearbyBusinesses({
    latitude: location?.latitude,
    longitude: location?.longitude,
    category,
    radius: 5000,
    enabled: permissionState.granted && !!location,
  });
  // Always sort nearby by distance ascending when available
  const sortedNearby = React.useMemo(() => {
    const list = (nearbyBusinesses || []).slice();
    list.sort((a, b) => {
      const da = typeof a.distance === 'number' ? a.distance : Number.POSITIVE_INFINITY;
      const db = typeof b.distance === 'number' ? b.distance : Number.POSITIVE_INFINITY;
      if (da !== db) return da - db;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [nearbyBusinesses]);
  // If no explicit selection, in Planning use the top nearby business name as a fallback context
  const planningFallbackBusinessName = activeTab === 'planning' ? (selectedBusinessName ?? sortedNearby?.[0]?.name) : selectedBusinessName;
  const { recommendations, loading: recLoading } = useCardRecommendations({
    category,
    latitude: location?.latitude,
    longitude: location?.longitude,
  businessId: selectedBusinessId,
  businessName: planningFallbackBusinessName,
  enabled: !!category,
  });

  // In planning with no explicit selection, also compute best card per top nearby business
  const { items: perBusinessBest, loading: _perBusinessLoading } = useBestCardsForBusinesses({
    category,
    latitude: location?.latitude,
    longitude: location?.longitude,
    businesses: sortedNearby || [],
    enabled: activeTab === 'planning' && permissionState.granted && !!location,
    limit: 5,
  });

  // Auto-scroll to latest message
  React.useEffect(() => {
    if (!isMountedRef.current) { isMountedRef.current = true; return; }
    try {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    } catch {}
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = Date.now();
    const userMsg: Message = { id: `${now}`,'role':'user', content: trimmed, timestamp: now };
    const pendingId = `pending-${now}`;
    const pendingAssistant: Message = { id: pendingId, role: 'assistant', content: '', timestamp: now };
    setMessages(prev => [...prev, userMsg, pendingAssistant]);

    // Prepare context for the assistant
    const context = {
      mode: activeTab,
      category,
      walletOnly,
      location: location ? { latitude: location.latitude, longitude: location.longitude } : undefined,
      selectedBusiness: selectedBusinessId || selectedBusinessName ? { id: selectedBusinessId, name: selectedBusinessName } : undefined,
      hasWallet: !!(_userCards && _userCards.length > 0),
      userCards: (_userCards || []).map((c: UserCard | { id: string; name: string; issuer?: string }) => ({
        id: c.id,
        name: c.name,
        issuer: 'issuer' in c && c.issuer ? c.issuer : undefined
      }))
    };

    try {
      const turns = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/assistant/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turns, context }),
      });
      const data = await res.json();

      const replyText: string = data?.reply || data?.content || 'I had trouble generating a response.';
      const suggestions: string[] | undefined = Array.isArray(data?.suggestions) ? data.suggestions : undefined;

      setMessages(prev => prev.map(m => (
        m.id === pendingId ? { ...m, content: replyText, suggestions } : m
      )));
    } catch (err) {
      setMessages(prev => prev.map(m => (
        m.id === pendingId ? { ...m, content: 'Sorry, something went wrong while contacting the assistant.' } : m
      )));
    }
  };

  // Helper: fuzzy wallet match against userCards
  const isOwnedCard = React.useCallback((cardName?: string) => {
    if (!cardName || !_userCards || _userCards.length === 0) return false;
    const issuerWords = ['chase','american express','amex','citi','capital one','bank of america','wells fargo','discover','apple'];
    const clean = (s: string) => s.toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const stripIssuers = (s: string) => {
      let out = ` ${s} `; // pad for whole-word replace safety
      issuerWords.forEach(w => { out = out.replace(new RegExp(` ${w} `, 'g'), ' '); });
      return out.trim().replace(/\s+/g, ' ');
    };
    const recNorm = clean(cardName);
    const recCore = stripIssuers(recNorm).trim();
    const userNorms = (_userCards || []).map(c => {
      const n = clean(c.name);
      const core = stripIssuers(n);
      return { n, core };
    });
    // match if names include each other in either raw or core forms
    return userNorms.some(u => (
      u.n.includes(recNorm) || recNorm.includes(u.n) ||
      u.core.includes(recCore) || recCore.includes(u.core)
    ));
  }, [_userCards]);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b">
        <div className="flex items-center justify-between px-3 sm:px-4 pt-2">
          <Tabs value={activeTab} onValueChange={(v)=>setActiveTab(v as 'quick'|'planning')}>
            <TabsList className="bg-transparent">
              <TabsTrigger value="quick">Quick</TabsTrigger>
              <TabsTrigger value="planning">Planning</TabsTrigger>
            </TabsList>
          </Tabs>
          {/* Compact toggle to switch modes */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className={activeTab==='quick' ? 'text-blue-700 font-medium' : 'text-gray-500'}>Quick</span>
            <button
              type="button"
              aria-label="Toggle mode"
              onClick={() => setActiveTab(prev => prev === 'quick' ? 'planning' : 'quick')}
              className="relative inline-flex h-6 w-10 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${activeTab==='planning' ? 'translate-x-4' : 'translate-x-1'}`}
              />
            </button>
            <span className={activeTab==='planning' ? 'text-blue-700 font-medium' : 'text-gray-500'}>Planning</span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 sm:p-4" ref={listRef}>
  {/* Conversation messages */}
  <div className="flex flex-col gap-2">
    {messages.map(m => (
      <ChatBubble
        key={m.id}
        sender={m.role}
        message={m.content}
        timestamp={m.timestamp}
        richContent={m.role === 'assistant' ? (
          m.content ? (
            m.suggestions && m.suggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {m.suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => send(s)}
                    className="text-xs px-2 py-1 rounded-full border border-blue-300 text-blue-800 bg-white hover:bg-blue-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : undefined
          ) : (
            <TypingIndicator />
          )
        ) : undefined}
      />
    ))}
  </div>
  {/* Location helper banner (Quick only) */}
  {activeTab === 'quick' && !permissionState.granted && (
          <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-900 p-2 flex items-center justify-between">
            <span className="text-sm">Enable location to see nearby picks</span>
            <button
              type="button"
              onClick={requestLocation}
              className="px-2 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Enable
            </button>
          </div>
        )}

        {/* Tabs content */}
  {activeTab === 'quick' && (
          <>
            {/* Nearby only in Quick tab */}
            {permissionState.granted && nearbyBusinesses && nearbyBusinesses.length > 0 && (
              <div className="mt-3">
                <ChatBubble
                  sender="assistant"
                  message="Nearby places"
                  richContent={(
                    <div className="mt-1 flex flex-col gap-2">
                      {(showAllNearby ? sortedNearby : sortedNearby.slice(0, 3)).map((b) => (
                        <NearbyRow
                          key={b.id}
                          id={b.id}
                          name={b.name}
                          rating={b.rating}
                          distance={b.distance}
              onSelect={() => { setSelectedBusinessId(b.id); setSelectedBusinessName(b.name); setActiveTab('planning'); }}
                        />
                      ))}
                      {sortedNearby.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setShowAllNearby(s => !s)}
                          className="self-start text-xs text-blue-700 hover:underline"
                        >
                          {showAllNearby ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                  )}
                />
              </div>
            )}

            {/* Favorites for logged-in users */}
      {user && (
              <div className="mt-3">
        <FavoritesList onSelect={(id, name) => { setSelectedBusinessId(id); setSelectedBusinessName(name); setActiveTab('planning'); }} />
              </div>
            )}

            {/* Typing indicator while recommendations load (still relevant in Quick if we show anything async) */}
            {recLoading && (
              <div className="mt-3">
                <ChatBubble sender="assistant" message="" richContent={<TypingIndicator />} />
              </div>
            )}
          </>
        )}

        {activeTab === 'planning' && (
          <>
            {!permissionState.granted && (
              <div className="mb-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-900 p-2 flex items-center justify-between">
                <span className="text-sm">Use your location to tailor Planning recommendations</span>
                <button
                  type="button"
                  onClick={requestLocation}
                  className="px-2 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  Enable
                </button>
              </div>
            )}
            <div className="mb-2">
              {/* All category chips moved to Planning */}
              <CategoryChips onSelect={(key: string) => {
                setCategory(key);
                // Reset selection so Planning can pick up the new category's nearby as context
                setSelectedBusinessId(undefined);
                setSelectedBusinessName(undefined);
                send(`Show me best for ${key}`);
              }} />
            </div>

            {/* Recommendations carousel in Planning */}
            {recLoading && (
              <div className="mt-3">
                <ChatBubble sender="assistant" message="" richContent={<TypingIndicator />} />
              </div>
            )}
            {selectedBusinessId && recommendations && recommendations.length > 0 && (() => {
              // Wallet-aware filtering when logged in and userCards provided
              const ownedRecs = (_userCards && _userCards.length > 0)
                ? recommendations.filter(r => isOwnedCard(r.card.card_name))
                : [];
              const hasWallet = (_userCards && _userCards.length > 0);
              const anyOwned = ownedRecs.length > 0;
              const display = (hasWallet && walletOnly)
                ? (anyOwned ? ownedRecs : [])
                : recommendations;
              return (
                <div className="mt-4">
                  <div className="flex items-center justify-between px-1 pb-1">
                    <div className="text-xs text-gray-500">
                      {(hasWallet && walletOnly)
                        ? (anyOwned ? 'Best cards from your wallet' : 'No wallet matches for this place')
                        : 'Top overall cards'}
                    </div>
                    {hasWallet && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className={walletOnly ? 'text-blue-700 font-medium' : 'text-gray-500'}>Wallet only</span>
                        <button
                          type="button"
                          aria-label="Toggle wallet only"
                          onClick={() => { setWalletOnlyTouched(true); setWalletOnly(v => !v); }}
                          className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${walletOnly ? 'translate-x-4' : 'translate-x-1'}`}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <div className="flex gap-3 pr-2">
                      {(display.length > 0 ? display : recommendations).slice(0, 5).map((rec, idx) => (
                        <div key={idx} className="min-w-[260px] max-w-[320px]">
                          <BusinessCardInChat
                            business={{ name: rec?.business?.name || 'Nearby place', distance: rec?.business?.distance }}
                            recommendedCard={{ name: rec.card.card_name, issuer: rec.card.issuer, owned: isOwnedCard(rec.card.card_name) }}
                            rewards={{ text: `${rec.estimated_points} pts (~$${Math.round(rec.annual_value / 12)})` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
            {!selectedBusinessId && perBusinessBest && perBusinessBest.length > 0 && (() => {
              const hasWallet = (_userCards && _userCards.length > 0);
              const filtered = hasWallet && walletOnly
                ? perBusinessBest.filter(item => isOwnedCard(item.recommendation?.card.card_name))
                : perBusinessBest;
              const anyOwned = perBusinessBest.some(item => isOwnedCard(item.recommendation?.card.card_name));
              return (
                <div className="mt-4">
                  <div className="flex items-center justify-between px-1 pb-1">
                    <div className="text-xs text-gray-500">
                      {(hasWallet && walletOnly)
                        ? (filtered.length > 0 ? 'Best nearby matches from your wallet' : 'No wallet matches nearby')
                        : 'Best cards for nearby places'}
                    </div>
                    {hasWallet && anyOwned && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className={walletOnly ? 'text-blue-700 font-medium' : 'text-gray-500'}>Wallet only</span>
                        <button
                          type="button"
                          aria-label="Toggle wallet only"
                          onClick={() => { setWalletOnlyTouched(true); setWalletOnly(v => !v); }}
                          className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${walletOnly ? 'translate-x-4' : 'translate-x-1'}`}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <div className="flex gap-3 pr-2">
                      {(filtered.length > 0 ? filtered : perBusinessBest).map((item, idx) => (
                        <div key={item.business.id || idx} className="min-w-[260px] max-w-[320px]">
                          <BusinessCardInChat
                            business={{ name: item.business.name, distance: item.business.distance }}
                            recommendedCard={{ name: item.recommendation?.card.card_name || 'Best nearby card', issuer: item.recommendation?.card.issuer, owned: isOwnedCard(item.recommendation?.card.card_name) }}
                            rewards={item.recommendation ? { text: `${item.recommendation.estimated_points} pts (~$${Math.round(item.recommendation.annual_value / 12)})` } : undefined}
                            onSelect={() => { setSelectedBusinessId(item.business.id); setSelectedBusinessName(item.business.name); }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Spending insights inline */}
            <div className="mt-4">
              <MiniSpendingInsights />
            </div>
          </>
        )}
      </div>

      <div className="border-t bg-white p-3 sm:p-4">
        {/* Input only; category chips live in Planning tab */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); setInput(''); }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={activeTab === 'quick' ? 'Ask about a place…' : 'Share goals, spend, or ask a planning question…'}
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Send</button>
        </form>
      </div>
    </div>
  );
}

function NearbyRow({ id, name, rating, distance, onSelect }: { id: string; name: string; rating?: number; distance?: number; onSelect: () => void }) {
  const { add, remove, has } = useFavoritesStore();
  const fav = has(id);
  return (
    <div className="flex items-center justify-between rounded-md border p-2 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <span className="truncate max-w-[50%]">{name}</span>
        {typeof rating === 'number' && (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Star className="w-3 h-3 fill-current text-yellow-500" />
            {rating.toFixed(1)}
          </span>
        )}
        {typeof distance === 'number' && (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
            <MapPin className="w-3 h-3" />
            {distance < 1609.34 ? `${Math.round(distance * 3.28084)}ft` : `${(distance * 0.000621371).toFixed(1)}mi`}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => (fav ? remove(id) : add({ id, name }))}
          aria-pressed={fav}
          className={`px-2 py-1 text-xs rounded border ${fav ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-white border-gray-300 text-gray-700'}`}
        >
          {fav ? '★ Saved' : '☆ Save'}
        </button>
        <button type="button" onClick={onSelect} className="px-2 py-1 text-xs rounded bg-blue-600 text-white">Select</button>
      </div>
    </div>
  );
}

function FavoritesList({ onSelect }: { onSelect: (id: string, name: string) => void }) {
  const { items, remove } = useFavoritesStore();
  if (!items.length) return (
    <ChatBubble sender="assistant" message="Your favorites" richContent={<div className="text-xs text-gray-600">No favorites yet</div>} />
  );
  return (
    <ChatBubble
      sender="assistant"
      message="Your favorites"
      richContent={(
        <div className="mt-1 flex flex-col gap-2">
          {items.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
              <span className="truncate max-w-[55%]">{b.name}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onSelect(b.id, b.name)} className="px-2 py-1 text-xs rounded bg-blue-600 text-white">Select</button>
                <button type="button" onClick={() => remove(b.id)} className="px-2 py-1 text-xs rounded border border-gray-300">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    />
  );
}
