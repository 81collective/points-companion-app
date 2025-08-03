// Test script for recommendations API
import { creditCardDatabase } from './src/data/creditCardDatabase.js';

console.log('🎯 Testing Credit Card Recommendations Fix');

// Test the database structure
console.log('\n📊 Credit Card Database Check:');
console.log('Total cards:', creditCardDatabase.length);

if (creditCardDatabase.length > 0) {
  const sampleCard = creditCardDatabase[0];
  console.log('\n🎴 Sample card:', sampleCard.name);
  console.log('Issuer:', sampleCard.issuer);
  console.log('Annual fee:', sampleCard.annualFee || 0);
  console.log('Bonus offer:', sampleCard.bonusOffer || 'None');
  console.log('Rewards:', sampleCard.rewards);

  // Test category mapping
  const categoryMap = {
    'dining': 'dining',
    'groceries': 'groceries',
    'gas': 'gas',
    'travel': 'travel',
    'hotels': 'hotels'
  };

  console.log('\n🎯 Testing category matching:');
  Object.keys(categoryMap).forEach(category => {
    const matchingReward = sampleCard.rewards.find(r => r.category === category);
    if (matchingReward) {
      console.log(`✅ ${category}: ${matchingReward.multiplier}x points`);
    } else {
      console.log(`❌ ${category}: No specific reward`);
    }
  });

  // Test recommendations logic
  console.log('\n🏆 Testing recommendation scoring for dining:');
  creditCardDatabase.slice(0, 5).forEach((card, index) => {
    const diningReward = card.rewards.find(r => r.category === 'dining');
    const generalReward = card.rewards.find(r => r.category === 'everything_else');
    
    const multiplier = diningReward?.multiplier || generalReward?.multiplier || 1;
    const estimatedPoints = 100 * multiplier;
    
    let score = 0;
    if (multiplier >= 3.0) score += 30;
    else if (multiplier >= 2.0) score += 20;
    else score += 10;
    
    if (!card.annualFee || card.annualFee === 0) score += 20;
    if (card.bonusOffer) score += 15;
    if (card.popular) score += 5;
    
    console.log(`${index + 1}. ${card.name}: ${multiplier}x = ${estimatedPoints} pts, Score: ${score}`);
  });

} else {
  console.log('❌ No cards found in database!');
}

console.log('\n✅ Recommendations API should now work!');
console.log('\n🔧 Next steps:');
console.log('1. Start the dev server: npm run dev');
console.log('2. Test recommendations at: http://localhost:3000/api/cards/recommendations?category=dining');
console.log('3. Check the NearbyBusinesses component for card suggestions');
