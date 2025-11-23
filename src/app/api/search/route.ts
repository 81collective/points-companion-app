import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireServerSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  const session = await requireServerSession()
  const { searchParams } = new URL(request.url)
  const term = searchParams.get('q')?.trim()

  if (!term) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 })
  }

  const [cards, transactions] = await Promise.all([
    prisma.creditCard.findMany({
      where: {
        userId: session.user!.id,
        name: { contains: term, mode: 'insensitive' }
      },
      select: { id: true, name: true, issuer: true },
      take: 5
    }),
    prisma.transaction.findMany({
      where: {
        userId: session.user!.id,
        merchantName: { contains: term, mode: 'insensitive' }
      },
      select: { id: true, merchantName: true, amount: true, category: true },
      take: 5
    })
  ])

  return NextResponse.json({
    cards,
    transactions: transactions.map((tx) => ({
      ...tx,
      amount: Number(tx.amount)
    }))
  })
}
