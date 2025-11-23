import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireServerSession } from '@/lib/auth/session'

type CardRecord = NonNullable<Awaited<ReturnType<typeof prisma.creditCard.findFirst>>>

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry))
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  return []
}

function formatCard(card: CardRecord) {
  return {
    id: card.id,
    userId: card.userId,
    name: card.name,
    issuer: card.issuer,
    network: card.network,
    last4: card.last4,
    rewards: toStringArray(card.rewards ?? []),
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString()
  }
}

export async function GET() {
  const session = await requireServerSession()

  const cards = await prisma.creditCard.findMany({
    where: { userId: session.user!.id },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ cards: cards.map(formatCard) })
}

export async function POST(request: Request) {
  const session = await requireServerSession()

  try {
    const payload = await request.json()
    const name = String(payload.name || '').trim()
    const last4 = String(payload.last4 || '').trim()

    if (!name || last4.length !== 4) {
      return NextResponse.json({ error: 'Name and last four digits are required' }, { status: 400 })
    }

    const card = await prisma.creditCard.create({
      data: {
        userId: session.user!.id,
        name,
        issuer: payload.issuer ? String(payload.issuer) : null,
        network: payload.network ? String(payload.network) : null,
        last4,
        rewards: toStringArray(payload.rewards)
      }
    })

    return NextResponse.json({ card: formatCard(card) })
  } catch (error) {
    console.error('[cards] failed to create card', error)
    return NextResponse.json({ error: 'Unable to create card' }, { status: 500 })
  }
}
