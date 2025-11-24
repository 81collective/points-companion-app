// Global teardown for Jest tests - JS version for runtime compatibility

module.exports = async function globalTeardown() {
  console.log('🧹 Global teardown (JS) executed');
  // Clean up test environment: close connections, remove temp files, etc.
};
