// Global setup for Jest tests - JS version for runtime compatibility

module.exports = async function globalSetup() {
  // Set up test environment variables
  process.env.NODE_ENV = 'test';
  process.env.REACT_APP_API_URL = 'http://localhost:3001/api';
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY = 'test-google-maps-key';
  process.env.REACT_APP_SUPABASE_URL = 'https://test.supabase.co';
  process.env.REACT_APP_SUPABASE_ANON_KEY = 'test-anon-key';

  // Custom setup can go here (spawning a local server or mocking global services)
  console.log('🚀 Global setup (JS) executed');
};
