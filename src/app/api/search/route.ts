import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { requireServerSession } from '@/lib/auth/session'
import getRequestUrl from '@/lib/getRequestUrl';
import logger from '@/lib/logger';

const log = logger.child({ component: 'search-api' });

// Validation schema
const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100).transform(s => s.trim()),
});

export async function GET(request: NextRequest) {
  const session = await requireServerSession()
  const { searchParams } = getRequestUrl(request);
  
  // Parse and validate
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => { params[key] = value })
  
  const parseResult = SearchQuerySchema.safeParse(params)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Query parameter q is required', details: parseResult.error.flatten().fieldErrors },
      { status: 400 }
    )
  }
  
  const { q: term } = parseResult.data
  log.debug('Search request', { action: 'search', termLength: term.length })

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
