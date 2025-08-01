import React, { useState, useRef } from 'react';
import { OpenAI } from 'openai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function ChatAssistant({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function sendMessage() {
    if (!input.trim()) return;
    setLoading(true);
    const newMessage: Message = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      messages: [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: input }
      ],
      model: 'gpt-4',
    });
    const aiReply = completion.choices[0].message.content ?? '';
    setMessages(prev => [...prev, { role: 'assistant', content: aiReply, timestamp: Date.now() }]);
    setLoading(false);
  }

  function handleVoiceInput() {
    // Placeholder for voice input integration
    if (inputRef.current) inputRef.current.value = 'Voice input not implemented';
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">AI Chat Assistant</h2>
      <div className="mb-4 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`p-2 rounded ${m.role === 'user' ? 'bg-blue-50 text-right' : 'bg-gray-100 text-left'}`}>
            <span className="text-xs text-gray-500 mr-2">{new Date(m.timestamp).toLocaleTimeString()}</span>
            {m.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          className="border rounded px-2 py-1 flex-1"
          placeholder="Ask about cards, rewards, or financial decisions..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button className="px-3 py-1 bg-primary text-white rounded" onClick={sendMessage} disabled={loading}>
          Send
        </button>
        <button className="px-3 py-1 bg-gray-300 rounded" onClick={handleVoiceInput}>
          🎤
        </button>
      </div>
    </div>
  );
}
