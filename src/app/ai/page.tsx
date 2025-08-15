'use client';
import React from 'react';
import BusinessAssistant from '@/components/ai/BusinessAssistant';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import TextLogo from '@/components/branding/TextLogo';
import { User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AIPage() {
  const { user } = useAuth();
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0b1220] text-white flex flex-col">
        {/* Minimal header: logo + profile */}
        <header className="sticky top-0 z-40 bg-black/60 backdrop-blur border-b border-white/10">
          <div className="h-14 max-w-5xl mx-auto w-full flex items-center justify-between px-4">
            <Link href="/" className="flex items-center">
              <TextLogo className="text-xl sm:text-2xl" compact />
            </Link>
            {user ? (
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white">
                <User className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <Link href="/auth" className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white">
                <User className="w-4 h-4" /> Sign in
              </Link>
            )}
          </div>
        </header>
        {/* Chat-first content */}
        <main className="flex-1">
          <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="rounded-xl overflow-hidden border border-white/10 bg-white">
              <BusinessAssistant />
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
