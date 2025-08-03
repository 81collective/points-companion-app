#!/usr/bin/env node

console.log('🚀 Starting development server and comprehensive debugging...\n');

import { spawn } from 'child_process';

// Start the Next.js development server
const server = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true
});

console.log('📍 Starting server at http://localhost:3000');
console.log('🧪 Test Instructions:');
console.log('');
console.log('1. Open http://localhost:3000 in your browser');
console.log('2. Look for the blue "🧪 Test Business Selection" button (should be visible immediately)');
console.log('3. Click the test button first - watch for console logs');
console.log('4. Grant location permission when prompted');
console.log('5. Switch to "Hotels" category');
console.log('6. Click on any hotel business card');
console.log('7. Watch the "Best Credit Cards" section update');
console.log('');
console.log('Expected Console Logs:');
console.log('- 🧪 TEST: Click handler is working!');
console.log('- 🏢 Business selected - BEFORE setSelectedBusiness');
console.log('- 🏢 Business selected - AFTER setSelectedBusiness');
console.log('- 🎯 Selected business for recommendations');
console.log('- 🎯 useCardRecommendations API call');
console.log('');
console.log('💡 If you still don\'t see the test button, check the browser console for errors');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  server.kill('SIGINT');
  process.exit(0);
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
});

server.on('close', (code) => {
  console.log(`📴 Development server exited with code ${code}`);
});
