const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(spec|test).{ts,tsx,js,jsx}',
    '<rootDir>/src/**/*.(spec|test).{ts,tsx,js,jsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/playwright-tests/',
  ],
  // Phase 2: measure real source (exclude test files themselves)
  collectCoverageFrom: [
    'src/lib/performance.ts',
    'src/lib/utils.ts',
    'src/components/ui/button.tsx',
    'src/app/api/**/*.ts',
    '!src/app/api/**/__tests__/**',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 15000,
  coverageThreshold: {
    global: {
      statements: 55,
      branches: 45,
      functions: 55,
      lines: 55,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
