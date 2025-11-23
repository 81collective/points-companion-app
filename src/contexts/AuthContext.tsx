'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import type { DashboardPreferences } from '@/types/preferences'

interface Profile {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  dashboardPreferences?: DashboardPreferences
  createdAt: string
  updatedAt: string
}

interface AuthUser {
  id: string
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  avatarUrl?: string | null
}

interface AuthContextType {
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function requestProfile() {
  const response = await fetch('/api/profile', { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Failed to fetch profile')
  }
  const payload = await response.json()
  return payload.profile as Profile | null
}

async function patchProfile(updates: Partial<Profile>) {
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error ?? 'Unable to update profile')
  }

  const payload = await response.json()
  return payload.profile as Profile
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: sessionData, status } = useSession()
  const session = sessionData as Session | null
  const [profile, setProfile] = useState<Profile | null>(null)
  const [hydratingProfile, setHydratingProfile] = useState(false)

  const user = useMemo<AuthUser | null>(() => {
    if (!session?.user) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      avatarUrl: session.user.avatarUrl
    }
  }, [session?.user])

  const fetchProfile = useCallback(async () => {
    try {
      const data = await requestProfile()
      setProfile(data)
    } catch (error) {
      console.error('[Auth] profile fetch failed', error)
    }
  }, [])

  useEffect(() => {
    if (!user?.id) {
      setProfile(null)
      setHydratingProfile(false)
      return
    }

    let mounted = true
    setHydratingProfile(true)

    requestProfile()
      .then((data) => {
        if (mounted) {
          setProfile(data)
        }
      })
      .catch((error) => {
        console.error('[Auth] profile fetch failed', error)
      })
      .finally(() => {
        if (mounted) {
          setHydratingProfile(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [user?.id])

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false
    })

    if (result?.error) {
      return { error: result.error }
    }

    await fetchProfile()
    return {}
  }, [fetchProfile])

  const signUp = useCallback(async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName })
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        return { error: payload.error ?? 'Unable to create account' }
      }

      await signIn(email, password)
      return {}
    } catch (error) {
      console.error('[Auth] signUp failed', error)
      return { error: 'An unexpected error occurred' }
    }
  }, [signIn])

  const signOut = useCallback(async () => {
    await nextAuthSignOut({ redirect: false })
    setProfile(null)
  }, [])

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    try {
      const updated = await patchProfile(updates)
      setProfile(updated)
      return {}
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unable to update profile' }
    }
  }, [])

  const value: AuthContextType = {
    user,
    profile,
    loading: status === 'loading' || hydratingProfile,
    signIn,
    signUp,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}