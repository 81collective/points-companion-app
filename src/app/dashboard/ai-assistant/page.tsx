"use client";
import BusinessAssistant from '@/components/ai/BusinessAssistant';

export default function AiAssistantPage() {
  return (
    <div className="py-4 sm:py-6 max-w-3xl mx-auto w-full">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <BusinessAssistant />

        <ChatAssistant />
      </div>
    </div>
  );
}
