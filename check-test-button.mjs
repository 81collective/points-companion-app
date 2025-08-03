#!/usr/bin/env node

import { readFileSync } from 'fs';

console.log('🔍 Checking NearbyBusinesses component for test button...\n');

try {
  const componentContent = readFileSync('./src/components/location/NearbyBusinesses.tsx', 'utf8');
  
  // Check for test button
  const hasTestButton = componentContent.includes('🧪 Test Business Selection');
  const hasTestClick = componentContent.includes('const testClick = ()');
  const hasHandleBusinessSelect = componentContent.includes('const handleBusinessSelect = (business: Business)');
  
  console.log('✅ Test Button Present:', hasTestButton);
  console.log('✅ Test Click Function:', hasTestClick);
  console.log('✅ Business Select Handler:', hasHandleBusinessSelect);
  
  if (hasTestButton && hasTestClick && hasHandleBusinessSelect) {
    console.log('\n🎉 All test infrastructure is properly set up!');
  } else {
    console.log('\n❌ Missing test infrastructure components');
  }
  
  // Extract and show the test button section
  const testButtonMatch = componentContent.match(/\/\* Test Button \*\/[\s\S]*?<\/div>/);
  if (testButtonMatch) {
    console.log('\n📋 Test Button Section Found:');
    console.log(testButtonMatch[0]);
  }
  
} catch (error) {
  console.error('❌ Error reading component file:', error.message);
}
