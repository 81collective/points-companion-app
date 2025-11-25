'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { clientLogger } from '@/lib/clientLogger';

const log = clientLogger.child({ component: 'useUserCards' });

export interface SimpleUserCard {
  id: string;
  name: string;
}

export function useUserCards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<SimpleUserCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      // Only run on client with valid keys and an authenticated user
      if (!user || typeof window === 'undefined') {
        setCards([]);
        return;
      }
      setLoading(true); setError(null);
      try {
        const res = await fetch('/api/cards', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load cards');
        const data = (await res.json()) as { cards?: SimpleUserCard[] };
        if (!cancelled) setCards(data.cards || []);
      } catch (e) {
        if (!cancelled) setError('Failed to load your cards');
        log.error('Fetch error', { error: e });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  return { cards, loading, error };
}
