#!/usr/bin/env node

console.log('🔍 Debugging Marriott Hotel Selection Issue');
console.log('==========================================\n');

// Test the brand detection logic
function testBrandDetection() {
  console.log('🧪 Testing Business Name Brand Detection:');
  
  const testBusinesses = [
    'Marriott Downtown Hotel',
    'Hilton Garden Inn',
    'Marriott Bonvoy Resort',
    'Courtyard by Marriott',
    'Residence Inn by Marriott',
    'The Ritz-Carlton (Marriott)',
    'Hilton Hotels & Resorts'
  ];

  testBusinesses.forEach(businessName => {
    const name = businessName.toLowerCase();
    let detectedBrand = 'none';
    
    if (name.includes('marriott') || name.includes('bonvoy')) {
      detectedBrand = 'marriott';
    } else if (name.includes('hilton')) {
      detectedBrand = 'hilton';
    }
    
    console.log(`"${businessName}" → Detected: ${detectedBrand}`);
  });
}

testBrandDetection();

console.log('\n🔎 POTENTIAL ISSUES TO CHECK:');
console.log('1. React Query Cache: Previous recommendations may be cached');
console.log('2. Business Selection State: selectedBusiness may not be updating');
console.log('3. API Parameters: businessName may not be reaching the API');
console.log('4. Brand Detection: Marriott detection logic may not be working');
console.log('5. Query Key: useCardRecommendations may not be re-fetching');

console.log('\n🛠️ DEBUGGING STEPS:');
console.log('1. Open browser console and look for:');
console.log('   - "🎯 Selected business for recommendations:" log');
console.log('   - "🎯 Recommendations API called with:" log');
console.log('   - "🏢 Created temporary business object for:" log');

console.log('\n2. Check Network tab for API calls to:');
console.log('   - /api/cards/recommendations?category=hotels&businessName=Marriott...');

console.log('\n3. Verify business selection triggers state change:');
console.log('   - Click Marriott hotel');
console.log('   - Check if selectedBusiness state updates');
console.log('   - Check if useCardRecommendations hook re-runs');

console.log('\n4. Test API directly:');
console.log('   curl "http://localhost:3000/api/cards/recommendations?category=hotels&businessName=Marriott%20Downtown"');

console.log('\n🎯 Expected Behavior:');
console.log('✅ Click Marriott hotel → API called with businessName=Marriott Downtown');
console.log('✅ Brand detection finds "marriott" in business name');
console.log('✅ Marriott reward cards get +30 brand bonus');
console.log('✅ Chase Marriott Bonvoy cards appear at top of recommendations');

console.log('\n🚨 If still showing Hilton cards, check:');
console.log('- React Query cache not invalidating');
console.log('- selectedBusiness state not updating properly');
console.log('- Business name not being passed to API correctly');
