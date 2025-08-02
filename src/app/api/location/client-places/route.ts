import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
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
    console.error('API error:', err);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    });
  }
}
