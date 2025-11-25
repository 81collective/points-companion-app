import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { requireServerSession } from '@/lib/auth/session'
import logger from '@/lib/logger'

const log = logger.child({ component: 'transactions-api' })

// Validation schema for creating transactions
const CreateTransactionSchema = z.object({
  merchantName: z.string().min(1).max(200),
  category: z.string().min(1).max(50),
  amount: z.coerce.number().positive(),
  date: z.coerce.date(),
  description: z.string().max(500).optional(),
  pointsEarned: z.coerce.number().int().optional(),
  cardId: z.string().max(100).optional(),
  recommendedCardId: z.string().max(100).optional(),
  businessId: z.string().max(100).optional(),
  locationLat: z.coerce.number().min(-90).max(90).optional(),
  locationLng: z.coerce.number().min(-180).max(180).optional(),
})

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
  
  log.debug('Transactions fetched', { action: 'list', count: transactions.length })
  return NextResponse.json({ transactions: transactions.map(serializeTransaction) })
}

export async function POST(request: Request) {
  const session = await requireServerSession()

  try {
    const payload = await request.json()
    
    // Validate with Zod
    const parseResult = CreateTransactionSchema.safeParse(payload)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    
    const data = parseResult.data
    log.info('Creating transaction', { action: 'create', merchant: data.merchantName, category: data.category })

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user!.id,
        merchantName: data.merchantName,
        category: data.category,
        description: data.description || null,
        amount: new Prisma.Decimal(data.amount),
        date: data.date,
        pointsEarned: data.pointsEarned || null,
        cardId: data.cardId || null,
        recommendedCardId: data.recommendedCardId || null,
        businessId: data.businessId || null,
        locationLat: data.locationLat || null,
        locationLng: data.locationLng || null
      },
      include: {
        card: true,
        recommendedCard: true,
        business: true
      }
    })

    return NextResponse.json({ transaction: serializeTransaction(transaction) })
  } catch (error) {
    log.error('Failed to create transaction', { action: 'create_error', error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Unable to create transaction' }, { status: 500 })
  }
}
