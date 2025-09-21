"use client"
import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
// Removed unused legacy imports
import CardsSection from '@/components/dashboard/sections/CardsSection'
import InsightsSection from '@/components/dashboard/sections/InsightsSection'
import AnalyticsSection from '@/components/dashboard/sections/AnalyticsSection'
import BonusesSection from '@/components/dashboard/sections/BonusesSection'
import OverviewSection from '@/components/dashboard/sections/OverviewSection'
import CommandPalette from '@/components/command-palette/CommandPalette'
import { fetchDashboardData } from '@/services/dashboardData'
import { DashboardMetrics } from '@/types/dashboard'


export default function DashboardPage() {
  const { profile, user } = useAuth()
  const pathname = usePathname()
  const section = pathname.split('/dashboard/')[1]?.split('/')[0] || 'overview'
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => { load() }, [load])

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
        {loading && !metrics ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_,i) => <div key={i} className="h-32 rounded-lg animate-pulse bg-[var(--color-bg-alt)] border" />)}
          </div>
        ) : null}
        {!loading && metrics && section === 'overview' && (
          <OverviewSection {...metrics} />
        )}
        {section === 'cards' && <CardsSection />}
        {section === 'bonuses' && <BonusesSection />}
        {section === 'insights' && <InsightsSection />}
        {section === 'analytics' && <AnalyticsSection />}
      </div>
    </ProtectedRoute>
  );
}