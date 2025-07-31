// src/types/database.types.ts
export interface Database {
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
          updated_at?: string
        }
      }
      credit_cards: {
        Row: {
          id: string
          user_id: string
          card_name: string
          last_four: string
          rewards_structure: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_name: string
          last_four: string
          rewards_structure?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_name?: string
          last_four?: string
          rewards_structure?: Json
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          merchant_name: string
          category: string
          recommended_card_id: string | null
          points_earned: number | null
          transaction_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          merchant_name: string
          category: string
          recommended_card_id?: string | null
          points_earned?: number | null
          transaction_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          merchant_name?: string
          category?: string
          recommended_card_id?: string | null
          points_earned?: number | null
          transaction_date?: string
        }
      }
    }
  }
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
