import { NextRequest, NextResponse } from 'next/server';
import { categorizeTransaction, batchCategorize } from '@/lib/transactionCategorizer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Accepts either a single transaction or an array
    if (Array.isArray(body)) {
      // Batch mode
      const results = await batchCategorize(body);
      return NextResponse.json({ results });
    } else {
      // Single transaction
      const { merchant, amount, description, userCorrection } = body;
      const result = await categorizeTransaction(merchant, amount, description, userCorrection);
      return NextResponse.json(result);
    }
  } catch (err) {
    return NextResponse.json({
      category: 'other',
      confidence: 0.2,
      reasoning: 'API error, fallback to other',
      source: 'api',
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
