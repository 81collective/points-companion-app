"use client"
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DEFAULT_DASHBOARD_PREFERENCES, type DashboardPreferences } from '@/types/preferences'

export function useDashboardPreferences() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth()
  const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_DASHBOARD_PREFERENCES)
  const [loading, setLoading] = useState(true)
  const storageKey = user ? `dashboard_preferences_${user.id}` : 'dashboard_preferences_anonymous'

  useEffect(() => {
    if (authLoading) {
      setLoading(true)
      return
    }

    if (!user) {
      const local = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
      if (local) {
        try {
          setPreferences({ ...DEFAULT_DASHBOARD_PREFERENCES, ...JSON.parse(local) })
        } catch {
          setPreferences(DEFAULT_DASHBOARD_PREFERENCES)
        }
      } else {
        setPreferences(DEFAULT_DASHBOARD_PREFERENCES)
      }
      setLoading(false)
      return
    }

    if (!profile) {
      setPreferences(DEFAULT_DASHBOARD_PREFERENCES)
      setLoading(false)
      return
    }

    let localPrefs: Partial<DashboardPreferences> = {}
    if (typeof window !== 'undefined') {
      const localRaw = localStorage.getItem(storageKey)
      if (localRaw) {
        try {
          localPrefs = JSON.parse(localRaw)
        } catch {
          localPrefs = {}
        }
      }
    }

    const merged = {
      ...DEFAULT_DASHBOARD_PREFERENCES,
      ...localPrefs,
      ...(profile.dashboardPreferences as Partial<DashboardPreferences> | undefined)
    }

    setPreferences(merged)
    setLoading(false)
  }, [authLoading, profile, storageKey, user])

  const save = useCallback(async (next: DashboardPreferences) => {
    setPreferences(next)
    if (!user) {
      if (typeof window !== 'undefined') localStorage.setItem(storageKey, JSON.stringify(next))
      return { ok: true }
    }
    const result = await updateProfile({ dashboardPreferences: next })
    if (!result.error && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(next))
    }
    return { ok: !result.error }
  }, [updateProfile, user, storageKey])

  return { preferences, setPreferences, save, loading, defaultPreferences: DEFAULT_DASHBOARD_PREFERENCES }
}
