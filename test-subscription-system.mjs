#!/usr/bin/env node

// Test script to verify subscription model access functionality
// Run with: node test-subscription-system.mjs

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Subscription Model Access System\n');

// Test 1: Verify migration file exists
async function testMigration() {
  try {
    const migrationPath = join(__dirname, 'supabase/migrations/20250820000000_add_subscription_plans.sql');
    await fs.access(migrationPath);
    console.log('✅ Database migration file exists');
    
    const content = await fs.readFile(migrationPath, 'utf-8');
    if (content.includes('subscription_plan') && content.includes('subscription_status')) {
      console.log('✅ Migration includes subscription columns');
    } else {
      console.log('❌ Migration missing required columns');
    }
  } catch (error) {
    console.log('❌ Migration file not found');
  }
}

// Test 2: Verify model access service exists
async function testModelAccessService() {
  try {
    const servicePath = join(__dirname, 'src/lib/modelAccess.ts');
    await fs.access(servicePath);
    console.log('✅ Model access service exists');
    
    const content = await fs.readFile(servicePath, 'utf-8');
    const requiredFunctions = [
      'getUserSubscriptionInfo',
      'getAvailableModels', 
      'getBestAvailableModel',
      'isModelAvailable'
    ];
    
    const missingFunctions = requiredFunctions.filter(fn => !content.includes(fn));
    if (missingFunctions.length === 0) {
      console.log('✅ All required functions implemented');
    } else {
      console.log(`❌ Missing functions: ${missingFunctions.join(', ')}`);
    }
  } catch (error) {
    console.log('❌ Model access service not found');
  }
}

// Test 3: Verify API endpoints exist
async function testAPIEndpoints() {
  const endpoints = [
    'src/app/api/assistant/models/route.ts',
    'src/app/api/subscription/upgrade/route.ts'
  ];
  
  for (const endpoint of endpoints) {
    try {
      await fs.access(join(__dirname, endpoint));
      console.log(`✅ API endpoint exists: ${endpoint}`);
    } catch (error) {
      console.log(`❌ API endpoint missing: ${endpoint}`);
    }
  }
}

// Test 4: Verify conversation API was updated
async function testConversationAPI() {
  try {
    const apiPath = join(__dirname, 'src/app/api/assistant/converse/route.ts');
    const content = await fs.readFile(apiPath, 'utf-8');
    
    if (content.includes('getBestAvailableModel')) {
      console.log('✅ Conversation API updated with model selection');
    } else {
      console.log('❌ Conversation API not updated');
    }
    
    if (content.includes('selectedModel')) {
      console.log('✅ Dynamic model selection implemented');
    } else {
      console.log('❌ Still using hardcoded model');
    }
  } catch (error) {
    console.log('❌ Could not verify conversation API');
  }
}

// Test 5: Verify UI components exist
async function testUIComponents() {
  const components = [
    'src/components/ai/ModelStatus.tsx',
    'src/components/ai/UpgradeModal.tsx',
    'src/hooks/useModelAccess.ts'
  ];
  
  for (const component of components) {
    try {
      await fs.access(join(__dirname, component));
      console.log(`✅ UI component exists: ${component}`);
    } catch (error) {
      console.log(`❌ UI component missing: ${component}`);
    }
  }
}

// Test 6: Verify auth context was updated
async function testAuthContext() {
  try {
    const authPath = join(__dirname, 'src/contexts/AuthContext.tsx');
    const content = await fs.readFile(authPath, 'utf-8');
    
    if (content.includes('subscription_plan') && content.includes('subscription_status')) {
      console.log('✅ Auth context updated with subscription fields');
    } else {
      console.log('❌ Auth context missing subscription fields');
    }
  } catch (error) {
    console.log('❌ Could not verify auth context');
  }
}

// Test 7: Verify BusinessAssistant integration
async function testBusinessAssistantIntegration() {
  try {
    const componentPath = join(__dirname, 'src/components/ai/BusinessAssistant.tsx');
    const content = await fs.readFile(componentPath, 'utf-8');
    
    if (content.includes('ModelStatus') && content.includes('UpgradePrompt')) {
      console.log('✅ BusinessAssistant integrated with model status components');
    } else {
      console.log('❌ BusinessAssistant missing model status integration');
    }
  } catch (error) {
    console.log('❌ Could not verify BusinessAssistant integration');
  }
}

// Run all tests
async function runTests() {
  console.log('Testing Database Layer...');
  await testMigration();
  
  console.log('\nTesting Service Layer...');
  await testModelAccessService();
  
  console.log('\nTesting API Layer...');
  await testAPIEndpoints();
  await testConversationAPI();
  
  console.log('\nTesting UI Layer...');
  await testUIComponents();
  await testAuthContext();
  await testBusinessAssistantIntegration();
  
  console.log('\n🎉 Subscription model access system verification complete!');
  console.log('\nNext steps:');
  console.log('1. Run database migrations in your Supabase instance');
  console.log('2. Test the upgrade flow manually in the application');
  console.log('3. Verify different models are used based on subscription plan');
}

runTests().catch(console.error);