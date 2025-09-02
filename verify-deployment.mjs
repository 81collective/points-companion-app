/**
 * Post-deployment verification script
 * Run this after your app is deployed to verify all features work
 */

console.log('🔍 Post-Deployment Verification Script');
console.log('=====================================\n');

// Test URLs to verify after deployment
const testEndpoints = [
  '/', // Main page
  '/dashboard', // Dashboard
  '/dashboard/analytics', // Analytics page
  '/dashboard/cards', // Cards management
  '/dashboard/ai-assistant', // AI chat interface
  '/api/health', // Health check API
  '/api/location/nearby', // Location API
  '/api/cards/recommendations', // Card recommendations
  '/api/assistant/topics', // AI assistant API
];

// Environment variables that should be set
const requiredEnvVars = [
  'GOOGLE_PLACES_API_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL'
];

const optionalEnvVars = [
  'OPENAI_API_KEY',
  'NEXT_PUBLIC_GA_TRACKING_ID',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

async function verifyDeployment(baseUrl) {
  console.log(`🌐 Verifying deployment at: ${baseUrl}\n`);
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test each endpoint
  for (const endpoint of testEndpoints) {
    totalTests++;
    const url = baseUrl + endpoint;
    
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await fetch(url);
      
      if (response.ok) {
        console.log(`  ✅ ${endpoint} - Status ${response.status}`);
        passedTests++;
      } else {
        console.log(`  ❌ ${endpoint} - Status ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ ${endpoint} - Error: ${error.message}`);
    }
  }
  
  // Test specific features
  console.log('\n🧪 Feature-Specific Tests:');
  
  // Test API health
  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('  ✅ API health check passed');
      console.log(`     Status: ${healthData.status || 'OK'}`);
      passedTests++;
    } else {
      console.log('  ❌ API health check failed');
    }
    totalTests++;
  } catch (error) {
    console.log(`  ❌ API health check error: ${error.message}`);
    totalTests++;
  }
  
  // Test nearby businesses API (requires location)
  try {
    const nearbyResponse = await fetch(
      `${baseUrl}/api/location/nearby?latitude=40.7589&longitude=-73.9851&category=dining&radius=1000`
    );
    
    if (nearbyResponse.ok) {
      const nearbyData = await nearbyResponse.json();
      console.log('  ✅ Enhanced nearby business search works');
      console.log(`     Found ${nearbyData.businesses?.length || 0} businesses`);
      passedTests++;
    } else {
      console.log('  ❌ Nearby business search failed');
    }
    totalTests++;
  } catch (error) {
    console.log(`  ❌ Nearby business search error: ${error.message}`);
    totalTests++;
  }
  
  // Performance tests
  console.log('\n⚡ Performance Tests:');
  
  try {
    const startTime = Date.now();
    const response = await fetch(baseUrl);
    const loadTime = Date.now() - startTime;
    
    if (loadTime < 2000) {
      console.log(`  ✅ Page load time: ${loadTime}ms (under 2s)`);
      passedTests++;
    } else {
      console.log(`  ⚠️  Page load time: ${loadTime}ms (over 2s)`);
    }
    totalTests++;
  } catch (error) {
    console.log(`  ❌ Performance test error: ${error.message}`);
    totalTests++;
  }
  
  // PWA verification
  console.log('\n📱 PWA Verification:');
  
  try {
    const manifestResponse = await fetch(`${baseUrl}/manifest.json`);
    if (manifestResponse.ok) {
      console.log('  ✅ PWA manifest accessible');
      passedTests++;
    } else {
      console.log('  ❌ PWA manifest not found');
    }
    totalTests++;
  } catch (error) {
    console.log(`  ❌ PWA manifest error: ${error.message}`);
    totalTests++;
  }
  
  try {
    const swResponse = await fetch(`${baseUrl}/sw.js`);
    if (swResponse.ok) {
      console.log('  ✅ Service worker accessible');
      passedTests++;
    } else {
      console.log('  ❌ Service worker not found');
    }
    totalTests++;
  } catch (error) {
    console.log(`  ❌ Service worker error: ${error.message}`);
    totalTests++;
  }
  
  // Final results
  console.log('\n📊 Verification Results:');
  console.log(`Passed: ${passedTests}/${totalTests} tests`);
  
  const successRate = (passedTests / totalTests) * 100;
  if (successRate >= 90) {
    console.log('🎉 Deployment verification: EXCELLENT');
  } else if (successRate >= 80) {
    console.log('✅ Deployment verification: GOOD');
  } else if (successRate >= 70) {
    console.log('⚠️  Deployment verification: NEEDS ATTENTION');
  } else {
    console.log('❌ Deployment verification: ISSUES DETECTED');
  }
  
  // Environment variables check
  console.log('\n🔐 Environment Variables Checklist:');
  console.log('Required variables (set in Vercel dashboard):');
  requiredEnvVars.forEach(envVar => {
    console.log(`  ☐ ${envVar}`);
  });
  
  console.log('\nOptional variables:');
  optionalEnvVars.forEach(envVar => {
    console.log(`  ☐ ${envVar}`);
  });
  
  return { passedTests, totalTests, successRate };
}

// Usage instructions
console.log('📝 Usage Instructions:');
console.log('1. Replace YOUR_VERCEL_URL with your actual deployment URL');
console.log('2. Run: node verify-deployment.mjs');
console.log('3. Check that all tests pass');
console.log('4. Configure any missing environment variables\n');

// Example usage (uncomment and modify URL to test)
// verifyDeployment('https://your-app.vercel.app');

export { verifyDeployment };
