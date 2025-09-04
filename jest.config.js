// Jest configuration for comprehensive testing
// Provides 80%+ test coverage with performance monitoring

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],

  // Test file patterns
  testMatch: [
    '<rootDir>/src/test/**/*.test.(ts|tsx|js|jsx)',
    '<rootDir>/src/test/**/*.spec.(ts|tsx|js|jsx)',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@test/(.*)$': '<rootDir>/src/test/$1',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|ico|webp)$': '<rootDir>/src/test/__mocks__/fileMock.js',
    '\\.module\\.(css|scss|sass)$': '<rootDir>/src/test/__mocks__/styleMock.js',
  },

  // Transform files
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { configFile: './babel.jest.config.cjs' }],
    '^.+\\.(css|scss|sass)$': 'jest-transform-stub',
    '\\.(jpg|jpeg|png|gif|svg|ico|webp)$': 'jest-transform-stub',
  },

  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(lucide-react|@radix-ui|@apollo|@graphql-tools)/)',
  ],

  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>/src'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Test environment options
  testEnvironmentOptions: {
    customExportConditions: [''],
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/index.ts',
    '!src/types/**',
  ],

  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary',
    'text-summary',
  ],

  // Coverage thresholds (80% target)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/components/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/lib/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Test timeout
  testTimeout: 10000,

  // Performance monitoring
  reporters: [
    'default',
  ],

  // Global setup and teardown
  globalSetup: '<rootDir>/src/test/globalSetup.ts',
  globalTeardown: '<rootDir>/src/test/globalTeardown.ts',

  // Mock configuration
  clearMocks: true,
  restoreMocks: true,

  // Error handling
  bail: false,
  verbose: true,

  // Parallel execution
  maxWorkers: '50%',

  // Cache configuration
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',

  // Snapshot configuration
  snapshotSerializers: [],
};
