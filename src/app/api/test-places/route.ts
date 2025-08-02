import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'Google API key not configured',
      setup_needed: true
    });
  }

  try {
    // Test with a known location (Times Square, NYC)
    const testLat = 40.7580;
    const testLng = -73.9855;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${testLat},${testLng}&radius=1000&type=restaurant&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return NextResponse.json({
      success: data.status === 'OK',
      status: data.status,
      results_count: data.results?.length || 0,
      sample_business: data.results?.[0]?.name || null,
      error_message: data.error_message || null,
      api_key_working: response.ok,
      test_location: 'Times Square, NYC'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to test Google Places API',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
