import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { requireServerSession } from '@/lib/auth/session'

type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: {
    card: true
    recommendedCard: true
    business: true
  }
}>

function serializeTransaction(transaction: TransactionWithRelations) {
  return {
    ...transaction,
    amount: Number(transaction.amount),
    date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
    createdAt:
      transaction.createdAt instanceof Date ? transaction.createdAt.toISOString() : transaction.createdAt,
    updatedAt:
      transaction.updatedAt instanceof Date ? transaction.updatedAt.toISOString() : transaction.updatedAt
  }
}

function parseDecimal(value: unknown): Prisma.Decimal | undefined {
  if (value === undefined) return undefined
  const num = Number(value)
  if (Number.isNaN(num)) return undefined
  return new Prisma.Decimal(num)
}

function parseDate(value: unknown): Date | undefined {
  if (value === undefined) return undefined
  const date = new Date(value as string)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export async function PATCH(
  request: Request,
  { params }: { params: { transactionId: string } }
) {
  try {
    const session = await requireServerSession()
    const payload = await request.json()
    const { transactionId } = params

    const updates = {
      merchantName: payload.merchantName ? String(payload.merchantName) : undefined,
      category: payload.category ? String(payload.category) : undefined,
      description: payload.description !== undefined ? String(payload.description) : undefined,
      amount: parseDecimal(payload.amount),
      date: parseDate(payload.date),
      pointsEarned:
        payload.pointsEarned !== undefined ? Number(payload.pointsEarned) : undefined,
      cardId: payload.cardId ? String(payload.cardId) : undefined,
      recommendedCardId: payload.recommendedCardId ? String(payload.recommendedCardId) : undefined,
      businessId: payload.businessId ? String(payload.businessId) : undefined,
      locationLat: payload.locationLat !== undefined ? Number(payload.locationLat) : undefined,
      locationLng: payload.locationLng !== undefined ? Number(payload.locationLng) : undefined
    }

    const transaction = await prisma.transaction.update({
      where: { id: transactionId, userId: session.user!.id },
      data: updates,
      include: {
        card: true,
        recommendedCard: true,
        business: true
      }
    })

    return NextResponse.json({ transaction: serializeTransaction(transaction) })
  } catch (error) {
    console.error('[transactions] failed to update transaction', error)
    return NextResponse.json({ error: 'Unable to update transaction' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { transactionId: string } }
) {
  try {
    const session = await requireServerSession()
    const { transactionId } = params

    await prisma.transaction.delete({ where: { id: transactionId, userId: session.user!.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[transactions] failed to delete transaction', error)
    return NextResponse.json({ error: 'Unable to delete transaction' }, { status: 500 })
  }
}
