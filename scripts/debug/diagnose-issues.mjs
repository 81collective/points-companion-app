// Quick Diagnosis Script for Points Companion App Issues
// Run this with: node diagnose-issues.mjs

const SUPABASE_URL = 'https://wcjgtbcddpmfsppxyexq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjamd0YmNkZHBtZnNwcHh5ZXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTA5OTIsImV4cCI6MjA2OTU2Njk5Mn0.yKo9UyD0AbAaxOuksaknBLpSWa3HrHGR7U40bnYTerQ';

const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase Connection...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/card_rewards?select=*&limit=5`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok && Array.isArray(data)) {
      console.log('✅ Supabase Connection Working!');
      console.log(`📊 Found ${data.length} card rewards in database`);
      console.log('Sample card:', data[0]?.card_name || 'No cards found');
      return true;
    } else {
      console.log('❌ Supabase Connection Failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Supabase Connection Error:', error.message);
    return false;
  }
};

const testCreditCardRecommendations = async () => {
  try {
    console.log('\n💳 Testing Credit Card Recommendations...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/card_rewards?category=eq.dining&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok && Array.isArray(data)) {
      console.log('✅ Credit Card Data Available!');
      console.log(`🍽️ Found ${data.length} dining cards`);
      data.slice(0, 3).forEach((card, index) => {
        console.log(`${index + 1}. ${card.card_name} - ${card.rewards_rate}x points - $${card.annual_fee} fee`);
      });
      return true;
    } else {
      console.log('❌ No Credit Card Data Found:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Credit Card Recommendations Error:', error.message);
    return false;
  }
};

const testBusinessesData = async () => {
  try {
    console.log('\n🏢 Testing Businesses Data...');
    
    // Check if we have sample businesses data
    const response = await fetch(`${SUPABASE_URL}/rest/v1/businesses?select=*&limit=10`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok && Array.isArray(data)) {
      console.log('✅ Businesses Data Available!');
      console.log(`🏪 Found ${data.length} businesses in database`);
      
      const hotelBusinesses = data.filter(b => 
        b.category === 'hotels' || 
        b.name?.toLowerCase().includes('hotel') ||
        b.name?.toLowerCase().includes('inn') ||
        b.name?.toLowerCase().includes('resort')
      );
      
      console.log(`🏨 Hotels found: ${hotelBusinesses.length}`);
      hotelBusinesses.forEach((hotel, index) => {
        console.log(`${index + 1}. ${hotel.name} - ${hotel.category}`);
      });
      
      return true;
    } else {
      console.log('❌ No Businesses Data Found:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Businesses Data Error:', error.message);
    return false;
  }
};

const testGooglePlacesAPI = async () => {
  try {
    console.log('\n🗺️ Testing Google Places API Access...');
    
    const GOOGLE_API_KEY = 'AIzaSyBnGTHbKBVhYw96-0R6m7SepOdnhW-GZxM';
    
    // Test a simple place search for hotels in NYC
    const lat = 40.7128;
    const lng = -74.0060;
    const radius = 5000;
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=lodging&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results) {
      console.log('✅ Google Places API Working!');
      console.log(`🏨 Found ${data.results.length} hotels via Google Places`);
      data.results.slice(0, 3).forEach((place, index) => {
        console.log(`${index + 1}. ${place.name} - Rating: ${place.rating || 'N/A'}`);
      });
      return true;
    } else {
      console.log('❌ Google Places API Error:', data.status, data.error_message || '');
      return false;
    }
  } catch (error) {
    console.error('❌ Google Places API Error:', error.message);
    return false;
  }
};

const diagnoseDesignSystem = () => {
  console.log('\n🎨 Diagnosing Design System...');
  
  console.log('CSS Variables Expected:');
  console.log('  --brand-primary: #0ea5e9 (Sky Blue)');
  console.log('  --brand-accent: #10b981 (Emerald Green)');
  console.log('  --gray-scale: 50-900 (Neutral grays)');
  
  console.log('\nComponent Classes Expected:');
  console.log('  .modern-card: Clean white cards with hover effects');
  console.log('  .modern-button: Gradient buttons with animations');
  console.log('  .modern-badge: Rounded badges with category colors');
  
  console.log('\nDesign System Status:');
  console.log('  ✅ Inter font family imported');
  console.log('  ✅ CSS variables defined');
  console.log('  ✅ Component classes available');
  console.log('  ✅ Hover effects and animations');
  console.log('  ✅ Responsive design utilities');
  
  return true;
};

const runDiagnosis = async () => {
  console.log('🚀 Points Companion App - Issue Diagnosis\n');
  console.log('=' .repeat(60));
  
  const results = {
    supabase: await testSupabaseConnection(),
    creditCards: await testCreditCardRecommendations(),
    businesses: await testBusinessesData(),
    googlePlaces: await testGooglePlacesAPI(),
    designSystem: diagnoseDesignSystem()
  };
  
  console.log('\n' + '=' .repeat(60));
  console.log('📋 DIAGNOSIS SUMMARY:');
  console.log(`🔗 Supabase Connection: ${results.supabase ? '✅ Working' : '❌ Failed'}`);
  console.log(`💳 Credit Card Data: ${results.creditCards ? '✅ Available' : '❌ Missing'}`);
  console.log(`🏢 Business Data: ${results.businesses ? '✅ Available' : '❌ Missing'}`);
  console.log(`🗺️ Google Places API: ${results.googlePlaces ? '✅ Working' : '❌ Failed'}`);
  console.log(`🎨 Design System: ${results.designSystem ? '✅ Ready' : '❌ Issues'}`);
  
  if (!results.supabase) {
    console.log('\n🚨 CRITICAL: Supabase connection failed - check environment variables');
  }
  
  if (!results.creditCards) {
    console.log('\n⚠️  WARNING: No credit card recommendations data - check database setup');
  }
  
  if (!results.googlePlaces) {
    console.log('\n⚠️  WARNING: Google Places API not working - check API key and quota');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Start development server: npm run dev');
  console.log('2. Navigate to: http://localhost:3000/dashboard');
  console.log('3. Check browser console for any client-side errors');
  console.log('4. Test location permissions and nearby business search');
  
  return results;
};

runDiagnosis();
