import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Mock next/router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}

// Custom render function
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, options)
}

// Mock fetch helper
export function mockFetch(response: any, ok = true) {
  return jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(response),
  })
}

// Test data factories
export const createMockCard = (overrides = {}) => ({
  id: 'test-card-1',
  name: 'Test Card',
  issuer: 'Test Bank',
  category: 'travel',
  bonusCategories: ['dining', 'travel'],
  annualFee: 95,
  signupBonus: 50000,
  ...overrides,
})

export const createMockTransaction = (overrides = {}) => ({
  id: 'test-transaction-1',
  merchant: 'Test Merchant',
  amount: 25.00,
  category: 'dining',
  date: '2024-01-15',
  cardId: 'test-card-1',
  ...overrides,
})

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  preferences: {
    notifications: true,
    theme: 'light',
  },
  ...overrides,
})

// Common test utilities
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const createMockGeolocation = () => ({
  getCurrentPosition: jest.fn((success) => {
    success({
      coords: {
        latitude: 40.7580,
        longitude: -73.9855,
        accuracy: 10,
      },
    })
  }),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
})

// Setup test environment
export function setupTestEnvironment() {
  // Mock console methods to reduce noise in tests
  const originalWarn = console.warn
  const originalError = console.error
  
  beforeAll(() => {
    console.warn = jest.fn()
    console.error = jest.fn()
  })
  
  afterAll(() => {
    console.warn = originalWarn
    console.error = originalError
  })
  
  // Reset all mocks between tests
  beforeEach(() => {
    jest.clearAllMocks()
  })
}

// Mock local storage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

// Export everything needed for tests
export * from '@testing-library/react'
export * from '@testing-library/user-event'
export { default as userEvent } from '@testing-library/user-event'
