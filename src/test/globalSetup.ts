// Global setup for Jest tests
// Runs once before all test suites

export default async function globalSetup() {
  // Set up test environment variables
  (process.env as any).NODE_ENV = 'test';
  (process.env as any).REACT_APP_API_URL = 'http://localhost:3001/api';
  (process.env as any).REACT_APP_GOOGLE_MAPS_API_KEY = 'test-google-maps-key';
  (process.env as any).REACT_APP_SUPABASE_URL = 'https://test.supabase.co';
  (process.env as any).REACT_APP_SUPABASE_ANON_KEY = 'test-anon-key';

  // Configure test database if needed
  // This would typically set up a test database or mock

  // Set up performance monitoring
  console.log('🚀 Starting test suite...');

  // Any other global setup logic
  // - Database connections
  // - External service mocks
  // - Test data seeding
}
// Support CommonJS consumers / Jest requiring globalSetup
if (typeof module !== 'undefined' && module.exports) module.exports = globalSetup;
