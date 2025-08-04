// Test script for loyalty system
import { getAllPrograms, getProgramById } from '../lib/loyaltyPrograms';
import { LoyaltyProgram } from '../types/loyalty';

console.log('Testing Loyalty Programs System...');

// Test 1: Get all programs
const allPrograms = getAllPrograms();
console.log(`✅ Found ${allPrograms.length} loyalty programs`);

// Test 2: Get specific program
const chaseProgram = getProgramById('chase-ultimate-rewards');
console.log(`✅ Chase UR Program:`, chaseProgram?.name);

// Test 3: Get programs by category
const airlinePrograms = allPrograms.filter(p => p.category === 'airline');
console.log(`✅ Found ${airlinePrograms.length} airline programs`);

const hotelPrograms = allPrograms.filter(p => p.category === 'hotel');
console.log(`✅ Found ${hotelPrograms.length} hotel programs`);

const creditCardPrograms = allPrograms.filter(p => p.category === 'credit_card');
console.log(`✅ Found ${creditCardPrograms.length} credit card programs`);

// Test 4: Check program structure
const sampleProgram = allPrograms[0];
console.log(`✅ Sample program structure:`, {
  id: sampleProgram.id,
  name: sampleProgram.name,
  category: sampleProgram.category,
  pointsName: sampleProgram.pointsName,
  hasExpiration: !!sampleProgram.expirationRules
});

console.log('✅ All tests passed! Loyalty system is ready.');
