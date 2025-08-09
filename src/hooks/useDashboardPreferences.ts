"use client"
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'

export interface DashboardPreferences {
  showCreditCards: boolean
  showAnalytics: boolean
  showAIInsights: boolean
  showTransactions: boolean
  showNotifications: boolean
  showLocationServices: boolean
  defaultDashboardView: 'overview' | 'cards' | 'analytics'
  cardDisplayMode: 'grid' | 'list'
  analyticsTimeRange: '30d' | '90d' | '1y'
}

const defaultPreferences: DashboardPreferences = {
  showCreditCards: true,
  showAnalytics: true,
  showAIInsights: true,
  showTransactions: true,
  showNotifications: true,
  showLocationServices: false,
  defaultDashboardView: 'overview',
  cardDisplayMode: 'grid',
  analyticsTimeRange: '30d',
}

export function useDashboardPreferences() {
  const { user } = useAuth()
  const supabase = createClient()
  const [preferences, setPreferences] = useState<DashboardPreferences>(defaultPreferences)
  const [loading, setLoading] = useState(true)
  const storageKey = user ? `dashboard_preferences_${user.id}` : 'dashboard_preferences_anonymous'

  const load = useCallback(async () => {
    if (!user) {
      // Try localStorage for anonymous (should rarely apply in app shell)
      const local = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
      if (local) {
        try { setPreferences({ ...defaultPreferences, ...JSON.parse(local) }) } catch {}
      }
      setLoading(false)
      return
    }
    try {
      // Attempt to read from profiles.dashboard_preferences (JSONB)
      const { data, error } = await supabase
        .from('profiles')
        .select('dashboard_preferences')
        .eq('id', user.id)
        .single()
      if (!error && data && data.dashboard_preferences) {
        setPreferences({ ...defaultPreferences, ...data.dashboard_preferences })
      } else {
        // Fallback to localStorage
        const local = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
        if (local) {
          try { setPreferences({ ...defaultPreferences, ...JSON.parse(local) }) } catch {}
        }
      }
    } catch {
      // Ignore and use defaults/local
      const local = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
      if (local) {
        try { setPreferences({ ...defaultPreferences, ...JSON.parse(local) }) } catch {}
      }
    } finally {
      setLoading(false)
    }
  }, [supabase, user, storageKey])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (next: DashboardPreferences) => {
    setPreferences(next)
    if (!user) {
      if (typeof window !== 'undefined') localStorage.setItem(storageKey, JSON.stringify(next))
      return { ok: true }
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ dashboard_preferences: next, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (error) throw error
      if (typeof window !== 'undefined') localStorage.setItem(storageKey, JSON.stringify(next))
      return { ok: true }
    } catch {
      if (typeof window !== 'undefined') localStorage.setItem(storageKey, JSON.stringify(next))
      return { ok: false }
    }
  }, [supabase, user, storageKey])

  return { preferences, setPreferences, save, loading, defaultPreferences }
}
