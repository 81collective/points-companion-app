// src/app/page.tsx - PointAdvisor landing page with chat redirect
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCards } from '@/hooks/useUserCards';
import { ArrowRight, Sparkles, CreditCard, MapPin, TrendingUp, Shield } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';
import DealOfTheDay from '@/components/public/DealOfTheDay';
import NearbyExplorer from '@/components/home/NearbyExplorer';

// Demo scenarios to show product value
const DEMO_SCENARIOS = [
  { query: "I'm at Whole Foods buying groceries", card: "Amex Gold", reward: "4x points", savings: "$4.80" },
  { query: "Filling up gas at Costco", card: "Costco Visa", reward: "4% cashback", savings: "$2.40" },
  { query: "Booking a flight on United", card: "Chase Sapphire", reward: "5x points", savings: "$25" },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const { cards } = useUserCards();
  const router = useRouter();
  const [activeDemo, setActiveDemo] = useState(0);

  // Rotate demo scenarios
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % DEMO_SCENARIOS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

  const demo = DEMO_SCENARIOS[activeDemo];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Clean minimal header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5 font-semibold text-neutral-900">
            <Image src="/logo-sm.svg" alt="PointAdvisor" width={32} height={32} priority />
            <span className="hidden sm:inline">PointAdvisor</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/auth')}
              className="btn btn-ghost hidden sm:flex"
            >
              Sign in
            </button>
            <button
              onClick={() => router.push('/auth')}
              className="btn btn-primary"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - Value-First Design */}
        <section className="bg-gradient-to-b from-white to-neutral-50 border-b border-neutral-100">
          <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Messaging */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6">
                  <TrendingUp className="w-4 h-4" />
                  Users save $480/year on average
                </div>
                
                <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight leading-[1.1] mb-6">
                  Stop leaving money
                  <span className="text-brand-500"> on the table</span>
                </h1>
                
                <p className="text-lg text-neutral-600 leading-relaxed mb-8">
                  AI instantly tells you the <strong>best card to use</strong> at every store. 
                  Just ask &ldquo;Which card should I use?&rdquo; and watch your rewards multiply.
                </p>

                {/* Live Demo Preview */}
                <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-8 shadow-sm">
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">Live Example</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">👤</span>
                      </div>
                      <div className="bg-neutral-100 rounded-2xl rounded-tl-md px-4 py-2.5 text-sm text-neutral-700">
                        {demo.query}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-brand-50 rounded-2xl rounded-tl-md px-4 py-2.5 text-sm text-brand-900">
                        Use your <strong>{demo.card}</strong> for <strong>{demo.reward}</strong>. 
                        <span className="text-emerald-600 font-medium"> Save {demo.savings}!</span>
                      </div>
                    </div>
                  </div>
                  {/* Progress dots */}
                  <div className="flex justify-center gap-1.5 mt-4">
                    {DEMO_SCENARIOS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveDemo(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === activeDemo ? 'bg-brand-500 w-4' : 'bg-neutral-300'}`}
                        aria-label={`Demo ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push('/auth')}
                    className="btn btn-primary btn-lg"
                  >
                    Start Saving Now
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="text-sm text-neutral-500 self-center">
                    Free forever • No credit card required
                  </p>
                </div>

                {/* Trust Signals */}
                <div className="flex items-center gap-6 mt-8 pt-8 border-t border-neutral-200">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-neutral-600">
                    <span className="font-semibold text-neutral-900">2,400+</span> users optimizing rewards
                  </div>
                </div>
              </div>

              {/* Right: Product Screenshot / Chat Interface */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/20 to-violet-500/20 rounded-3xl blur-2xl opacity-40" />
                <div className="relative surface-elevated overflow-hidden rounded-2xl">
                  <div className="h-[480px]">
                    <ChatInterface
                      mode="quick"
                      isAuthenticated={Boolean(user)}
                      userCards={cards}
                      persistUiState={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="bg-white border-b border-neutral-100 py-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-900">$1.2M+</div>
                <div className="text-sm text-neutral-500">Rewards optimized</div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-neutral-200" />
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-900">50+</div>
                <div className="text-sm text-neutral-500">Card issuers supported</div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-neutral-200" />
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-900">4.9★</div>
                <div className="text-sm text-neutral-500">User satisfaction</div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-neutral-200" />
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">Free</div>
                <div className="text-sm text-neutral-500">No hidden fees</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - 3 Steps */}
        <section className="py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">How it works</h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Get personalized card recommendations in under 60 seconds
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-brand-600">1</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Add your cards</h3>
                <p className="text-neutral-600">Tell us which credit cards are in your wallet. Takes 30 seconds.</p>
              </div>
              
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-emerald-600">2</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Ask anything</h3>
                <p className="text-neutral-600">&ldquo;Which card for Amazon?&rdquo; &ldquo;Best gas card?&rdquo; — just ask naturally.</p>
              </div>
              
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-violet-600">3</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Maximize rewards</h3>
                <p className="text-neutral-600">Get instant answers. Use the right card. Earn more every time.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features with Benefits */}
        <section className="bg-white py-16 lg:py-20 border-y border-neutral-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-6">
                  Every feature designed to save you money
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">Smart Card Matching</h3>
                      <p className="text-neutral-600 text-sm">AI analyzes 200+ cards and matches your spending patterns to maximize returns. Average user earns 2.3x more rewards.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">Bonus & Promo Alerts</h3>
                      <p className="text-neutral-600 text-sm">Never miss limited-time offers, rotating categories, or welcome bonuses worth $500+.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">Location-Aware Recommendations</h3>
                      <p className="text-neutral-600 text-sm">Get instant card suggestions when you arrive at a store. Works at 1M+ locations.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">Bank-Level Security</h3>
                      <p className="text-neutral-600 text-sm">We never see your card numbers. Read-only connection with 256-bit encryption.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deal of the Day */}
              <div>
                <DealOfTheDay />
              </div>
            </div>
          </div>
        </section>

        {/* Nearby Businesses Explorer */}
        <section className="py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">Try it now</h2>
              <p className="text-lg text-neutral-600">
                See which cards earn the most at businesses near you
              </p>
            </div>
            <NearbyExplorer />
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-br from-brand-600 to-brand-700 py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to stop leaving money behind?
            </h2>
            <p className="text-lg text-brand-100 mb-8">
              Join thousands of smart spenders maximizing every purchase.
            </p>
            <button
              onClick={() => router.push('/auth')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-brand-200 text-sm mt-4">
              No credit card required • Setup in 60 seconds
            </p>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="bg-neutral-900 text-neutral-400">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <Image src="/logo-sm.svg" alt="" width={24} height={24} className="opacity-70" />
              <span className="text-neutral-300 font-medium">PointAdvisor</span>
            </div>
            <div className="flex gap-8 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Blog</a>
            </div>
            <div className="text-sm">
              © 2025 PointAdvisor. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}