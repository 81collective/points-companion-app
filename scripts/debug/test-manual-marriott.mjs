#!/usr/bin/env node

console.log('🧪 Manual Marriott API Test');
console.log('==========================\n');

async function testMarriottAPI() {
  try {
    // Test 1: Direct API call with Marriott business name
    const testUrl = new URL('http://localhost:3000/api/cards/recommendations');
    testUrl.searchParams.set('category', 'hotels');
    testUrl.searchParams.set('businessName', 'Marriott Downtown Hotel');
    testUrl.searchParams.set('lat', '33.6330752');
    testUrl.searchParams.set('lng', '-111.9158272');
    
    console.log('📞 Testing Marriott API call:');
    console.log('URL:', testUrl.toString());
    
    const response = await fetch(testUrl.toString());
    
    if (!response.ok) {
      console.log('❌ API Response Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      return;
    }
    
    const data = await response.json();
    
    if (data.success && data.recommendations) {
      console.log('✅ API Success! Found', data.recommendations.length, 'recommendations');
      
      console.log('\n🏆 Top 5 Recommendations:');
      data.recommendations.slice(0, 5).forEach((rec, index) => {
        const isMarriott = rec.card.card_name.toLowerCase().includes('marriott');
        const badge = isMarriott ? '🎯 MARRIOTT' : '  ';
        console.log(`${index + 1}. ${badge} ${rec.card.card_name}`);
        console.log(`   Score: ${rec.match_score} | Value: $${rec.annual_value || 0}`);
        console.log(`   Reasons: ${rec.reasons?.join(', ') || 'N/A'}`);
        console.log('');
      });
      
      // Check if Marriott cards are at the top
      const topCard = data.recommendations[0];
      if (topCard.card.card_name.toLowerCase().includes('marriott')) {
        console.log('✅ SUCCESS: Marriott card is #1 recommendation!');
      } else {
        console.log('❌ ISSUE: Top card is not Marriott');
        console.log('   Top card:', topCard.card.card_name);
        console.log('   This suggests brand detection may not be working');
      }
    } else {
      console.log('❌ API returned no recommendations');
      console.log('Response:', data);
    }
    
  } catch (error) {
    console.log('❌ API Test Failed:', error.message);
    console.log('\n💡 Is your dev server running? Try: npm run dev');
  }
}

// Test 2: Compare with Hilton
async function testHiltonAPI() {
  try {
    console.log('\n🧪 Testing Hilton for comparison...');
    
    const testUrl = new URL('http://localhost:3000/api/cards/recommendations');
    testUrl.searchParams.set('category', 'hotels');
    testUrl.searchParams.set('businessName', 'Hilton Garden Inn');
    testUrl.searchParams.set('lat', '33.6330752');
    testUrl.searchParams.set('lng', '-111.9158272');
    
    const response = await fetch(testUrl.toString());
    const data = await response.json();
    
    if (data.success && data.recommendations?.length > 0) {
      const topCard = data.recommendations[0];
      console.log('🏨 Hilton top card:', topCard.card.card_name);
      
      if (topCard.card.card_name.toLowerCase().includes('hilton')) {
        console.log('✅ Hilton brand detection works correctly');
      } else {
        console.log('❌ Hilton brand detection also has issues');
      }
    }
  } catch (error) {
    console.log('❌ Hilton test failed:', error.message);
  }
}

console.log('Starting API tests...\n');
testMarriottAPI().then(() => testHiltonAPI());
