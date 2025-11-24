"use client";
import React from 'react';
import { ChatInterface } from '@/components/chat';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCards } from '@/hooks/useUserCards';

export default function AIPage() {
  const { user } = useAuth();
  const { cards } = useUserCards();
  return (
    <div className="py-4 sm:py-6 max-w-3xl mx-auto w-full">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <ChatInterface mode="quick" isAuthenticated={!!user} userCards={cards} />
      </div>
    </div>
  );
}
