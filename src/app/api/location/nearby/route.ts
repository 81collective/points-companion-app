import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

interface GooglePlaceResult {
  name: string;
  vicinity?: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
  rating?: number;
  price_level?: number;
  category?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone_number?: string;
  website?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // Accept both formats: lat/lng and latitude/longitude
    const lat = searchParams.get('lat') || searchParams.get('latitude');
    const lng = searchParams.get('lng') || searchParams.get('longitude');
    const radius = searchParams.get('radius') || '5000'; // Default 5km radius
    const category = searchParams.get('category');

    console.log('Location API called with:', { lat, lng, radius, category });

    if (!lat || !lng) {
      console.log('Missing coordinates');
      return NextResponse.json(
        { error: 'Latitude and longitude are required', success: false },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusMeters = parseInt(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMeters)) {
      console.log('Invalid coordinates:', { latitude, longitude, radiusMeters });
      return NextResponse.json(
        { error: 'Invalid coordinates or radius', success: false },
        { status: 400 }
      );
    }

    console.log('Searching for businesses near:', { latitude, longitude, radiusMeters, category });

    const supabase = createClient();

    // Build query to find nearby businesses (using miles)
    const radiusMiles = radiusMeters / 5280; // Convert feet to miles for bounding box
    let query = supabase
      .from('businesses')
      .select('*')
      .gte('latitude', latitude - (radiusMiles / 69)) // Rough conversion: 1 degree ≈ 69 miles
      .lte('latitude', latitude + (radiusMiles / 69))
      .gte('longitude', longitude - (radiusMiles / (69 * Math.cos(latitude * Math.PI / 180))))
      .lte('longitude', longitude + (radiusMiles / (69 * Math.cos(latitude * Math.PI / 180))));

    // Filter by category if provided
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: businesses, error } = await query.limit(50);

    console.log('Database query result:', { 
      businessCount: businesses?.length || 0, 
      error: error?.message,
      sampleBusiness: businesses?.[0] 
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch businesses', success: false },
        { status: 500 }
      );
    }

    // Calculate exact distances and sort by distance
    const businessesWithDistance = businesses?.map(business => {
      const distance = calculateDistance(
        latitude,
        longitude,
        business.latitude,
        business.longitude
      );
      return {
        ...business,
        distance
      };
    }).filter(business => business.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance) || [];

    // Google Places API configuration for production
    let googlePlaces = [];
    const serverApiKey = process.env.GOOGLE_MAPS_API_KEY; // Server-side key (without NEXT_PUBLIC_)
    const clientApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Client-side key
    const hasGoogleApiKey = !!(serverApiKey || clientApiKey);
    
    console.log('Google API check:', { 
      hasServerKey: !!serverApiKey,
      hasClientKey: !!clientApiKey,
      dbResultCount: businessesWithDistance.length,
      environment: process.env.NODE_ENV
    });

    // Try server-side Google Places API first (production-safe)
    if (serverApiKey) {
      try {
        console.log('Fetching from Google Places API (server-side)...');
        googlePlaces = await fetchGooglePlaces(latitude, longitude, radiusMeters, category, serverApiKey);
        console.log('Google Places API results:', googlePlaces.length);
        
        // Store new places in database for future use
        if (googlePlaces.length > 0) {
          console.log('Sample Google Place:', googlePlaces[0]);
          const newBusinesses = googlePlaces.map((place: GooglePlaceResult) => ({
            name: place.name,
            category: place.category || 'general',
            address: place.address,
            latitude: place.latitude,
            longitude: place.longitude,
            place_id: place.place_id,
            rating: place.rating,
            price_level: place.price_level,
            phone_number: place.phone_number,
            website: place.website
          }));

          // Insert new businesses (ignore conflicts)
          const { error: insertError } = await supabase
            .from('businesses')
            .upsert(newBusinesses, { onConflict: 'place_id', ignoreDuplicates: true });
          
          if (insertError) {
            console.error('Error inserting new businesses:', insertError);
          } else {
            console.log('Successfully stored', newBusinesses.length, 'new businesses');
          }
        }
      } catch (error) {
        console.warn('Server-side Google Places API error:', error);
        
        // Fallback: return instruction for client-side fetch if we have client key
        if (clientApiKey) {
          console.log('Falling back to client-side Google Places instruction');
          return NextResponse.json({
            businesses: businessesWithDistance.slice(0, 50),
            user_location: { latitude, longitude },
            use_client_places: true, // Signal client to fetch additional places
            client_api_available: true,
            success: true
          });
        }
      }
    } else if (clientApiKey) {
      // No server key, return database results + instruction for client-side fetch
      console.log('No server-side API key, instructing client-side fetch');
      return NextResponse.json({
        businesses: businessesWithDistance.slice(0, 50),
        user_location: { latitude, longitude },
        use_client_places: true,
        client_api_available: true,
        success: true
      });
    } else {
      console.log('No Google API key available, using database + sample data only');
      
      // Only use sample data if no local database results AND no Google API
      if (businessesWithDistance.length === 0) {
        const sampleBusinesses = [
          {
            id: 'sample_1',
            name: 'Local Coffee Shop',
            category: 'dining',
            address: 'Near your location',
            latitude: latitude + 0.001,
            longitude: longitude + 0.001,
            rating: 4.2,
            price_level: 2,
            distance: 492, // ~500 feet
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'sample_2',
            name: 'Neighborhood Grocery',
            category: 'groceries',
            address: 'Near your location',
            latitude: latitude - 0.001,
            longitude: longitude - 0.001,
            rating: 4.0,
            price_level: 2,
            distance: 656, // ~650 feet
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'sample_3',
            name: 'Gas Station',
            category: 'gas',
            address: 'Near your location',
            latitude: latitude + 0.002,
            longitude: longitude - 0.002,
            rating: 3.8,
            price_level: 1,
            distance: 984, // ~1000 feet
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        // Filter by category if specified
        const filteredSamples = category && category !== 'all' 
          ? sampleBusinesses.filter(b => b.category === category)
          : sampleBusinesses;
        
        businessesWithDistance.push(...filteredSamples);
        console.log('Added sample businesses:', filteredSamples.length);
      }
    }

    // Combine and deduplicate results
    const allBusinesses = [...businessesWithDistance];
    
    // Add Google Places that aren't already in our database
    googlePlaces.forEach((googlePlace: GooglePlaceResult) => {
      const exists = allBusinesses.some(b => 
        b.place_id === googlePlace.place_id ||
        (googlePlace.latitude && googlePlace.longitude &&
         Math.abs(b.latitude - googlePlace.latitude) < 0.0001 && 
         Math.abs(b.longitude - googlePlace.longitude) < 0.0001)
      );
      
      if (!exists) {
        allBusinesses.push({
          ...googlePlace,
          id: `google_${googlePlace.place_id}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });

    return NextResponse.json({
      businesses: allBusinesses.slice(0, 50), // Limit to 50 results
      user_location: { latitude, longitude },
      success: true
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c * 5280; // Convert miles to feet for consistency
}

// Helper function to fetch from Google Places API
async function fetchGooglePlaces(lat: number, lng: number, radius: number, category?: string | null, providedApiKey?: string) {
  const apiKey = providedApiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.log('No Google API key provided');
    return [];
  }

  // Map our categories to Google Places types
  const categoryMap: { [key: string]: string } = {
    'dining': 'restaurant',
    'groceries': 'grocery_or_supermarket',
    'gas': 'gas_station',
    'shopping': 'shopping_mall',
    'electronics': 'electronics_store',
    'hotels': 'lodging',
    'home_improvement': 'home_goods_store'
  };

  const type = category ? categoryMap[category] || 'establishment' : 'establishment';
  
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;
  
  console.log('Google Places API URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));

  try {
    const response = await fetch(url);
    console.log('Google Places API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Google Places API HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Google Places API response status:', data.status);
    console.log('Google Places API results count:', data.results?.length || 0);
    
    if (data.status !== 'OK') {
      if (data.status === 'ZERO_RESULTS') {
        console.log('Google Places API returned zero results');
        return [];
      }
      throw new Error(`Google Places API status: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    const results = data.results.map((place: GooglePlaceResult) => ({
      name: place.name,
      category: category || 'general',
      address: place.vicinity || place.formatted_address || '',
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      place_id: place.place_id,
      rating: place.rating,
      price_level: place.price_level,
      distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)
    }));
    
    console.log('Processed Google Places results:', results.length);
    return results;
  } catch (error) {
    console.error('Google Places fetch error:', error);
    return [];
  }
}
