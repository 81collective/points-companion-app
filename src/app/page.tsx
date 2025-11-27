// src/app/page.tsx - PointAdvisor landing page with chat-first hero
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCards } from '@/hooks/useUserCards';
import { ArrowRight, Sparkles, CreditCard, MessageCircle, Zap, Shield, Check } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';
import { StatChip } from '@/components/ui/stat-chip';

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Security', href: '#security' },
];

const EXAMPLE_PROMPTS = [
  "What card should I use at Costco?",
  "Best card for dining out tonight",
  "Which card has the best travel rewards?",
  "I'm booking a hotel, help me maximize points",
];

const FEATURES = [
  {
    icon: <MessageCircle className="h-5 w-5" />,
    title: 'Ask anything about your cards',
    description: 'Natural conversation about rewards, perks, and the best card for any situation.',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Instant recommendations',
    description: 'Get the optimal card for any merchant or category in seconds.',
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    title: '200+ cards supported',
    description: 'All major issuers including Chase, Amex, Capital One, Citi, and more.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Privacy first',
    description: 'We never store card numbers. Your data is encrypted and deletable anytime.',
  },
];

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
    <div className="min-h-screen bg-gradient-to-b from-[#faf8ff] via-white to-[#f5f0ff] text-neutral-900">
      {/* Frosted navigation */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 shadow-[0_10px_35px_rgba(92,63,189,0.08)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3 text-neutral-900">
            <Image src="/logo-sm.svg" alt="PointAdvisor" width={32} height={32} priority className="drop-shadow-[0_8px_25px_rgba(111,71,255,0.35)]" />
            <span className="font-display text-lg tracking-tight">PointAdvisor</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-600 md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="transition hover:text-neutral-900">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/auth')}
              className="hidden rounded-full border border-neutral-200 bg-white/70 px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-brand-200 hover:text-brand-700 md:inline-flex"
            >
              Sign in
            </button>
            <button
              onClick={() => router.push('/auth')}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(94,55,187,0.35)] transition hover:-translate-y-0.5"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - Chat First */}
        <section className="relative overflow-hidden pb-12 pt-8 lg:pb-20 lg:pt-12">
          {/* Background effects */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-brand-200/30 blur-[120px]" />
            <div className="absolute right-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-rose-200/20 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-6">
            {/* Headline */}
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                AI-powered credit card advisor
              </div>
              
              <h1 className="font-display text-4xl leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                Just ask which card to use.
              </h1>
              
              <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 lg:text-xl">
                PointAdvisor is your AI assistant for maximizing credit card rewards. 
                Ask a question, get the best card for any purchase instantly.
              </p>
            </div>

            {/* Main Chat Interface - Hero Element */}
            <div className="relative mx-auto mt-10 max-w-3xl">
              {/* Decorative glow behind chat */}
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-brand-300/50 via-brand-200/30 to-rose-200/40 blur-2xl" aria-hidden />
              
              {/* Chat container */}
              <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_40px_100px_rgba(82,47,174,0.2)]">
                {/* Chat header */}
                <div className="flex items-center justify-between border-b border-neutral-100 bg-gradient-to-r from-brand-50 to-white px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">PointAdvisor</h3>
                      <p className="text-xs text-neutral-500">Your AI rewards assistant</p>
                    </div>
                  </div>
                  <StatChip label="Try it free" tone="highlight" size="sm" />
                </div>
                
                {/* Chat interface */}
                <div className="h-[420px] lg:h-[480px]">
                  <ChatInterface
                    mode="quick"
                    isAuthenticated={Boolean(user)}
                    userCards={cards}
                    persistUiState={false}
                  />
                </div>
              </div>
              
              {/* Example prompts */}
              <div className="mt-6 text-center">
                <p className="mb-3 text-sm font-medium text-neutral-500">Try asking:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {EXAMPLE_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600 shadow-sm transition hover:border-brand-300 hover:text-brand-700"
                    >
                      &ldquo;{prompt}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Works with 200+ cards</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Free forever for personal use</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Simple 3 steps */}
        <section id="how-it-works" className="border-y border-neutral-100 bg-white py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-12 text-center">
              <h2 className="font-display text-3xl text-neutral-900">How it works</h2>
              <p className="mt-3 text-neutral-600">Start maximizing rewards in under a minute.</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
                  <span className="font-display text-xl font-bold">1</span>
                </div>
                <h3 className="font-semibold text-neutral-900">Add your cards</h3>
                <p className="mt-2 text-sm text-neutral-600">Tell us which credit cards you have. We only store rewards info, never card numbers.</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
                  <span className="font-display text-xl font-bold">2</span>
                </div>
                <h3 className="font-semibold text-neutral-900">Ask a question</h3>
                <p className="mt-2 text-sm text-neutral-600">Type where you&apos;re shopping or what you&apos;re buying. Our AI understands natural language.</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
                  <span className="font-display text-xl font-bold">3</span>
                </div>
                <h3 className="font-semibold text-neutral-900">Use the best card</h3>
                <p className="mt-2 text-sm text-neutral-600">Get instant recommendations with exact rewards you&apos;ll earn. No more guessing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section id="features" className="bg-gradient-to-b from-white to-[#faf8ff] py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-12 text-center">
              <h2 className="font-display text-3xl text-neutral-900">Why PointAdvisor?</h2>
              <p className="mt-3 text-neutral-600">The smarter way to use your credit cards.</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-neutral-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security / Trust */}
        <section id="security" className="border-t border-neutral-100 bg-white py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <Shield className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="font-display text-3xl text-neutral-900">Your data is safe with us</h2>
            <p className="mt-4 text-neutral-600">
              We take security seriously. PointAdvisor never stores your actual card numbers—only the rewards 
              structure and categories. All connections use bank-level encryption, and you can delete your 
              data anytime with one click.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600">
                <Check className="h-4 w-4 text-emerald-500" />
                No card numbers stored
              </div>
              <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600">
                <Check className="h-4 w-4 text-emerald-500" />
                Bank-level encryption
              </div>
              <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600">
                <Check className="h-4 w-4 text-emerald-500" />
                Delete anytime
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 py-20 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_45%)]" aria-hidden />
          <div className="relative mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-display text-3xl sm:text-4xl">
              Ready to maximize your rewards?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Join thousands of cardholders earning more on every purchase. It&apos;s free to get started.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => router.push('/auth')}
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-base font-semibold text-brand-600 shadow-[0_20px_45px_rgba(10,12,25,0.4)] transition hover:-translate-y-0.5"
              >
                Get started free
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-sm text-white/60">No credit card required • Free forever for personal use</p>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-100 bg-white text-neutral-500">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <Image src="/logo-sm.svg" alt="" width={24} height={24} className="opacity-90" />
              <span className="font-medium text-neutral-800">PointAdvisor</span>
            </div>
            <div className="flex gap-8 text-sm">
              <a href="#" className="transition-colors hover:text-neutral-900">Privacy</a>
              <a href="#" className="transition-colors hover:text-neutral-900">Terms</a>
              <a href="#" className="transition-colors hover:text-neutral-900">Contact</a>
              <a href="#" className="transition-colors hover:text-neutral-900">Blog</a>
            </div>
            <div className="text-sm text-neutral-500">
              © 2025 PointAdvisor. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}