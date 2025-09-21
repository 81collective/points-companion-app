"use client";
import React from 'react';
import Link from 'next/link';
import { Plus, ArrowUpRight, PieChart, BarChart3, DollarSign, Target } from 'lucide-react';
import { DashboardMetrics } from '@/types/dashboard';
import StatCard from '@/components/dashboard/StatCard';

type Props = DashboardMetrics; // remove empty interface extending same type

function buildSuggestions(m: DashboardMetrics) {
  const suggestions: Array<{ icon: React.ElementType; title: string; cta?: { href: string; label: string } }> = [];
  if (m.cardCount === 0) suggestions.push({ icon: Plus, title: 'Add your first card', cta: { href: '/dashboard/cards', label: 'Add card' } });
  if (m.monthlyPoints === 0) suggestions.push({ icon: DollarSign, title: 'Make a purchase on a bonus category card' });
  suggestions.push({ icon: BarChart3, title: 'Review insights to optimize categories', cta: { href: '/dashboard/insights', label: 'Open insights' } });
  return suggestions;
}

export default function OverviewSection({ cardCount, totalPoints, monthlyPoints, recentActivityCount }: Props) {
  const suggestions = buildSuggestions({ cardCount, totalPoints, monthlyPoints, recentActivityCount });
  return (
  <div className="space-y-12 fade-in">
      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/cards" className="group h-14 rounded-xl border border-gray-200 bg-white/70 backdrop-blur hover:bg-white transition flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow cursor-pointer">
          <Plus className="w-4 h-4 text-primary-600 group-hover:scale-110 transition" /> Add card
        </Link>
        <Link href="/transactions/import" className="group h-14 rounded-xl border border-gray-200 bg-white/70 backdrop-blur hover:bg-white transition flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow cursor-pointer">
          <ArrowUpRight className="w-4 h-4 text-primary-600 group-hover:rotate-45 transition" /> Import</Link>
        <Link href="/dashboard/analytics" className="group h-14 rounded-xl border border-gray-200 bg-white/70 backdrop-blur hover:bg-white transition flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow cursor-pointer">
          <PieChart className="w-4 h-4 text-primary-600 group-hover:scale-110 transition" /> Analytics</Link>
      </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Actions & metrics */}
  <div className="lg:col-span-2 card-modern p-6 dark:bg-gray-900/60 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold tracking-wide text-gray-700 flex items-center gap-2">Next best actions</h2>
            <Link href="/dashboard/insights" className="text-xs font-medium text-primary-600 hover:underline">View insights →</Link>
          </div>
          <ul className="space-y-2">
            {suggestions.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={i} className="group flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-800/50 backdrop-blur hover:bg-white dark:hover:bg-gray-800 transition">
                  <div className="flex items-center">
                    <div className="mr-3 p-2 rounded-lg bg-gradient-to-br from-primary-50 to-white border border-gray-200 group-hover:border-primary-300 transition">
                      <Icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{s.title}</span>
                  </div>
                  {s.cta ? <Link href={s.cta.href} className="text-xs font-medium text-gray-500 group-hover:text-primary-600 transition-colors">{s.cta.label} →</Link> : null}
                </li>
              );
            })}
          </ul>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Cards" value={cardCount} />
            <StatCard label="Monthly pts" value={monthlyPoints} />
            <StatCard label="Recent pts" value={totalPoints} />
            <StatCard label="Recent txns" value={recentActivityCount} />
          </div>
        </div>

        {/* Recommendation */}
  <div className="card-modern p-6 flex flex-col dark:bg-gray-900/60 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-primary-600" /> Personalized recommendation</h2>
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">Connect more cards to unlock deeper category optimization and predictive spend routing.</p>
          <div className="mt-auto grid gap-3">
            <Link href="/dashboard/ai-assistant" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 text-white text-sm font-medium px-4 py-2 shadow-sm hover:bg-primary-700 transition">
              <Target className="w-4 h-4" /> Open AI Assistant
            </Link>
            <Link href="/dashboard/cards" className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2 hover:bg-gray-50 transition">
              <Plus className="w-4 h-4" /> Add another card
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
