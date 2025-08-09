// src/lib/realtime.ts
// Shared helpers for setting up Supabase Realtime channels (postgres changes + presence)
// Provides a single structured way to subscribe and clean up.
// Using loose typing to avoid version mismatch issues with supabase-js realtime channel typings
import type { SupabaseClient } from '@supabase/supabase-js';
// Use loose channel typing to avoid version-specific overload mismatches
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RealtimeChannel = any;

export interface PostgresChangeConfig {
  event: string; // 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  schema?: string; // default 'public'
  table: string;
  filter?: string; // e.g. user_id=eq.some-id
  handler: (payload: unknown) => void;
}

export interface PresenceConfig {
  enable?: boolean; // default false
  trackPayload?: () => Record<string, unknown> | null | undefined;
  onSync?: (channel: RealtimeChannel) => void;
  onJoin?: (info: unknown) => void; // shape per supabase SDK
  onLeave?: (info: unknown) => void;
}

export interface RealtimeChannelOptions {
  name: string;
  postgresChanges?: PostgresChangeConfig[];
  presence?: PresenceConfig;
  onStatusChange?: (status: string, channel: RealtimeChannel) => void;
  onSubscribed?: (channel: RealtimeChannel) => void;
  autoTrackOnSubscribe?: boolean; // default true (if presence + trackPayload)
}

export function createRealtimeChannel(supabase: SupabaseClient, options: RealtimeChannelOptions) {
  const {
    name,
    postgresChanges = [],
    presence,
    onStatusChange,
    onSubscribed,
    autoTrackOnSubscribe = true
  } = options;

  const channel: RealtimeChannel = (supabase as unknown as { channel: (name: string) => RealtimeChannel }).channel(name);

  // Postgres change handlers
  postgresChanges.forEach(cfg => {
    channel.on('postgres_changes', {
      event: cfg.event,
      schema: cfg.schema || 'public',
      table: cfg.table,
      filter: cfg.filter
    }, cfg.handler);
  });

  // Presence handlers
  if (presence?.enable) {
    if (presence.onSync) channel.on('presence', { event: 'sync' }, () => presence.onSync!(channel));
  if (presence.onJoin) channel.on('presence', { event: 'join' }, presence.onJoin as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  if (presence.onLeave) channel.on('presence', { event: 'leave' }, presence.onLeave as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  channel.subscribe((status: string) => {
    onStatusChange?.(status, channel);
    if (status === 'SUBSCRIBED') {
      if (presence?.enable && autoTrackOnSubscribe) {
        try {
          const payload = presence.trackPayload?.();
            if (payload) channel.track(payload);
  } catch (err) {
          // Fail silently; tracking is non-critical
          console.warn('Presence track failed', err);
        }
      }
      onSubscribed?.(channel);
    }
  });

  const unsubscribe = () => {
  try { (supabase as unknown as { removeChannel: (c: RealtimeChannel) => void }).removeChannel(channel); } catch { /* ignore */ }
  };

  return { channel, unsubscribe };
}

// React hook wrapper for convenience
import { useEffect, useRef } from 'react';

export function useRealtimeChannel(supabase: SupabaseClient | null | undefined, options: RealtimeChannelOptions, deps: unknown[] = []) {
  const saved = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    if (!supabase) return; // wait until client ready
    // Cleanup any existing
    saved.current?.unsubscribe();
    const { unsubscribe } = createRealtimeChannel(supabase, options);
    saved.current = { unsubscribe };
    return () => { unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, ...deps]);
}
