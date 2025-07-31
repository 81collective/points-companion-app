// src/hooks/useSupabase.ts
'use client'

import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useSupabase() {
  const supabase = createClient()
  const { user } = useAuth()

  const getProfile = async () => {
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  }

  const getCreditCards = async () => {
    if (!user) return []

    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching credit cards:', error)
      return []
    }

    return data
  }

  const getTransactions = async (limit = 50) => {
    if (!user) return []

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching transactions:', error)
      return []
    }

    return data
  }

  return {
    supabase,
    user,
    getProfile,
    getCreditCards,
    getTransactions
  }
}