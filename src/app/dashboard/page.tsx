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
    const t = setTimeout(()=>{
      if (!metrics) {
        setStale(true);
        if (!error) setError('Taking longer than expected to load your data.');
      }
    }, 7000);
    return ()=> clearTimeout(t);
  }, [load]);

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <CommandPalette />
        <div className="mb-2">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{`Welcome back${profile?.first_name ? `, ${profile.first_name}` : ''} 👋`}</h1>
          <p className="mt-2 text-dim">Unified rewards overview and optimization hub.</p>
        </div>
        {error && (
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
          <div className="p-4 rounded-md bg-yellow-50 border border-yellow-300 text-sm text-yellow-800 space-y-2">
            <p>Still loading… This can happen on first load or if the network is slow.</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={load} className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700">Retry</button>
              <button onClick={()=> window.location.reload()} className="px-3 py-1 border border-yellow-500 text-yellow-700 text-xs rounded hover:bg-yellow-100">Hard refresh</button>
            </div>
          </div>
        )}
        {!loading && metrics && section === 'overview' && (
          <>
            <div className="mt-4">
              <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow hover:bg-blue-700 transition">Search Nearby Businesses →</Link>
            </div>
            <OverviewSection {...metrics} />
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