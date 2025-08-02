// Test script to verify the two fixes
// 1. Credit card recommendations for selected businesses
// 2. Hotels category displaying businesses

const testRecommendations = async () => {
  try {
    console.log('Testing credit card recommendations API...');
    
    // Test with dining category (should have recommendations)
    const response = await fetch('http://localhost:3000/api/cards/recommendations?category=dining');
    const data = await response.json();
    
    console.log('Recommendations API response:', {
      success: data.success,
      recommendationsCount: data.recommendations?.length || 0,
      sampleRecommendation: data.recommendations?.[0]
    });
    
    if (data.recommendations && data.recommendations.length > 0) {
      console.log('✅ Credit card recommendations are working!');
      console.log('Sample recommendation:', {
        cardName: data.recommendations[0].card?.card_name,
        matchScore: data.recommendations[0].match_score,
        annualValue: data.recommendations[0].annual_value
      });
    } else {
      console.log('❌ No credit card recommendations found');
    }
    
  } catch (error) {
    console.error('❌ Error testing recommendations:', error.message);
  }
};

const testHotelsCategory = async () => {
  try {
    console.log('\nTesting hotels category...');
    
    // Use NYC coordinates where sample hotel data exists
    const lat = 40.7128;
    const lng = -74.0060;
    
    const response = await fetch(`http://localhost:3000/api/location/nearby?lat=${lat}&lng=${lng}&radius=5000&category=hotels`);
    const data = await response.json();
    
    console.log('Hotels API response:', {
      success: data.success,
      businessCount: data.businesses?.length || 0,
      businesses: data.businesses?.map(b => ({ name: b.name, category: b.category }))
    });
    
    const hotelBusinesses = data.businesses?.filter(b => b.category === 'hotels' || b.name.toLowerCase().includes('hotel'));
    
    if (hotelBusinesses && hotelBusinesses.length > 0) {
      console.log('✅ Hotels category is working!');
      console.log('Found hotels:', hotelBusinesses.map(h => h.name));
    } else {
      console.log('❌ No hotels found in category');
    }
    
  } catch (error) {
    console.error('❌ Error testing hotels category:', error.message);
  }
};

const testBothFixes = async () => {
  console.log('🧪 Testing both fixes...\n');
  await testRecommendations();
  await testHotelsCategory();
  console.log('\n✅ Test completed!');
};

testBothFixes();
