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

function parseDate(value: unknown): Date | null {
  if (!value) return null
  try {
    const date = new Date(value as string)
    return Number.isNaN(date.getTime()) ? null : date
  } catch (_error) {
    return null
  }
}

export async function GET() {
  const session = await requireServerSession()

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user!.id },
    include: {
      card: true,
      recommendedCard: true,
      business: true
    },
    orderBy: { date: 'desc' }
  })

  return NextResponse.json({ transactions: transactions.map(serializeTransaction) })
}

export async function POST(request: Request) {
  const session = await requireServerSession()

  try {
    const payload = await request.json()
    const date = parseDate(payload.date)
    if (!date) {
      return NextResponse.json({ error: 'Invalid transaction date' }, { status: 400 })
    }

    const merchantName = String(payload.merchantName || '').trim()
    const category = String(payload.category || '').trim()
    const amountValue = Number(payload.amount)

    if (!merchantName || !category || Number.isNaN(amountValue)) {
      return NextResponse.json({ error: 'Missing merchant, category, or valid amount' }, { status: 400 })
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user!.id,
        merchantName,
        category,
        description: payload.description ? String(payload.description) : null,
        amount: new Prisma.Decimal(amountValue),
        date,
        pointsEarned: payload.pointsEarned ? Number(payload.pointsEarned) : null,
        cardId: payload.cardId ? String(payload.cardId) : null,
        recommendedCardId: payload.recommendedCardId ? String(payload.recommendedCardId) : null,
        businessId: payload.businessId ? String(payload.businessId) : null,
        locationLat: payload.locationLat ? Number(payload.locationLat) : null,
        locationLng: payload.locationLng ? Number(payload.locationLng) : null
      },
      include: {
        card: true,
        recommendedCard: true,
        business: true
      }
    })

    return NextResponse.json({ transaction: serializeTransaction(transaction) })
  } catch (error) {
    console.error('[transactions] failed to create transaction', error)
    return NextResponse.json({ error: 'Unable to create transaction' }, { status: 500 })
  }
}
