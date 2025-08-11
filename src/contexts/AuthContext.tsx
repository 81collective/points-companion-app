// src/contexts/AuthContext.tsx - Remove unused error variables
'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const debugEnabled = typeof window !== 'undefined' && (window as any).__AUTH_DEBUG
  const debugLog = (...args: unknown[]) => { if (debugEnabled) console.log('[AuthDebug]', ...args) }

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }, [supabase])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        debugLog('Fetching initial session...')
        const start = performance.now()
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          debugLog('getSession error', error.message)
        }
        debugLog('getSession complete', { ms: Math.round(performance.now() - start), hasSession: !!session })
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (err) {
        console.error('[Auth] getInitialSession fatal', err)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      debugLog('Auth state change', { event, hasSession: !!session })
      setUser(session?.user ?? null)
      try {
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error('[Auth] onAuthStateChange profile fetch error', err)
      } finally {
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, fetchProfile])

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      })

      if (error) {
        return { error: error.message }
      }

      // Create profile if user was created
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            first_name: firstName || null,
            last_name: lastName || null
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }

      return {}
    } catch {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signIn = async (email: string, password: string) => {
    const start = performance.now()
    debugLog('signIn attempt', { emailMasked: email.replace(/(^.).+(@.*$)/, '$1***$2') })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      const dur = Math.round(performance.now() - start)
      if (error) {
        debugLog('signIn error', { message: error.message, ms: dur })
        return { error: error.message }
      }
      debugLog('signIn success', { userId: data.user?.id, ms: dur })
      return {}
    } catch (err) {
      debugLog('signIn fatal', err)
      return { error: 'Unexpected sign-in failure' }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) {
        return { error: error.message }
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null)
      return {}
    } catch {
      return { error: 'An unexpected error occurred' }
    }
  }

  const value = {
    user,
    profile,
    loading,
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