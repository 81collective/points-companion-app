// src/lib/supabase.ts - Fixed 'any' type errors
import { createBrowserClient } from '@supabase/ssr'

export type Json = 
  | string 
  | number 
  | boolean 
  | null 
  | { [key: string]: Json | undefined } 
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_cards: {
        Row: {
          id: string
          user_id: string
          name: string
          last4: string
          rewards: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          last4: string
          rewards?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          last4?: string
          rewards?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Client-side Supabase client
export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    // Avoid build-time (SSR/SSG) crashes; provide a minimal no-op stub on the server.
    if (typeof window === 'undefined') {
      const noop = async (..._args: unknown[]) => ({ data: null, error: { message: 'Supabase not configured' } })
      return {
        auth: {
          getSession: async () => ({ data: { session: null } }),
          signOut: async () => ({ error: null }),
          signUp: noop,
          signInWithPassword: noop,
        },
        from: () => ({
          select: () => ({
            eq: () => ({ order: async () => ({ data: [], error: { message: 'Supabase not configured' } }) }),
          }),
          insert: noop,
          update: noop,
          upsert: noop,
          delete: noop,
          order: () => ({ select: noop }),
        }),
      } as unknown as ReturnType<typeof createBrowserClient<Database>>
    }
    // On the client, surface a clear error if keys are missing.
    throw new Error("@supabase/ssr: Your project's URL and API key are required to create a Supabase client!")
  }

  return createBrowserClient<Database>(url, key)
}