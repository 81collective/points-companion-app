"use client";
import ChatAssistant from '@/components/ai/ChatAssistant';

export default function AiAssistantPage() {
  return (
    <div className="page-container py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">AI Assistant</h1>
      <div className="surface p-4 surface-hover">
        <ChatAssistant />
      </div>
    </div>
  );
}
