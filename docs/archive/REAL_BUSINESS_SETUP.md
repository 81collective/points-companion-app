# Real-Time Business Data Setup Guide

## Overview
Your app currently shows sample businesses because the Google Places API isn't fully utilized. Follow these steps to get real business data in real-time.

## Step 1: Verify Google Cloud Setup

### 1.1 Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Places API (New)** - For real-time business data
   - **Maps JavaScript API** - For map display
   - **Geocoding API** - For address conversion

### 1.2 Create API Key
1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. Click "Restrict Key" and add restrictions:
   - **HTTP referrers**: Add your domain (e.g., `localhost:3000/*`, `yourdomain.com/*`)
   - **API restrictions**: Select only the APIs you enabled above

### 1.3 Set Up Billing
⚠️ **Important**: Google Places API requires billing to be enabled, even for free tier usage.

## Step 2: Configure Environment Variables

Your `.env.local` already has the Google API key:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBnGTHbKBVhYw96-0R6m7SepOdnhW-GZxM
```

✅ **Test if your API key works**: Visit this URL in your browser (replace LAT/LNG with your location):
```
https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=40.7128,-74.0060&radius=1000&type=restaurant&key=AIzaSyBnGTHbKBVhYw96-0R6m7SepOdnhW-GZxM
```

## Step 3: How the Real-Time Flow Works

### Current API Flow:
1. **User enables location** → Gets GPS coordinates
2. **API called** → `/api/location/nearby?lat=X&lng=Y&category=dining&radius=2000`
3. **Database check** → Searches local `businesses` table first
4. **Google Places fallback** → If few results, calls Google Places API
5. **Store & return** → Saves new businesses to database, returns combined results

### To Get More Real-Time Data:
The API now prioritizes Google Places API over local data. Here's what happens:

1. ✅ **Always calls Google Places API first** (if API key present)
2. ✅ **Stores results in database** for faster future lookups
3. ✅ **Combines with local data** for comprehensive results
4. ❌ **Sample data only used** if no API key AND no local data

## Step 4: Testing Real-Time Data

### 4.1 Test the API Endpoint
```bash
# Test with your actual location coordinates
curl "http://localhost:3000/api/location/nearby?lat=YOUR_LAT&lng=YOUR_LNG&category=dining&radius=2000"
```

### 4.2 Check Browser Console
Open browser dev tools and look for these logs:
```
✅ Google API check: { hasApiKey: true, dbResultCount: X, apiKey: 'Present' }
✅ Fetching from Google Places API...
✅ Google Places API results: 15
✅ Successfully stored 12 new businesses
```

### 4.3 Expected Response
```json
{
  "businesses": [
    {
      "id": "google_ChIJ...",
      "name": "Real Restaurant Name",
      "category": "dining",
      "address": "123 Real Street, Your City",
      "latitude": 40.123,
      "longitude": -74.456,
      "rating": 4.5,
      "price_level": 2,
      "distance": 250
    }
  ],
  "user_location": { "latitude": 40.123, "longitude": -74.456 },
  "success": true
}
```

## Step 5: Troubleshooting

### If you see sample businesses:
1. **Check API key**: Ensure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set
2. **Check billing**: Google Places API requires billing enabled
3. **Check quotas**: You might have exceeded free tier limits
4. **Check restrictions**: API key might be restricted to wrong domains

### Common API Errors:
- `REQUEST_DENIED`: Billing not enabled or API key invalid
- `ZERO_RESULTS`: No businesses in that area (try larger radius)
- `OVER_QUERY_LIMIT`: Exceeded API quotas

### Check Current Status:
Look at browser console when using the app - you'll see detailed logs showing:
- Whether Google API key is present
- Google Places API call results
- How many businesses were found and stored

## Step 6: Production Considerations

### API Key Security:
- Use domain restrictions in production
- Consider server-side API calls for sensitive operations
- Monitor API usage in Google Cloud Console

### Performance:
- Results are cached in your database after first fetch
- React Query caches results for 5 minutes
- Radius and category changes trigger new API calls

### Cost Management:
- Google Places API: $17 per 1,000 requests (after free tier)
- Free tier: $200 credit monthly
- Typical usage: ~10-50 requests per user session

## Result
After setup, your app will show real businesses like:
- ✅ Actual Starbucks locations with real ratings
- ✅ Real gas stations with current prices
- ✅ Genuine restaurants with authentic reviews
- ✅ Live business hours and contact info
- ❌ No more "Sample Coffee Shop" or fake businesses
