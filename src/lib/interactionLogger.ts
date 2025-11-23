interface InteractionEventBase {
  type: string
  label?: string
  meta?: Record<string, unknown>
  path?: string
  ts?: string
}

export async function logInteraction(event: InteractionEventBase) {
  try {
    const payload = {
      event_type: event.type,
      label: event.label || null,
      meta: event.meta || {},
      path: event.path || (typeof window !== 'undefined' ? window.location.pathname : null),
      created_at: event.ts || new Date().toISOString()
    }

    const res = await fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      console.warn('[interactionLogger] insert failed, falling back to localStorage', await res.text())
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
    const res = await fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items)
    })
    if (res.ok) localStorage.removeItem(key)
  } catch (err) {
    console.warn('[interactionLogger] flush failed', err)
  }
}
