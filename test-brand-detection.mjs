// Test Brand Detection for Credit Card Recommendations
// This script tests if the brand detection logic is working correctly

console.log('🧪 Testing Brand-Specific Credit Card Recommendations\n');

const testBusinesses = [
  { name: 'Marriott Downtown Hotel', category: 'hotels', expectedBrand: 'Marriott' },
  { name: 'Courtyard by Marriott', category: 'hotels', expectedBrand: 'Marriott' },
  { name: 'Residence Inn by Marriott', category: 'hotels', expectedBrand: 'Marriott' },
  { name: 'Hilton Garden Inn', category: 'hotels', expectedBrand: 'Hilton' },
  { name: 'DoubleTree by Hilton', category: 'hotels', expectedBrand: 'Hilton' },
  { name: 'Hampton Inn & Suites', category: 'hotels', expectedBrand: 'Hilton' },
  { name: 'Hyatt Place Downtown', category: 'hotels', expectedBrand: 'Hyatt' },
  { name: 'Grand Hyatt', category: 'hotels', expectedBrand: 'Hyatt' },
  { name: 'Holiday Inn Express', category: 'hotels', expectedBrand: 'IHG' },
  { name: 'Regular Hotel (No Brand)', category: 'hotels', expectedBrand: 'Generic' }
];

async function testBrandDetection() {
  console.log('📍 Testing with coordinates: 40.7128, -74.0060 (NYC)\n');
  
  for (const business of testBusinesses) {
    console.log(`🏨 Testing: "${business.name}"`);
    console.log(`   Expected brand: ${business.expectedBrand}`);
    
    try {
      const testUrl = new URL('http://localhost:3000/api/cards/recommendations');
      testUrl.searchParams.set('category', business.category);
      testUrl.searchParams.set('businessName', business.name);
      testUrl.searchParams.set('lat', '40.7128');
      testUrl.searchParams.set('lng', '-74.0060');
      
      const response = await fetch(testUrl.toString());
      
      if (!response.ok) {
        console.log(`   ❌ API Error: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.success && data.recommendations && data.recommendations.length > 0) {
        const topCard = data.recommendations[0];
        console.log(`   ✅ Top recommendation: ${topCard.card.card_name}`);
        console.log(`   📊 Match score: ${topCard.match_score}%`);
        
        if (topCard.reasons && topCard.reasons.length > 0) {
          console.log(`   💡 Reasons: ${topCard.reasons.join(', ')}`);
          
          // Check if brand-specific logic worked
          const hasBrandMatch = topCard.reasons.some(reason => 
            reason.includes('brand card') || 
            reason.includes('Perfect for')
          );
          
          if (hasBrandMatch) {
            console.log(`   🎯 SUCCESS: Brand-specific detection worked!`);
          } else if (business.expectedBrand !== 'Generic') {
            console.log(`   ⚠️  Warning: Expected brand match but got generic recommendation`);
          }
        }
        
        console.log(`   🏆 Top 3 cards:`);
        data.recommendations.slice(0, 3).forEach((rec, index) => {
          console.log(`      ${index + 1}. ${rec.card.card_name} - ${rec.match_score}% match`);
        });
      } else {
        console.log(`   ❌ No recommendations returned`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

// Run the test
console.log('🚀 Starting brand detection test...\n');
console.log('⚠️  Make sure your development server is running on http://localhost:3000\n');

testBrandDetection().then(() => {
  console.log('✅ Brand detection test completed!');
}).catch(error => {
  console.error('❌ Test failed:', error);
});
