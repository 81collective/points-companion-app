'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase';

export interface SimpleUserCard {
  id: string;
  name: string;
}

export function useUserCards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<SimpleUserCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasSupabaseKeys = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      // Only run on client with valid keys and an authenticated user
      if (!user || typeof window === 'undefined' || !hasSupabaseKeys) {
        setCards([]);
        return;
      }
      setLoading(true); setError(null);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('credit_cards')
          .select('id,name')
          .eq('user_id', user.id)
          .order('name');
        if (error) throw error;
        if (!cancelled) setCards((data || []).map(c => ({ id: c.id as string, name: c.name as string })));
      } catch (e) {
        if (!cancelled) setError('Failed to load your cards');
        console.error('[useUserCards] fetch error', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user, hasSupabaseKeys]);

  return { cards, loading, error };
}
