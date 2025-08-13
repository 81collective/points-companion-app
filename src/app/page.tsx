// src/app/page.tsx - Airbnb-inspired landing page with auth redirect
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Zap, TrendingUp, Loader2, MapPin } from 'lucide-react';
import HomepageBusinessDemo from '@/components/public/HomepageBusinessDemo';
import NaturalLanguageChat from '@/components/ai/NaturalLanguageChat';

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
      <div className="max-w-5xl w-full mx-auto py-6 md:py-10 space-y-8">
      {/* Hero Section */}
      <section className="rounded-2xl bg-gradient-to-b from-gray-900 to-gray-800 shadow-sm border border-gray-900 p-6 md:p-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-3">
          Maximize your
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-700"> credit card rewards</span>
        </h1>
        <p className="mt-2 text-base md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Smart AI recommendations help you earn more points, cashback, and travel rewards. Never miss out on the best card for each purchase again.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/auth')}
            className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Get started
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          <button
            onClick={() => router.push('/auth')}
            className="inline-flex items-center px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl border-2 border-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Learn more
          </button>
        </div>
      </section>

      {/* Interactive Demo Section */}
  <div className="rounded-2xl bg-gray-950 shadow-sm border border-gray-900 p-6 md:p-10">
        <HomepageBusinessDemo />
      </div>

      {/* AI Assistant Section */}
      <section className="rounded-2xl bg-gray-950 shadow-sm border border-gray-900 p-6 md:p-10">
        <NaturalLanguageChat />
      </section>

      {/* Features Section */}
  <section className="rounded-2xl bg-gray-950 shadow-sm border border-gray-900 p-8 md:p-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything you need to optimize rewards
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Powerful features designed to help you make the most of every purchase.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-900 to-gray-900 border border-blue-800">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Recommendations</h3>
            <p className="text-gray-300 leading-relaxed">
              Get instant suggestions for the best credit card to use for each purchase, maximizing your points and cashback.
            </p>
          </div>
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-blue-900 border border-blue-800">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Analytics</h3>
            <p className="text-gray-300 leading-relaxed">
              Track your spending patterns and discover opportunities to earn more rewards with detailed insights and reports.
            </p>
          </div>
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-blue-950 border border-blue-800">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-800 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Location-Based Recommendations</h3>
            <p className="text-gray-300 leading-relaxed">
              Discover nearby businesses and get instant credit card recommendations for each specific merchant to maximize your rewards.
            </p>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}