// src/lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

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
          card_name: string
          last_four: string
          rewards_structure: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_name: string
          last_four: string
          rewards_structure?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_name?: string
          last_four?: string
          rewards_structure?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Client-side Supabase client
export const createClient = () => createClientComponentClient<Database>()