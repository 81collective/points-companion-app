import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { getOptionalServerSession } from '@/lib/auth/session'
import { logger } from '@/lib/logger'

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

    function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
      try {
        return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue
      } catch {
        return {}
      }
    }

    const created = await prisma.interactionEvent.createMany({
      data: events.map((event) => ({
        userId,
        eventType: event.event_type || event.type || 'unknown',
        label: event.label ?? null,
        meta: toInputJsonValue(event.meta || event.metadata || {}),
        path: event.path ?? null,
        createdAt:
          event.created_at || event.ts
            ? new Date(event.created_at || event.ts!)
            : new Date()
      }))
    })

    return NextResponse.json({ count: created.count })
  } catch (error) {
    logger.error('Failed to record interaction events', { error, route: '/api/interactions' });
    return NextResponse.json({ error: 'Unable to record interaction events' }, { status: 500 })
  }
}
