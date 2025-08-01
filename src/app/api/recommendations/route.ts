import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import type { RecommendationRequest, RecommendationResponse } from '@/types/recommendation.types'

let lastRequestTime = 0
const RATE_LIMIT_MS = 2000

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
    const prompt = `Given the following user transactions and credit cards, recommend the best card for each transaction.\nTransactions: ${JSON.stringify(body.transactions)}\nCards: ${JSON.stringify(body.cards)}\nReturn recommendations as an array of objects with cardId, cardName, reason, and score.`

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
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse recommendations.' }, { status: 500 })
    }

    return NextResponse.json({ recommendations })
  } catch (error) {
    return NextResponse.json({ error: 'OpenAI API error', details: String(error) }, { status: 500 })
  }
}
