import { NextRequest, NextResponse } from 'next/server';
import getRequestUrl from '@/lib/getRequestUrl';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = getRequestUrl(request);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const category = searchParams.get('category') || 'restaurant';
    const radius = searchParams.get('radius') || '2000';

    if (!lat || !lng) {
      return NextResponse.json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    // Return coordinates for client-side Google Places call
    // This bypasses the referer restriction issue
    return NextResponse.json({
      success: true,
      coordinates: {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      },
      category,
      radius: parseInt(radius),
      // Return a flag indicating client should call Google Places directly
      use_client_side_places: true
    });

  } catch (err) {
    logger.error('Client places API error', { error: err, route: '/api/location/client-places' });
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    });
  }
}
