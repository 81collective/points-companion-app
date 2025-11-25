// src/app/page.tsx - PointAdvisor landing page with chat redirect
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCards } from '@/hooks/useUserCards';
import { ArrowRight, Loader2, Sparkles, CreditCard, MapPin } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';
import DealOfTheDay from '@/components/public/DealOfTheDay';
import NearbyExplorer from '@/components/home/NearbyExplorer';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { cards } = useUserCards();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="spinner" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Clean minimal header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5 font-semibold text-neutral-900">
            <Image src="/logo-sm.svg" alt="PointAdvisor" width={32} height={32} className="rounded-lg" priority />
            <span className="hidden sm:inline">PointAdvisor</span>
          </div>
          <button
            onClick={() => router.push('/auth')}
            className="btn btn-primary"
          >
            Get Started
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Hero Section - Clean and Focused */}
        <section className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-600 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Recommendations
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight leading-[1.1] mb-6">
            Maximize every
            <span className="text-brand-500"> purchase</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto mb-10">
            Smart AI tells you exactly which card to use for maximum rewards. 
            Never leave points on the table again.
          </p>

          {/* Chat Interface - The Hero */}
          <div className="surface-elevated overflow-hidden">
            <div className="h-[480px] sm:h-[520px]">
              <ChatInterface
                mode="quick"
                isAuthenticated={Boolean(user)}
                userCards={cards}
                persistUiState={false}
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/auth')}
              className="btn btn-primary btn-lg"
            >
              Start for free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/auth')}
              className="btn btn-secondary btn-lg"
            >
              Learn more
            </button>
          </div>
        </section>

        {/* Features Grid - Minimal */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="card">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
              <CreditCard className="w-5 h-5 text-brand-500" />
            </div>
            <h3 className="text-h4 text-neutral-900 mb-2">Smart Card Matching</h3>
            <p className="text-body-sm text-neutral-600">
              AI analyzes your cards and spending to recommend the best card for every purchase.
            </p>
          </div>
          
          <div className="card">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-h4 text-neutral-900 mb-2">Bonus Tracking</h3>
            <p className="text-body-sm text-neutral-600">
              Never miss a welcome bonus or category promotion with real-time tracking.
            </p>
          </div>
          
          <div className="card">
            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5 text-violet-500" />
            </div>
            <h3 className="text-h4 text-neutral-900 mb-2">Location Aware</h3>
            <p className="text-body-sm text-neutral-600">
              Get instant recommendations when you arrive at restaurants, stores, and more.
            </p>
          </div>
        </section>

        {/* Deal of the Day */}
        <section>
          <DealOfTheDay />
        </section>

        {/* Nearby Businesses Explorer */}
        <section>
          <NearbyExplorer />
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-neutral-500 text-sm">
            <Image src="/logo-sm.svg" alt="" width={20} height={20} className="opacity-50" />
            <span>© 2025 PointAdvisor</span>
          </div>
          <div className="flex gap-6 text-sm text-neutral-500">
            <a href="#" className="hover:text-neutral-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}