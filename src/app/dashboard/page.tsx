"use client"
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
// Removed unused legacy imports
import CommandPalette from '@/components/command-palette/CommandPalette'
import { fetchDashboardData } from '@/services/dashboardData'
import { DashboardMetrics } from '@/types/dashboard'

const OverviewSection = dynamic(() => import('@/components/dashboard/sections/OverviewSection'))
const CardsSection = dynamic(() => import('@/components/dashboard/sections/CardsSection'))
const BonusesSection = dynamic(() => import('@/components/dashboard/sections/BonusesSection'))
// Removed Insights & Analytics sections (deprecated)


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
        <div className="mb-2">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{`Welcome back${profile?.firstName ? `, ${profile.firstName}` : ''} 👋`}</h1>
          <p className="mt-2 text-dim">Unified rewards overview and optimization hub.</p>
        </div>
        {error && !stale && (
          <div className="p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-700 flex justify-between items-start">
            <span>{error}</span>
            <button onClick={load} className="text-xs underline">Retry</button>
          </div>
        )}
        {loading && !metrics && !stale && (
          <div className="grid gap-4 sm:grid-cols-2" aria-label="Loading dashboard metrics">
            {[...Array(4)].map((_,i) => <div key={i} className="h-32 rounded-lg animate-pulse bg-[var(--color-bg-alt)] border" />)}
          </div>
        )}
        {stale && !metrics && (
          <div className="text-xs text-gray-500">
            <button onClick={load} className="underline underline-offset-2 mr-2">Retry load</button>
            <button onClick={()=> window.location.reload()} className="underline underline-offset-2">Refresh page</button>
          </div>
        )}
        {/* After stale timeout, if metrics still null, show default zero metrics */}
        {!loading && section === 'overview' && (
          <>
            <div className="mt-4">
              <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow hover:bg-blue-700 transition">Search Nearby Businesses →</Link>
            </div>
            <OverviewSection {...(metrics || { cardCount: 0, totalPoints: 0, monthlyPoints: 0, recentActivityCount: 0 })} />
            <div className="mt-16">
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