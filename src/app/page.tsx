// src/app/page.tsx - Airbnb-inspired landing page with auth redirect
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Loader2 } from 'lucide-react';
import BusinessAssistant from '@/components/ai/BusinessAssistant';
import DealOfTheDay from '@/components/public/DealOfTheDay';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      );
    } else if (user) {
      return null; // Will redirect to dashboard
  }

  return (
    <>
      {/* Minimal header for guests */}
      <header className="w-full border-b border-gray-800 bg-black/90 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-semibold text-white text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-700 to-gray-900 flex items-center justify-center text-white text-base font-bold">PC</div>
            <span className="hidden sm:inline">Points Companion</span>
          </div>
          <button
            onClick={() => router.push('/auth')}
            className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition"
          >
            Sign in / Sign up
          </button>
        </div>
      </header>
      <div className="w-full mx-auto md:max-w-5xl px-4 md:px-0 py-6 md:py-10 space-y-8">
      {/* Combined Hero + Assistant */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 shadow-sm border border-gray-900 p-4 sm:p-6 md:p-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-3">
          Maximize your
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-700"> credit card rewards</span>
        </h1>
        <p className="mt-2 text-base md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Smart AI recommendations help you earn more points, cashback, and travel rewards. Never miss out on the best card for each purchase again.
        </p>
        <div className="mt-6">
          <BusinessAssistant />
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/auth')}
            className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Sign up
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          <button
            onClick={() => router.push('/auth')}
            className="inline-flex items-center px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-medium border-2 border-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Learn more
          </button>
        </div>
      </section>

      {/* Deal of the Day replaces the features grid */}
      <section className="bg-gray-950 shadow-sm border border-gray-900 p-4 md:p-6">
        <DealOfTheDay />
      </section>
      </div>
    </>
  );
}