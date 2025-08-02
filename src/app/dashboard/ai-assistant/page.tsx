"use client";
import React from 'react';
import ChatAssistant from '@/components/ai/ChatAssistant';

export default function AiAssistantPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>
        <ChatAssistant />
        {/* Conversation history and quick actions will be added in future updates */}
      </main>
    </div>
  );
}
