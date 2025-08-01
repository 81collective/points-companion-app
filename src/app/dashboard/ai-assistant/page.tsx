"use client";
import React, { useState } from 'react';
import ChatAssistant from '@/components/ai/ChatAssistant';

export default function AiAssistantPage() {
  const [userId] = useState('demo-user'); // Replace with real user context
  // Placeholder for saved conversation history and quick actions
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>
        <ChatAssistant userId={userId} />
        {/* Saved history, quick actions, shortcuts, voice input UI can be added here */}
      </main>
    </div>
  );
}
