#!/usr/bin/env node

console.log('🔍 MARRIOTT SELECTION DEBUGGING GUIDE');
console.log('=====================================\n');

console.log('🎯 WHAT TO TEST:');
console.log('1. Go to your app (should be running on localhost:3000)');
console.log('2. Enable location permissions');
console.log('3. Select "Hotels" category');
console.log('4. Find a Marriott hotel in the list');
console.log('5. Click on the Marriott hotel');
console.log('6. Watch the browser console for these logs:\n');

console.log('📋 EXPECTED CONSOLE LOGS (in order):');
console.log('✅ "🏢 Business selected - BEFORE setSelectedBusiness:" with Marriott data');
console.log('✅ "🏢 Business selected - AFTER setSelectedBusiness"');
console.log('✅ "🎯 Selected business for recommendations:" with Marriott details');
console.log('✅ "🎯 useCardRecommendations API call:" with businessName = Marriott hotel name');
console.log('✅ "🌐 Calling recommendations API:" with full URL including businessName');
console.log('✅ "🎯 Recommendations API called with:" from server');
console.log('✅ "🏢 Created temporary business object for:" Marriott hotel name');
console.log('✅ "🏨 Checking business for brand detection:" marriott hotel name (lowercase)');
console.log('✅ "🎯 MARRIOTT DETECTED! Looking for Marriott rewards on card:" for each card');
console.log('✅ "✅ Found Marriott reward on Chase Marriott..." with multiplier');

console.log('\n🚨 POTENTIAL ISSUES TO LOOK FOR:');
console.log('❌ If you don\'t see "🏢 Business selected" logs → Click handler not working');
console.log('❌ If businessName is undefined → Business object structure issue');
console.log('❌ If API not called → React Query enabled condition failing');
console.log('❌ If no "MARRIOTT DETECTED" → Brand detection not working');
console.log('❌ If "No Marriott reward found" → Card database missing Marriott cards');

console.log('\n🧪 MANUAL API TEST:');
console.log('Run this to test the API directly:');
console.log('node test-manual-marriott.mjs');

console.log('\n🎯 WHAT SHOULD HAPPEN:');
console.log('After clicking Marriott hotel, recommendations should update to show:');
console.log('1. Chase Marriott Bonvoy Boundless (6x Marriott, $95 AF)');
console.log('2. Chase Marriott Bonvoy Bold (4x Marriott, $0 AF)');
console.log('These should appear at the TOP of the recommendations list.');

console.log('\n🔧 IF STILL NOT WORKING:');
console.log('1. Check if you\'re actually clicking a Marriott hotel (name contains "Marriott")');
console.log('2. Verify you\'re in the "Hotels" category when clicking');
console.log('3. Look for any React errors in console');
console.log('4. Check Network tab for failed API calls');

console.log('\n🚀 Ready to debug! Open browser console and follow the steps above.');
