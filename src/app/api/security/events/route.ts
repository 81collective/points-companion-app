import { NextResponse } from 'next/server'

// Stub endpoint to prevent ErrorBoundary logging fetch failures.
export async function POST(request: Request) {
  try {
    const data = await request.json().catch(()=>null)
    return NextResponse.json({ received: true, ignored: true, size: data ? JSON.stringify(data).length : 0 }, { status: 202 })
  } catch (err) {
    return NextResponse.json({ received: false, error: err instanceof Error ? err.message : 'unknown' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', mode: 'stub' })
}
