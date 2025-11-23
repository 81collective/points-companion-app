import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireServerSession } from '@/lib/auth/session'

type CardRecord = NonNullable<Awaited<ReturnType<typeof prisma.creditCard.findFirst>>>

function toStringArray(value: unknown): string[] | undefined {
  if (value === undefined) {
    return undefined
  }
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry))
  }
  if (typeof value === 'string') {
    const values = value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
    return values
  }
  return undefined
}

function formatCard(card: CardRecord) {
  return {
    id: card.id,
    userId: card.userId,
    name: card.name,
    issuer: card.issuer,
    network: card.network,
    last4: card.last4,
    rewards: toStringArray(card.rewards ?? []) ?? [],
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString()
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const session = await requireServerSession()
    const payload = await request.json()
    const { cardId } = params

    const existing = await prisma.creditCard.findUnique({ where: { id: cardId } })
    if (!existing || existing.userId !== session.user!.id) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const updates = {
      name: payload.name ? String(payload.name) : undefined,
      issuer: payload.issuer ? String(payload.issuer) : undefined,
      network: payload.network ? String(payload.network) : undefined,
      last4: payload.last4 ? String(payload.last4).slice(-4) : undefined,
      rewards: toStringArray(payload.rewards)
    }

    const card = await prisma.creditCard.update({
      where: { id: cardId },
      data: updates
    })

    return NextResponse.json({ card: formatCard(card) })
  } catch (error) {
    console.error('[cards] failed to update card', error)
    return NextResponse.json({ error: 'Unable to update card' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const session = await requireServerSession()
    const { cardId } = params
    const result = await prisma.creditCard.deleteMany({ where: { id: cardId, userId: session.user!.id } })
    if (!result.count) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[cards] failed to delete card', error)
    return NextResponse.json({ error: 'Unable to delete card' }, { status: 500 })
  }
}
