#!/usr/bin/env node

console.log('🧪 Testing Marriott Recommendations API');
console.log('=====================================\n');

async function testMarriottAPI() {
  try {
    // Test with a Marriott hotel business name
    const testUrl = 'http://localhost:3000/api/cards/recommendations?category=hotels&businessName=Marriott%20Downtown%20Hotel&lat=40.7128&lng=-74.0060';
    
    console.log('📞 Calling API:', testUrl);
    
    const response = await fetch(testUrl);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API Response Success!');
      console.log('Number of recommendations:', data.recommendations?.length || 0);
      
      if (data.recommendations && data.recommendations.length > 0) {
        console.log('\n🏆 Top 3 Recommendations:');
        data.recommendations.slice(0, 3).forEach((rec, index) => {
          console.log(`${index + 1}. ${rec.card.card_name}`);
          console.log(`   Match Score: ${rec.match_score}`);
          console.log(`   Reasons: ${rec.reasons?.join(', ') || 'N/A'}`);
          console.log(`   Annual Value: $${rec.annual_value || 0}`);
          console.log('');
        });
        
        // Check if Marriott cards are at the top
        const topCard = data.recommendations[0];
        if (topCard.card.card_name.toLowerCase().includes('marriott')) {
          console.log('✅ SUCCESS: Marriott card is recommended first!');
        } else {
          console.log('❌ ISSUE: Top card is not a Marriott card');
          console.log('Top card:', topCard.card.card_name);
        }
      } else {
        console.log('❌ No recommendations returned');
      }
    } else {
      console.log('❌ API Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Failed to call API:', error.message);
    console.log('\n💡 Make sure the development server is running:');
    console.log('   npm run dev');
  }
}

// Test Hilton for comparison
async function testHiltonAPI() {
  try {
    console.log('\n🧪 Testing Hilton for comparison...');
    const testUrl = 'http://localhost:3000/api/cards/recommendations?category=hotels&businessName=Hilton%20Garden%20Inn&lat=40.7128&lng=-74.0060';
    
    const response = await fetch(testUrl);
    const data = await response.json();
    
    if (data.success && data.recommendations?.length > 0) {
      const topCard = data.recommendations[0];
      console.log('🏨 Hilton top recommendation:', topCard.card.card_name);
      
      if (topCard.card.card_name.toLowerCase().includes('hilton')) {
        console.log('✅ Hilton brand detection working correctly');
      } else {
        console.log('❌ Hilton brand detection may have issues');
      }
    }
  } catch (error) {
    console.log('❌ Hilton test failed:', error.message);
  }
}

console.log('Starting API tests...\n');
testMarriottAPI().then(() => testHiltonAPI());
