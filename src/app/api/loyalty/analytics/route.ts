import { NextResponse } from 'next/server';

// Analytics endpoint disabled for user privacy: return 410 Gone with no analytics data
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Analytics endpoint disabled',
    },
    { status: 410 },
  );
}
