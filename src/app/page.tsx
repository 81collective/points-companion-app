// src/app/page.tsx - PointAdvisor landing page with chat redirect
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCards } from '@/hooks/useUserCards';
import { ArrowRight, Sparkles, CreditCard, MapPin, TrendingUp, Shield, Zap } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';
import DealOfTheDay from '@/components/public/DealOfTheDay';
import NearbyExplorer from '@/components/home/NearbyExplorer';
import { FeatureCard } from '@/components/ui/feature-card';
import { MetricCard } from '@/components/ui/metric-card';
import { StatChip } from '@/components/ui/stat-chip';

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Security', href: '#security' },
  { label: 'Pricing', href: '#cta' },
];

const PROOF_STATS = [
  {
    label: 'Rewards earned',
    value: '$4.2M+',
    subtext: 'By our users this year',
    chips: [{ label: '50K+ users', tone: 'neutral' as const }],
  },
  {
    label: 'Avg. savings per user',
    value: '$840',
    subtext: 'Extra rewards annually',
    chips: [{ label: '+32% vs before', tone: 'positive' as const }],
  },
  {
    label: 'Cards supported',
    value: '200+',
    subtext: 'All major issuers covered',
    chips: [{ label: 'Updated weekly', tone: 'highlight' as const }],
  },
];

const HOW_IT_WORKS = [
  {
    id: '01',
    title: 'Add your credit cards',
    description: 'Securely add your cards in seconds. We never store card numbers—just the rewards info.',
    accent: 'sky' as const,
  },
  {
    id: '02',
    title: 'Shop or plan a trip',
    description: 'At checkout or planning travel, PointAdvisor tells you which card earns the most.',
    accent: 'mint' as const,
  },
  {
    id: '03',
    title: 'Maximize every purchase',
    description: 'Earn more points, miles, and cashback without thinking. We do the math for you.',
    accent: 'rose' as const,
  },
];

const FEATURE_HIGHLIGHTS = [
  {
    title: 'Best card for every store',
    description: 'AI analyzes your cards against each merchant category to maximize your rewards.',
    icon: <CreditCard className="h-5 w-5" />,
    accent: 'sky' as const,
    footer: '200+ cards supported',
  },
  {
    title: 'Location-aware suggestions',
    description: 'Get instant recommendations when you arrive at a store or restaurant.',
    icon: <MapPin className="h-5 w-5" />,
    accent: 'amber' as const,
    footer: '1M+ merchants mapped',
  },
  {
    title: 'Travel rewards optimizer',
    description: 'Plan trips with the right cards for flights, hotels, and dining abroad.',
    icon: <Shield className="h-5 w-5" />,
    accent: 'mint' as const,
    footer: 'Airline & hotel perks',
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
    <div className="min-h-screen text-neutral-900" style={{ background: 'var(--gradient-hero)' }}>
      {/* Frosted navigation */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 shadow-[0_10px_35px_rgba(92,63,189,0.1)] backdrop-blur-xl">
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
              Launch app
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - Synthflow aesthetic */}
        <section className="relative isolate overflow-hidden border-b border-white/60 text-neutral-900">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-[#f3ebff]/90 to-white" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(138,99,255,0.25),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(242,158,234,0.2),transparent_55%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.6)_0%,transparent_60%)]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24">
            <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_1.1fr]">
              {/* Messaging */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3">
                  <StatChip
                    size="md"
                    tone="highlight"
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Smart rewards optimizer"
                  />
                </div>

                <div className="space-y-6">
                  <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl">
                    Know which card to use, every time you pay.
                  </h1>
                  <p className="text-lg text-neutral-600">
                    PointAdvisor tells you the best credit card for every purchase—whether you&apos;re grabbing coffee
                    or booking a flight. Maximize rewards, never miss a perk.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <StatChip
                    size="md"
                    tone="positive"
                    icon={<CreditCard className="h-4 w-4" />}
                    label="200+ cards supported"
                  />
                  <StatChip
                    size="md"
                    tone="neutral"
                    icon={<MapPin className="h-4 w-4" />}
                    label="Location-aware"
                  />
                  <StatChip
                    size="md"
                    tone="highlight"
                    icon={<Sparkles className="h-4 w-4" />}
                    label="AI-powered"
                  />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <button
                    onClick={() => router.push('/auth')}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-3 text-base font-semibold text-white shadow-[0_25px_45px_rgba(83,46,177,0.35)] transition hover:-translate-y-0.5"
                  >
                    Get started free
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => router.push('/auth')}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-6 py-3 text-base font-semibold text-neutral-800 transition hover:border-brand-200 hover:text-brand-700"
                  >
                    See how it works
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-6 border-t border-white/70 pt-6 text-sm text-neutral-600">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white text-sm font-semibold text-brand-600 shadow-[0_8px_18px_rgba(88,59,187,0.15)]"
                      >
                        {String.fromCharCode(64 + i)}
                      </span>
                    ))}
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-900">50,000+</span> cardholders maximizing rewards
                  </div>
                </div>
              </div>

              {/* Interactive stack */}
              <div className="relative">
                <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-r from-brand-200/70 via-white/70 to-rose-100/70 blur-3xl" aria-hidden />

                <div className="relative grid gap-6 rounded-[2.25rem] border border-white/80 bg-white/95 p-6 shadow-[0_35px_95px_rgba(82,47,174,0.25)] backdrop-blur-2xl">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <MetricCard
                      label="Rewards earned this year"
                      value="$2,340"
                      delta={{ value: '+24%', trend: 'up', label: 'vs last year' }}
                      subtext="Across all your cards"
                      icon={<CreditCard className="h-4 w-4" />}
                      chips={[{ label: '8 cards tracked', tone: 'neutral' as const }]}
                    />
                    <MetricCard
                      label="Missed rewards saved"
                      value="$187"
                      delta={{ value: '↓ 92%', trend: 'down', label: 'Wrong card use' }}
                      subtext="Smart alerts saved you money"
                      icon={<Shield className="h-4 w-4" />}
                      chips={[{ label: 'This month', tone: 'highlight' as const }]}
                    />
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white p-4 shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-transparent to-transparent" aria-hidden />
                    <div className="relative h-[320px] rounded-xl border border-neutral-100 bg-neutral-50/80 p-3">
                      <ChatInterface
                        mode="quick"
                        isAuthenticated={Boolean(user)}
                        userCards={cards}
                        persistUiState={false}
                      />
                    </div>
                  </div>

                  <FeatureCard
                    title="Smart card recommendations"
                    description="PointAdvisor knows your location and purchase category to suggest the best card instantly."
                    icon={<Zap className="h-5 w-5" />}
                    accent="sky"
                    stat={<p className="text-sm text-neutral-500">Works at any store</p>}
                    footer={
                      <div className="flex w-full items-center justify-between text-neutral-600">
                        <span className="text-xs uppercase tracking-[0.3em]">Location aware</span>
                        <span className="text-sm font-semibold text-neutral-900">1M+ merchants mapped</span>
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section id="platform" className="border-b border-neutral-100 bg-transparent py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-6 md:grid-cols-3">
              {PROOF_STATS.map((stat) => (
                <MetricCard key={stat.label} {...stat} />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - 3 Steps */}
        <section id="how-it-works" className="bg-white py-20 text-neutral-900">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <StatChip size="md" tone="highlight" label="How it works" />
              <h2 className="mt-4 font-display text-3xl text-neutral-900">Start earning more in 3 simple steps</h2>
              <p className="mt-3 text-neutral-600">Set up in minutes, see results on your next purchase.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {HOW_IT_WORKS.map((step) => (
                <FeatureCard
                  key={step.id}
                  title={step.title}
                  description={step.description}
                  accent={step.accent}
                  icon={<span className="font-display text-lg font-semibold">{step.id}</span>}
                  badge={`Step ${step.id}`}
                  footer={<span className="text-sm text-neutral-600">Takes <strong>2 minutes</strong></span>}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Feature highlights + trust */}
        <section id="security" className="border-y border-neutral-100 bg-gradient-to-b from-white via-[#f7f1ff] to-white py-20 text-neutral-900">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-6">
              <StatChip size="md" tone="highlight" label="Features" />
              <div>
                <h2 className="font-display text-3xl leading-tight text-neutral-900">Everything you need to maximize rewards.</h2>
                <p className="mt-3 text-neutral-600">Smart recommendations for everyday purchases and travel planning.</p>
              </div>
              <div className="grid gap-5">
                {FEATURE_HIGHLIGHTS.map((feature) => (
                  <FeatureCard
                    key={feature.title}
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    accent={feature.accent}
                    footer={<span className="text-sm text-neutral-600">{feature.footer}</span>}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_25px_55px_rgba(82,47,174,0.2)] backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Live signal</p>
                    <h3 className="font-display text-xl text-neutral-900">Deal of the Day</h3>
                  </div>
                  <StatChip label="Realtime" tone="highlight" />
                </div>
                <DealOfTheDay />
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/95 p-6 text-sm text-neutral-600 backdrop-blur-xl">
                <h4 className="font-semibold text-neutral-900">Your data is safe</h4>
                <ul className="mt-3 space-y-2 text-neutral-600">
                  <li>• We never store card numbers—only rewards info</li>
                  <li>• Bank-level encryption for all connections</li>
                  <li>• Delete your data anytime with one click</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Nearby Businesses Explorer */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-8 text-center">
              <StatChip size="md" tone="highlight" label="Try it now" />
              <h2 className="mt-4 text-3xl font-bold text-neutral-900">See recommendations near you</h2>
              <p className="mt-2 text-neutral-600">Discover which card to use at businesses in your area.</p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 shadow-[0_35px_65px_rgba(15,20,40,0.1)]">
              <NearbyExplorer />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="cta" className="relative overflow-hidden border-t border-white/80 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 py-20 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(249,173,255,0.25),transparent_45%)]" aria-hidden />
          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <StatChip size="md" tone="highlight" label="Free to start" />
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">
              Stop leaving rewards on the table.
            </h2>
            <p className="mt-3 text-white/80">
              Join thousands of cardholders earning more on every purchase. Free forever for personal use.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => router.push('/auth')}
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-base font-semibold text-brand-600 shadow-[0_20px_45px_rgba(10,12,25,0.4)] transition hover:-translate-y-0.5"
              >
                Get started free
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push('/auth')}
                className="inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-base font-semibold text-white/90 transition hover:bg-white/10"
              >
                Learn more
              </button>
            </div>
            <p className="mt-4 text-sm text-white/75">No credit card required • Works with all major issuers</p>
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