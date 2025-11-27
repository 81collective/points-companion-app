"use client"
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CommandPalette from '@/components/command-palette/CommandPalette'
import { fetchDashboardData } from '@/services/dashboardData'
import { DashboardMetrics } from '@/types/dashboard'
import { MessageCircle, ArrowRight } from 'lucide-react'

const OverviewSection = dynamic(() => import('@/components/dashboard/sections/OverviewSection'))
const CardsSection = dynamic(() => import('@/components/dashboard/sections/CardsSection'))
const BonusesSection = dynamic(() => import('@/components/dashboard/sections/BonusesSection'))


export default function DashboardPage() {
  const { profile, user } = useAuth()
  const pathname = usePathname()
  const section = pathname.split('/dashboard/')[1]?.split('/')[0] || 'overview'
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stale, setStale] = useState(false)

  const load = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDashboardData(user.id)
      setMetrics(data)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load dashboard data'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (metrics) {
      setStale(false);
      return undefined;
    }
    const timer = setTimeout(() => {
      setStale(true);
      setError(prev => prev ?? 'Taking longer than expected to load your data.');
    }, 7000);
    return () => clearTimeout(timer);
  }, [metrics, loading]);

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <CommandPalette />
        
        {/* Welcome header */}
        <div className="mb-2">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">{`Welcome back${profile?.firstName ? `, ${profile.firstName}` : ''} 👋`}</h1>
          <p className="mt-2 text-neutral-600">Your unified rewards dashboard and optimization hub.</p>
        </div>

        {/* Quick action: AI Assistant */}
        <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Ask PointAdvisor</h3>
                <p className="text-sm text-neutral-600">Get instant card recommendations for any purchase</p>
              </div>
            </div>
            <Link
              href="/dashboard/ai-assistant"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(94,55,187,0.3)] transition hover:-translate-y-0.5"
            >
              Open Chat
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {error && !stale && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex justify-between items-start">
            <span>{error}</span>
            <button onClick={load} className="text-xs font-medium underline underline-offset-2">Retry</button>
          </div>
        )}
        {loading && !metrics && !stale && (
          <div className="grid gap-4 sm:grid-cols-2" aria-label="Loading dashboard metrics">
            {[...Array(4)].map((_,i) => <div key={i} className="h-32 rounded-2xl animate-pulse bg-white border border-neutral-100" />)}
          </div>
        )}
        {stale && !metrics && (
          <div className="text-xs text-neutral-500">
            <button onClick={load} className="underline underline-offset-2 mr-2">Retry load</button>
            <button onClick={()=> window.location.reload()} className="underline underline-offset-2">Refresh page</button>
          </div>
        )}
        
        {!loading && section === 'overview' && (
          <>
            <OverviewSection {...(metrics || { cardCount: 0, totalPoints: 0, monthlyPoints: 0, recentActivityCount: 0 })} />
            <div className="mt-12">
              <CardsSection />
            </div>
          </>
        )}
        {section === 'cards' && <CardsSection />}
        {section === 'bonuses' && <BonusesSection />}
      </div>
    </ProtectedRoute>
  );
}