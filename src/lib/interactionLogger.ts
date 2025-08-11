// Centralized interaction logging with graceful Supabase fallback
import { createClient } from '@/lib/supabase'

interface InteractionEventBase {
  type: string
  label?: string
  meta?: Record<string, unknown>
  path?: string
  ts?: string
}

export async function logInteraction(event: InteractionEventBase) {
  try {
    const supabase = createClient()
    const payload = {
      event_type: event.type,
      label: event.label || null,
      meta: event.meta || {},
      path: event.path || (typeof window !== 'undefined' ? window.location.pathname : null),
      created_at: event.ts || new Date().toISOString()
    }

    // Attempt insert into interaction_events (create table if not existing via migration externally)
    const { error } = await supabase.from('interaction_events').insert(payload)
    if (error) {
      console.warn('[interactionLogger] insert failed, falling back to localStorage', error.message)
      fallbackToLocal(payload)
    }
  } catch (err) {
    console.warn('[interactionLogger] unexpected failure', err)
    fallbackToLocal({ ...event, created_at: new Date().toISOString() })
  }
}

function fallbackToLocal(payload: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  try {
    const key = 'pending_interaction_events'
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    existing.push(payload)
    localStorage.setItem(key, JSON.stringify(existing))
  } catch {/* ignore */}
}

type PendingInteraction = {
  event_type?: string
  label?: string | null
  meta?: Record<string, unknown>
  path?: string | null
  created_at?: string
  // Allow forward compatibility extra fields
  [k: string]: unknown
}

export async function flushPendingInteractions() {
  if (typeof window === 'undefined') return
  try {
    const key = 'pending_interaction_events'
    const raw = localStorage.getItem(key)
    if (!raw) return
  const items: PendingInteraction[] = JSON.parse(raw) as PendingInteraction[]
    if (!items.length) return
    const supabase = createClient()
    const { error } = await supabase.from('interaction_events').insert(items)
    if (!error) localStorage.removeItem(key)
  } catch (err) {
    console.warn('[interactionLogger] flush failed', err)
  }
}
