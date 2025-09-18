// src/app/page.tsx - Airbnb-inspired landing page with auth redirect
'use client';

import { useMemo, useState, useCallback } from 'react';
import TextLogo from '@/components/branding/TextLogo';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCards } from '@/hooks/useUserCards';
import { ArrowRight, Loader2 } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';
import DealOfTheDay from '@/components/public/DealOfTheDay';

export default function HomePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { cards } = useUserCards();

  // Do not redirect logged-in users anymore; homepage becomes universal entry with personalized recs.

  const genericBestCards = useMemo(()=>[
    { name: 'Amex Gold', tagline: '4x Dining & US Supermarkets', color: 'from-amber-400 to-pink-500' },
    { name: 'Chase Sapphire Preferred', tagline: '2x Travel & Dining', color: 'from-blue-500 to-indigo-600' },
    { name: 'Citi Double Cash', tagline: '2% Everywhere', color: 'from-emerald-500 to-teal-600' },
  ], []);

  const userCardNames = (cards || []).map(c=> c.name.toLowerCase());

  // Track active chat mode and last planning recs surfaced
  const [chatMode, setChatMode] = useState<'quick'|'planning'>('quick');
  interface PlanningRec { name: string; issuer?: string; rewardMultiplier?: number; estimatedPoints?: number }
  const [planningRecs, setPlanningRecs] = useState<PlanningRec[]>([]);

  const handleModeChange = useCallback((m: 'quick'|'planning') => {
    setChatMode(m);
  }, []);
  const handlePlanningRecs = useCallback((payload: { category: string; recommendations: Array<{ name: string; issuer?: string; rewardMultiplier?: number; estimatedPoints?: number }>; timestamp: number }) => {
    setPlanningRecs(payload.recommendations);
  }, []);

  // Owned generic baseline matches
  const ownedGeneric = user && userCardNames.length
    ? genericBestCards.filter(c=> userCardNames.some(n=> n.includes(c.name.split(' ')[0].toLowerCase())))
    : [];

  // Upgrade suggestions: planning recommendations not already owned & not in generic owned list
  interface UpgradeRec extends PlanningRec { score: number }
  const upgradeSuggestions: UpgradeRec[] = useMemo(() => {
    if (!user || chatMode !== 'planning' || planningRecs.length === 0) return [];
    const ownerWords = userCardNames;
    const outOfWallet = planningRecs.filter(r => !ownerWords.some(o => o.includes(r.name.split(' ')[0].toLowerCase())));
    const scored: UpgradeRec[] = outOfWallet.map(r => {
      const mult = typeof r.rewardMultiplier === 'number' ? r.rewardMultiplier : 1;
      const pts = typeof r.estimatedPoints === 'number' ? r.estimatedPoints : 0;
      // Simple score: weighted blend (favor multiplier slightly) + bonus if issuer diversification
      const issuerPenalty = ownerWords.some(o => o.includes((r.issuer||'').toLowerCase())) ? 0 : 0.2; // bonus for new issuer
      const score = (mult * 0.6) + (pts/100 * 0.4) + issuerPenalty;
      return { ...r, score } as UpgradeRec;
    });
    scored.sort((a,b)=> b.score - a.score);
    return scored.slice(0,3);
  }, [chatMode, planningRecs, user, userCardNames]);

  // Primary highlight cards: if planning mode & user owned generic list available show owned wallet matches else generic
  const primaryHighlights = user ? (ownedGeneric.length ? ownedGeneric : genericBestCards) : genericBestCards;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <>
      {/* Minimal header for guests */}
      <header className="w-full border-b border-gray-800 bg-black/90 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={()=>router.push('/') }>
            <TextLogo className="text-xl sm:text-2xl" compact={true} />
          </div>
          {!user ? (
            <button
              onClick={() => router.push('/auth')}
              className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition"
            >
              Sign in / Sign up
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={()=>router.push('/dashboard')}
                className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition"
              >Dashboard</button>
              <button
                onClick={()=>router.push('/dashboard/cards')}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition"
              >My Cards</button>
              <button
                onClick={async ()=>{ await signOut(); router.refresh(); }}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition"
              >Sign Out</button>
            </div>
          )}
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
      {/* Embed the same AI assistant chat used on /ai and dashboard to align experiences */}
          <div className="mx-auto max-w-3xl bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-[520px]">
        <ChatInterface
          mode="quick"
          isAuthenticated={!!user}
          userCards={cards}
          onModeChange={handleModeChange}
          onPlanningRecommendations={handlePlanningRecs}
        />
            </div>
          </div>
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

      {/* Card Highlights & Upgrades */}
      <section className="bg-white border border-gray-200 p-4 md:p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">{user ? 'Your Card Highlights' : 'Top Starter Cards'}</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {primaryHighlights.map((c) => (
            <div key={c.name} className={`rounded-xl p-4 text-white bg-gradient-to-br ${c.color} shadow-sm flex flex-col justify-between`}>
              <div>
                <p className="font-semibold text-sm tracking-wide uppercase opacity-80">{c.name}</p>
                <p className="text-xs mt-1 opacity-90 leading-snug">{c.tagline}</p>
              </div>
              {!user && <button onClick={()=>router.push('/auth')} className="mt-4 text-xs font-medium bg-white/20 hover:bg-white/30 transition px-3 py-1 rounded-md">Apply / Learn More</button>}
            </div>
          ))}
        </div>
        {user && primaryHighlights.length === 0 && (
          <p className="text-xs text-gray-500 mt-3">Add your cards in the dashboard to personalize these recommendations.</p>
        )}
        {user && upgradeSuggestions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">Potential Upgrades (Not in Your Wallet)</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {upgradeSuggestions.map(u => (
                <div key={u.name} className="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
                  <p className="text-xs font-medium text-blue-800 uppercase tracking-wide">{u.name}</p>
                  <p className="text-[11px] text-blue-700 mt-1">
                    {typeof u.rewardMultiplier === 'number' ? `${u.rewardMultiplier.toFixed(1)}x` : ''}
                    {typeof u.estimatedPoints === 'number' ? ` • ${u.estimatedPoints} pts` : ''}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">Score {u.score.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Deal of the Day replaces the features grid */}
      <section className="bg-gray-950 shadow-sm border border-gray-900 p-4 md:p-6">
        <DealOfTheDay />
      </section>
      </div>
    </>
  );
}