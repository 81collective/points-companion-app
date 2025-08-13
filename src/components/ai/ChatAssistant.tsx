"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { UserCard, DetectedBusiness } from '@/types/ai-assistant';

type Sender = 'user' | 'assistant';
interface Message {
  id: string;
  content: string;
  sender: Sender;
  timestamp: Date;
  suggestions?: string[];
}

interface ChatContext {
  mode: 'quick' | 'planning';
  userLocation?: { lat: number; lng: number } | null;
  userCards?: UserCard[];
  isAuthenticated: boolean;
  businessContext?: DetectedBusiness | null;
  conversationHistory?: Message[];
}

export default function ChatAssistant({
  mode = 'quick',
  userLocation = null,
  userCards = [],
  isAuthenticated = false,
  businessContext = null,
}: Partial<Omit<ChatContext, 'conversationHistory'>>) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chat_assistant_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed)) setMessages(parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch {/* ignore */}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chat_assistant_history', JSON.stringify(messages));
  }, [messages]);

  const recentHistory = useMemo(() => messages.slice(-5), [messages]);

  const handleSendMessage = async (content?: string) => {
    const text = (content ?? inputValue).trim();
    if (!text) return;

    const userMessage: Message = {
      id: String(Date.now()),
      content: text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            mode,
            userLocation,
            userCards,
            isAuthenticated,
            businessContext,
            conversationHistory: recentHistory,
          },
        }),
      });
      if (!res.ok) throw new Error('Failed to get AI response');
      const data: { content: string; suggestions?: string[] } = await res.json();
      const assistantMessage: Message = {
        id: String(Date.now() + 1),
        content: data.content,
        sender: 'assistant',
        timestamp: new Date(),
        suggestions: data.suggestions,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      console.error('Chat error:', e);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Voice input via Web Speech API (best-effort)
  type RecognitionTranscript = { transcript: string };
  type RecognitionResult = ArrayLike<RecognitionTranscript>;
  type RecognitionResults = ArrayLike<RecognitionResult>;
  type WebSpeechRecognition = {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    onresult: (e: { results: RecognitionResults }) => void;
    onerror: (ev: unknown) => void;
    start: () => void;
  };
  type SpeechRecognitionConstructor = new () => WebSpeechRecognition;

  const handleVoiceInput = () => {
    const ctor = (window as unknown as {
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
      SpeechRecognition?: SpeechRecognitionConstructor;
    }).webkitSpeechRecognition || (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition;
    if (!ctor) {
      setError('Voice input is not supported in this browser.');
      return;
    }
    const rec = new ctor();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      handleSendMessage(transcript);
    };
    rec.onerror = () => setError('Voice input error.');
    rec.start();
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">AI Chat Assistant</h2>

      <div className="mb-2 flex flex-wrap gap-2">
        {['Best dining card', 'Plan Europe trip', 'Optimize my wallet', 'Nearby bonuses'].map((q) => (
          <button key={q} onClick={() => handleSendMessage(q)} className="text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200">
            {q}
          </button>
        ))}
      </div>

      <div className="mb-4 space-y-2 max-h-80 overflow-y-auto">
        {messages.map((m) => (
          <div key={m.id} className={`p-2 rounded ${m.sender === 'user' ? 'bg-blue-50 text-right' : 'bg-gray-100 text-left'}`}>
            <div className="text-[10px] text-gray-500">{m.timestamp.toLocaleTimeString()}</div>
            <div>{m.content}</div>
            {m.suggestions && m.suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1 justify-start">
                {m.suggestions.map((s, i) => (
                  <button key={i} onClick={() => handleSendMessage(s)} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 hover:bg-gray-300">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          className="border rounded px-2 py-1 flex-1"
          placeholder="Ask about cards, rewards, or travel planning..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
          disabled={isLoading}
        />
        <button className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50" onClick={() => handleSendMessage()} disabled={isLoading}>
          {isLoading ? 'Thinking…' : 'Send'}
        </button>
        <button className="px-3 py-1 bg-gray-300 rounded" onClick={handleVoiceInput}>
          🎤
        </button>
      </div>
    </div>
  );
}
