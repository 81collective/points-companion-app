'use client';
import React from 'react';

export function ConversationDisplay({ messages }: { messages: { role: 'user' | 'assistant'; content: string; id: string }[] }) {
  return (
    <div className="space-y-3">
      {messages.map(m => (
        <div key={m.id} className={`p-3 rounded-lg border ${m.role === 'assistant' ? 'bg-gray-50 border-gray-200' : 'bg-blue-600 text-white border-blue-600'}`}>
          <p className="text-sm whitespace-pre-wrap">{m.content}</p>
        </div>
      ))}
    </div>
  );
}
