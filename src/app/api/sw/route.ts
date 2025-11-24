import { NextRequest, NextResponse } from 'next/server';
import getRequestUrl from '@/lib/getRequestUrl';

// Service Worker API endpoint for background sync and updates
export async function GET(request: NextRequest) {
  const { searchParams } = getRequestUrl(request);
  const action = searchParams.get('action');

  if (action === 'sync') {
    // Handle background sync requests
    try {
      // Simulate syncing data
      const syncResult = {
        success: true,
        timestamp: new Date().toISOString(),
        data: 'Background sync completed successfully'
      };

      return NextResponse.json(syncResult);
    } catch (error) {
      return NextResponse.json(
        { error: 'Sync failed', details: error },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: 'Service Worker API' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'BACKGROUND_SYNC':
        // Handle background sync data
        console.log('Background sync data:', data);
        return NextResponse.json({ success: true });

      case 'PUSH_NOTIFICATION':
        // Handle push notification setup
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request', details: error },
      { status: 400 }
    );
  }
}
