#!/usr/bin/env node

console.log('✈️ Testing Airline Credit Card Recommendations');
console.log('==========================================\n');

// Test data - simulating airline businesses
const testCases = [
  {
    name: 'United Airlines Terminal',
    expectedCard: 'United Explorer or United Quest',
    expectedMultiplier: '2x or 3x'
  },
  {
    name: 'Delta Air Lines Gate',
    expectedCard: 'Delta Gold or Delta Platinum',
    expectedMultiplier: '2x or 3x'
  },
  {
    name: 'American Airlines Counter',
    expectedCard: 'Citi AA Platinum',
    expectedMultiplier: '2x'
  },
  {
    name: 'Southwest Airlines',
    expectedCard: 'Southwest Priority or Plus',
    expectedMultiplier: '2x or 3x'
  },
  {
    name: 'JetBlue Airways',
    expectedCard: 'JetBlue Plus',
    expectedMultiplier: '2x'
  },
  {
    name: 'Alaska Airlines',
    expectedCard: 'Alaska Visa',
    expectedMultiplier: '3x'
  }
];

console.log('🧪 TEST SCENARIOS:');
testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. Business: "${testCase.name}"`);
  console.log(`   Expected: ${testCase.expectedCard} (${testCase.expectedMultiplier} points)`);
  console.log('   ✅ Should prioritize brand-specific airline card');
  console.log('   ✅ Should get +30 brand match bonus\n');
});

console.log('💳 ADDED AIRLINE CARDS:');
console.log('1. United℠ Explorer Card (2x United, $95 AF)');
console.log('2. United Quest℠ Card (3x United, $250 AF)');
console.log('3. Delta SkyMiles® Gold (2x Delta, $99 AF)');
console.log('4. Delta SkyMiles® Platinum (3x Delta, $250 AF)');
console.log('5. Citi® AA Platinum (2x American, $99 AF)');
console.log('6. Southwest Priority (3x Southwest, $149 AF)');
console.log('7. Southwest Plus (2x Southwest, $69 AF)');
console.log('8. JetBlue Plus (2x JetBlue, $99 AF)');
console.log('9. Alaska Airlines Visa (3x Alaska, $95 AF)');

console.log('\n🎯 DETECTION PATTERNS:');
console.log('- United: "united airlines", "united" + "airline"');
console.log('- Delta: "delta", "delta air lines"');
console.log('- American: "american airlines", "american" + "airline"');
console.log('- Southwest: "southwest", "southwest airlines"');
console.log('- JetBlue: "jetblue", "jet blue"');
console.log('- Alaska: "alaska airlines", "alaska" + "airline"');

console.log('\n🚀 READY TO TEST!');
console.log('The airline recommendation system should now work for all major US carriers.');
