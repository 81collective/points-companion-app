#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Health Check: Verifying all components are properly configured\n');

const checks = [
  {
    name: 'NearbyBusinesses Component (Dashboard)',
    file: 'src/components/location/NearbyBusinesses.tsx',
    tests: [
      { pattern: '🧪 Test Business Selection', description: 'Test button present' },
      { pattern: 'const testClick = ()', description: 'Test click handler' },
      { pattern: 'handleBusinessSelect', description: 'Business select handler' },
      { pattern: 'useCardRecommendations', description: 'Recommendations hook' }
    ]
  },
  {
    name: 'CardFinder Component (Homepage)',
    file: 'src/components/public/CardFinder.tsx',
    tests: [
      { pattern: '🧪 Test Homepage Business Selection', description: 'Homepage test button present' },
      { pattern: 'const testClick = ()', description: 'Homepage test click handler' },
      { pattern: 'handleBusinessSelect', description: 'Homepage business select handler' },
      { pattern: 'selectedBusiness', description: 'Business selection state' },
      { pattern: 'businessId: selectedBusiness?.id', description: 'Business ID parameter' },
      { pattern: 'businessName: selectedBusiness?.name', description: 'Business name parameter' }
    ]
  },
  {
    name: 'API Route',
    file: 'src/app/api/location/nearby/route.ts',
    tests: [
      { pattern: 'searchParams.get(\'lat\') || searchParams.get(\'latitude\')', description: 'Fixed parameter handling' },
      { pattern: 'searchParams.get(\'lng\') || searchParams.get(\'longitude\')', description: 'Fixed parameter handling' }
    ]
  },
  {
    name: 'Recommendations Hook',
    file: 'src/hooks/useCardRecommendations.ts',
    tests: [
      { pattern: 'businessId', description: 'Business ID parameter' },
      { pattern: 'businessName', description: 'Business name parameter' },
      { pattern: 'staleTime: 0', description: 'Disabled caching for debugging' }
    ]
  }
];

let allPassed = true;

for (const check of checks) {
  console.log(`📋 Checking ${check.name}...`);
  
  if (!existsSync(check.file)) {
    console.log(`❌ File not found: ${check.file}`);
    allPassed = false;
    continue;
  }
  
  const content = readFileSync(check.file, 'utf8');
  
  for (const test of check.tests) {
    const passed = content.includes(test.pattern);
    console.log(`  ${passed ? '✅' : '❌'} ${test.description}`);
    if (!passed) allPassed = false;
  }
  
  console.log('');
}

if (allPassed) {
  console.log('🎉 All checks passed! The application should be working correctly.');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Open http://localhost:3000 for homepage testing');
  console.log('3. Look for the GREEN test button on homepage');
  console.log('4. Open http://localhost:3000/dashboard for full testing');
  console.log('5. Look for the BLUE test button on dashboard');
} else {
  console.log('❌ Some checks failed. Please review the issues above.');
}
