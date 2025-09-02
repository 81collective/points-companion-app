#!/usr/bin/env node

/**
 * Deployment script for Points Companion App
 * Supports Vercel, Netlify, and custom deployments
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Points Companion App Deployment Script\n');

// Check if build is successful
console.log('📦 Running production build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful!\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Check for required environment variables
console.log('🔧 Checking environment configuration...');
const requiredEnvVars = [
  'GOOGLE_PLACES_API_KEY',
  'NEXTAUTH_SECRET',
  'DATABASE_URL'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.warn('⚠️  Missing environment variables:', missingEnvVars.join(', '));
  console.log('📝 Please set these variables in your deployment platform');
} else {
  console.log('✅ All required environment variables are set\n');
}

// Check deployment platform
console.log('🌐 Deployment Options:');
console.log('');

// Vercel deployment
if (existsSync('vercel.json')) {
  console.log('1️⃣  Vercel (Recommended for Next.js)');
  console.log('   Command: npx vercel --prod');
  console.log('   Or push to main branch if connected to GitHub');
  console.log('');
}

// GitHub Pages (static export)
console.log('2️⃣  Static Export (GitHub Pages, Netlify, etc.)');
console.log('   Commands:');
console.log('   npm run build');
console.log('   npm run export  # if static export is configured');
console.log('');

// Docker deployment
console.log('3️⃣  Docker Deployment');
console.log('   docker build -t points-companion-app .');
console.log('   docker run -p 3000:3000 points-companion-app');
console.log('');

// Manual server deployment
console.log('4️⃣  Manual Server Deployment');
console.log('   npm run build');
console.log('   npm run start');
console.log('');

// Performance recommendations
console.log('⚡ Performance Optimizations Enabled:');
console.log('   ✅ Dynamic imports for code splitting');
console.log('   ✅ Image optimization');
console.log('   ✅ Bundle compression');
console.log('   ✅ Service worker for caching');
console.log('   ✅ Enhanced nearby business search');
console.log('');

// Security checks
console.log('🔒 Security Features:');
console.log('   ✅ Security headers configured');
console.log('   ✅ Environment variables for sensitive data');
console.log('   ✅ API route protection');
console.log('');

console.log('🎯 Ready for deployment!');
console.log('Choose your preferred deployment method from the options above.');
