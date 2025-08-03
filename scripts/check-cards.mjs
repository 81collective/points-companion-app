#!/usr/bin/env node

/**
 * Script to check if credit card database needs updating
 * Run with: npm run check-cards
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkCardDatabase() {
  try {
    console.log('🔍 Checking credit card database...');
    
    const dbPath = path.join(__dirname, '../src/data/creditCardDatabase.ts');
    const dbContent = await fs.readFile(dbPath, 'utf8');
    
    // Check file modification date
    const stats = await fs.stat(dbPath);
    const lastModified = stats.mtime;
    const daysSinceUpdate = Math.floor((Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24));
    
    // Count cards in database
    const cardMatches = dbContent.match(/id: '[^']+'/g);
    const cardCount = cardMatches ? cardMatches.length : 0;
    
    console.log(`📊 Database Statistics:`);
    console.log(`   Cards in database: ${cardCount}`);
    console.log(`   Last updated: ${lastModified.toLocaleDateString()} (${daysSinceUpdate} days ago)`);
    
    // Check if update is needed
    if (daysSinceUpdate > 30) {
      console.log('⚠️  Database is over 30 days old - consider updating');
      console.log('   Run: npm run update-cards');
    } else if (daysSinceUpdate > 7) {
      console.log('ℹ️  Database is over a week old - may need updating');
      console.log('   Run: npm run update-cards');
    } else {
      console.log('✅ Database is up to date');
    }
    
    // Check for missing categories
    const modernCategories = [
      'streaming', 'fitness', 'healthcare', 'ev_charging', 
      'digital_wallets', 'subscription', 'entertainment'
    ];
    
    // Convert category names to enum format for checking
    const categoryEnumMappings = {
      'streaming': 'Streaming',
      'fitness': 'Fitness', 
      'healthcare': 'Healthcare',
      'ev_charging': 'ElectricVehicleCharging',
      'digital_wallets': 'DigitalWallets',
      'subscription': 'Subscription',
      'entertainment': 'Entertainment'
    };
    
    const missingCategories = modernCategories.filter(cat => {
      const enumName = categoryEnumMappings[cat];
      return !dbContent.includes(`RewardCategory.${enumName}`);
    });
    
    if (missingCategories.length > 0) {
      console.log(`🆕 Missing modern categories: ${missingCategories.join(', ')}`);
      console.log('   Consider updating to include latest reward categories');
    } else {
      console.log('🎉 All modern categories are included!');
    }
    
    // Check API integration
    const envPath = path.join(__dirname, '../.env.local');
    try {
      const envContent = await fs.readFile(envPath, 'utf8');
      const hasCardApis = envContent.includes('CARD_CURATOR_API_KEY') || envContent.includes('CREDIT_KARMA_API_KEY');
      
      if (!hasCardApis) {
        console.log('💡 Tip: Add API keys to .env.local for automatic updates');
        console.log('   CARD_CURATOR_API_KEY=your_key_here');
      }
    } catch (error) {
      console.log('⚠️  Could not check .env.local file');
    }
    
  } catch (error) {
    console.error('❌ Error checking credit card database:', error);
    process.exit(1);
  }
}

// Run the check
checkCardDatabase();
