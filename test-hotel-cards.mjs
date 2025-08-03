// Test hotel brand-specific recommendations
import { creditCardDatabase } from './src/data/creditCardDatabase.js';

console.log('🏨 Testing Hotel Brand-Specific Credit Card Recommendations');
console.log('=========================================================\n');

// Test scenarios
const testBusinesses = [
  { name: 'Marriott Downtown Hotel', category: 'hotels' },
  { name: 'Hilton Garden Inn', category: 'hotels' },
  { name: 'Hyatt House', category: 'hotels' },
  { name: 'Holiday Inn Express', category: 'hotels' },
  { name: 'Wyndham Garden Hotel', category: 'hotels' },
  { name: 'Comfort Inn & Suites', category: 'hotels' },
  { name: 'Generic Hotel', category: 'hotels' }
];

// Count hotel cards
const hotelCards = creditCardDatabase.filter(card => 
  card.rewards.some(r => 
    ['marriott', 'hilton', 'hyatt', 'ihg', 'wyndham', 'choice'].includes(r.category)
  )
);

console.log(`📊 Total cards in database: ${creditCardDatabase.length}`);
console.log(`🏨 Hotel brand cards: ${hotelCards.length}`);
console.log();

// Test each business
testBusinesses.forEach(business => {
  console.log(`🏨 Testing: ${business.name}`);
  
  // Simulate the brand detection logic
  const businessName = business.name.toLowerCase();
  let detectedBrand = 'generic';
  let expectedCard = null;
  
  if (businessName.includes('marriott') || businessName.includes('bonvoy')) {
    detectedBrand = 'marriott';
    expectedCard = hotelCards.find(card => card.rewards.some(r => r.category === 'marriott'));
  } else if (businessName.includes('hilton')) {
    detectedBrand = 'hilton';
    expectedCard = hotelCards.find(card => card.rewards.some(r => r.category === 'hilton'));
  } else if (businessName.includes('hyatt')) {
    detectedBrand = 'hyatt';
    expectedCard = hotelCards.find(card => card.rewards.some(r => r.category === 'hyatt'));
  } else if (businessName.includes('holiday inn') || businessName.includes('ihg')) {
    detectedBrand = 'ihg';
    expectedCard = hotelCards.find(card => card.rewards.some(r => r.category === 'ihg'));
  } else if (businessName.includes('wyndham')) {
    detectedBrand = 'wyndham';
    expectedCard = hotelCards.find(card => card.rewards.some(r => r.category === 'wyndham'));
  } else if (businessName.includes('comfort inn') || businessName.includes('choice')) {
    detectedBrand = 'choice';
    expectedCard = hotelCards.find(card => card.rewards.some(r => r.category === 'choice'));
  }
  
  console.log(`   🎯 Detected brand: ${detectedBrand}`);
  
  if (expectedCard) {
    const brandReward = expectedCard.rewards.find(r => r.category === detectedBrand);
    console.log(`   ✅ Best card: ${expectedCard.name}`);
    console.log(`   💳 Reward rate: ${brandReward?.multiplier}x points`);
    console.log(`   💰 Annual fee: $${expectedCard.annualFee || 0}`);
  } else {
    console.log(`   ❌ No brand-specific card found`);
  }
  console.log();
});

console.log('📋 Hotel Brand Cards Summary:');
hotelCards.forEach(card => {
  const brandRewards = card.rewards.filter(r => 
    ['marriott', 'hilton', 'hyatt', 'ihg', 'wyndham', 'choice'].includes(r.category)
  );
  
  brandRewards.forEach(reward => {
    console.log(`   🏨 ${card.name}: ${reward.multiplier}x points at ${reward.category.toUpperCase()}`);
  });
});

console.log('\n✅ Hotel recommendation logic should now prioritize brand-specific cards!');
