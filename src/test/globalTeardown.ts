// Global teardown for Jest tests
// Runs once after all test suites

export default async function globalTeardown() {
  // Clean up test environment
  console.log('🧹 Cleaning up test environment...');

  // Clean up test database connections
  // This would typically close database connections or clean up test data

  // Clean up external service mocks
  // Reset any global state that was modified during tests

  // Clean up temporary files or directories
  // Remove any test artifacts

  // Generate test reports
  console.log('📊 Test suite completed');

  // Any other global cleanup logic
}
// Support CommonJS consumers / Jest requiring globalTeardown
if (typeof module !== 'undefined' && module.exports) module.exports = globalTeardown;
