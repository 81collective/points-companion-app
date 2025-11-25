import { NextRequest, NextResponse } from 'next/server'
import getRequestUrl from '@/lib/getRequestUrl'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { requireServerSession, getOptionalServerSession } from '@/lib/auth/session'
import { getOpenAIClient, isOpenAIConfigured } from '@/lib/openai-server'
import type { RecommendationRequest, RecommendationResponse } from '@/types/recommendation.types'
import { logger } from '@/lib/logger'

let lastRequestTime = 0
const RATE_LIMIT_MS = 2000

function parseJsonDetails(value: unknown): Prisma.InputJsonValue {
  try {
    return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue
  } catch {
    return {}
  }
}

function serializeRecommendation(record: NonNullable<Awaited<ReturnType<typeof prisma.recommendation.findFirst>>>) {
  return {
    id: record.id,
    userId: record.userId,
    transactionId: record.transactionId,
    transactionDetails: record.transactionDetails ?? {},
    recommendedCard: record.recommendedCard,
    actualCardUsed: record.actualCardUsed,
    pointsEarned: record.pointsEarned,
    feedback: record.feedback,
    feedbackScore: record.feedbackScore,
    createdAt: record.createdAt.toISOString()
  }
}

export async function GET(request: NextRequest) {
  const session = await requireServerSession()

    const { searchParams } = getRequestUrl(request);
  const limitParam = Number(searchParams.get('limit') ?? '100')
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(Math.floor(limitParam), 1), 500) : 100

  const recommendations = await prisma.recommendation.findMany({
    where: { userId: session.user!.id },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return NextResponse.json({ recommendations: recommendations.map(serializeRecommendation) })
}

export async function POST(req: NextRequest) {
  const now = Date.now()
  if (now - lastRequestTime < RATE_LIMIT_MS) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  lastRequestTime = now

  let body: RecommendationRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    if (!isOpenAIConfigured) {
      return NextResponse.json({ recommendations: [] })
    }

    const prompt = `Given the following user transactions and credit cards, recommend the best card for each transaction.\nTransactions: ${JSON.stringify(body.transactions)}\nCards: ${JSON.stringify(body.cards)}\nReturn recommendations as an array of objects with cardId, cardName, reason, and score.`

    const openai = getOpenAIClient()
    if (!openai) {
      return NextResponse.json({ recommendations: [] })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for credit card recommendations.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 512,
      temperature: 0.7,
    })

    const text = completion.choices[0]?.message?.content
    let recommendations: RecommendationResponse['recommendations'] = []
    try {
      recommendations = JSON.parse(text || '[]')
    } catch {
      return NextResponse.json({ error: 'Failed to parse recommendations.' }, { status: 500 })
    }

    const session = await getOptionalServerSession()
    if (session?.user?.id && recommendations.length) {
      const transactionDetails = Array.isArray(body.transactions) ? body.transactions : []
      const batchedCreates = recommendations.slice(0, 10).map((rec, index) =>
        prisma.recommendation.create({
          data: {
            userId: session.user!.id,
            transactionDetails: parseJsonDetails(transactionDetails[index] ?? { source: 'ai-route' }),
            recommendedCard: rec.cardName || rec.cardId || 'unidentified-card',
            actualCardUsed: null,
            pointsEarned: Number.isFinite(rec.score) ? Math.round(rec.score) : null,
            feedback: null,
            feedbackScore: null
          }
        })
      )

      try {
        await prisma.$transaction(batchedCreates)
      } catch (error) {
        logger.warn('Failed to persist AI recommendation response', { error, route: '/api/recommendations' });
      }
    }

    return NextResponse.json({ recommendations })
  } catch (error) {
    return NextResponse.json({ error: 'OpenAI API error', details: String(error) }, { status: 500 })
  }
}
