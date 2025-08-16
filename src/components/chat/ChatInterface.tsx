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
  const [messages, setMessages] = useState<Message[]>([initialMessage(mode)]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<string>('dining');

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
      <div className="flex-1 overflow-y-auto p-3 sm:p-4" ref={listRef}>
        {/* Location helper banner */}
        {!permissionState.granted && (
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

        <div className="space-y-3">
          {messages.map((m) => (
            <ChatBubble key={m.id} message={m.content} sender={m.role} timestamp={m.timestamp} />
          ))}
        </div>

        {/* Nearby quick picks */}
        {permissionState.granted && nearbyBusinesses && nearbyBusinesses.length > 0 && (
          <div className="mt-3">
            <ChatBubble
              sender="assistant"
              message="Nearby places — tap a category to tailor picks"
              richContent={(
                <div className="mt-1 flex flex-wrap gap-2">
                  {nearbyBusinesses.slice(0, 3).map((b) => (
                    <span key={b.id} className="px-2 py-1 text-xs rounded-full border border-gray-300 bg-white">
                      {b.name}
                    </span>
                  ))}
                </div>
              )}
            />
          </div>
        )}

        {/* Typing indicator while recommendations load */}
        {recLoading && (
          <div className="mt-3">
            <ChatBubble sender="assistant" message="" richContent={<TypingIndicator />} />
          </div>
        )}

        {/* Render recommendations as a horizontal scroll list */}
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
      </div>

      <div className="border-t bg-white p-3 sm:p-4">
        <div className="mb-2">
          <CategoryChips onSelect={(key: string) => {
            setCategory(key);
            send(`Show me best for ${key}`);
          }} />
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); setInput(''); }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'quick' ? 'Ask for a place or category…' : 'Share goals, spend, or ask a planning question…'}
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Send</button>
        </form>
      </div>
    </div>
  );
}
