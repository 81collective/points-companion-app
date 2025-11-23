import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getOptionalServerSession } from '@/lib/auth/session'

interface IncomingEvent {
  event_type?: string
  type?: string
  label?: string | null
  meta?: Record<string, unknown>
  metadata?: Record<string, unknown>
  path?: string | null
  created_at?: string
  ts?: string
}

function normalizeEvents(body: unknown): IncomingEvent[] {
  const items = Array.isArray(body) ? body : [body]
  return items
    .filter((item): item is IncomingEvent => !!item && typeof item === 'object')
    .map((item) => item)
}

export async function POST(request: Request) {
  try {
    const session = await getOptionalServerSession()
    const userId = session?.user?.id ?? null
    const body = await request.json()
    const events = normalizeEvents(body)

    if (!events.length) {
      return NextResponse.json({ error: 'No interaction events provided' }, { status: 400 })
    }

    const created = await prisma.interactionEvent.createMany({
      data: events.map((event) => ({
        userId,
        eventType: event.event_type || event.type || 'unknown',
        label: event.label ?? null,
        meta: event.meta || event.metadata || {},
        path: event.path ?? null,
        createdAt:
          event.created_at || event.ts
            ? new Date(event.created_at || event.ts!)
            : new Date()
      }))
    })

    return NextResponse.json({ count: created.count })
  } catch (error) {
    console.error('[interactions] failed to record events', error)
    return NextResponse.json({ error: 'Unable to record interaction events' }, { status: 500 })
  }
}
