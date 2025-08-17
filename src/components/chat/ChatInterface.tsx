"use client";
import React, { useRef, useState } from 'react';
import ChatBubble from './ChatBubble';
import CategoryChips from './CategoryChips';
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

export interface ChatInterfaceProps {
  mode: 'quick' | 'planning';
  isAuthenticated: boolean;
  userCards?: UserCard[];
}

const initialMessage = (mode: 'quick' | 'planning'): Message => ({
  id: 'intro',
  role: 'assistant',
  content: mode === 'quick'
    ? "I'm ready to help pick the best card for where you are. Tell me the place or pick a category."
    : 'Planning mode designs a winning card strategy for your bigger goals. Share your goals and spend to begin.',
  timestamp: Date.now(),
});

export default function ChatInterface({ mode, isAuthenticated: _isAuthenticated, userCards: _userCards }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [, setMessages] = useState<Message[]>([initialMessage(mode)]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<string>('dining');
  const [activeTab, setActiveTab] = useState<'quick' | 'planning'>(mode);
  const [showAllNearby, setShowAllNearby] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | undefined>();

  // Persist tab & category
  React.useEffect(() => {
    try { localStorage.setItem('chat.activeTab', activeTab); } catch {}
  }, [activeTab]);
  React.useEffect(() => {
    try { localStorage.setItem('chat.category', category); } catch {}
  }, [category]);
  React.useEffect(() => {
    try {
      const t = localStorage.getItem('chat.activeTab');
      const c = localStorage.getItem('chat.category');
      if (t === 'quick' || t === 'planning') setActiveTab(t);
      if (c) setCategory(c);
    } catch {}
    // run once on mount only
     
  }, []);

  // Location and data hooks
  const { location, permissionState, requestLocation } = useLocation();
  const { businesses: nearbyBusinesses } = useNearbyBusinesses({
    latitude: location?.latitude,
    longitude: location?.longitude,
    category,
    radius: 5000,
    enabled: permissionState.granted && !!location,
  });
  const { recommendations, loading: recLoading } = useCardRecommendations({
    category,
    latitude: location?.latitude,
    longitude: location?.longitude,
  businessId: selectedBusinessId,
  enabled: !!category,
  });

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: `${Date.now()}`,'role':'user', content: text.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    // Simulated assistant response placeholder
    const reply: Message = { id: `${Date.now()}-a`, role: 'assistant', content: 'Let me think about that…', timestamp: Date.now() };
    setMessages(prev => [...prev, reply]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b">
        <Tabs value={activeTab} onValueChange={(v)=>setActiveTab(v as 'quick'|'planning')} className="px-3 sm:px-4 pt-2">
          <TabsList className="bg-transparent">
            <TabsTrigger value="quick">Quick</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 overflow-y-auto p-3 sm:p-4" ref={listRef}>
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
                      {(showAllNearby ? nearbyBusinesses : nearbyBusinesses.slice(0, 3)).map((b) => (
                        <NearbyRow key={b.id} id={b.id} name={b.name} onSelect={() => setSelectedBusinessId(b.id)} />
                      ))}
                      {nearbyBusinesses.length > 3 && (
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
                <FavoritesList onSelect={(id) => { setSelectedBusinessId(id); setActiveTab('planning'); }} />
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
            <div className="mb-2">
              {/* All category chips moved to Planning */}
              <CategoryChips onSelect={(key: string) => {
                setCategory(key);
                send(`Show me best for ${key}`);
              }} />
            </div>

            {/* Recommendations carousel in Planning */}
            {recLoading && (
              <div className="mt-3">
                <ChatBubble sender="assistant" message="" richContent={<TypingIndicator />} />
              </div>
            )}
            {recommendations && recommendations.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <div className="flex gap-3 pr-2">
                  {recommendations.slice(0, 5).map((rec, idx) => (
                    <div key={idx} className="min-w-[260px] max-w-[320px]">
                      <BusinessCardInChat
                        business={{ name: rec?.business?.name || 'Nearby place', distance: rec?.business?.distance }}
                        recommendedCard={{ name: rec.card.card_name }}
                        rewards={{ text: `${rec.estimated_points} pts (~$${Math.round(rec.annual_value / 12)})` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

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

function NearbyRow({ id, name, onSelect }: { id: string; name: string; onSelect: () => void }) {
  const { add, remove, has } = useFavoritesStore();
  const fav = has(id);
  return (
    <div className="flex items-center justify-between rounded-md border p-2 text-sm">
      <span className="truncate max-w-[55%]">{name}</span>
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

function FavoritesList({ onSelect }: { onSelect: (id: string) => void }) {
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
                <button type="button" onClick={() => onSelect(b.id)} className="px-2 py-1 text-xs rounded bg-blue-600 text-white">Select</button>
                <button type="button" onClick={() => remove(b.id)} className="px-2 py-1 text-xs rounded border border-gray-300">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    />
  );
}
