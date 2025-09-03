// Testing utilities and setup for Points Companion App
// Provides comprehensive test coverage with 80%+ target

import React, { ReactElement, ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';

// Test Query Client
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// Test Wrapper with Query Client
export const TestWrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = createTestQueryClient();

  return React.createElement(QueryClientProvider, { client: queryClient }, children);
};

// Custom render function
export const customRender = (ui: ReactElement, options = {}) =>
  render(ui, { wrapper: TestWrapper, ...options });

// Re-export everything
export * from '@testing-library/react';

// Mock implementations
export const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

export const mockGoogleMaps = {
  Maps: jest.fn(),
  places: {
    PlacesService: jest.fn(),
    PlacesServiceStatus: {
      OK: 'OK',
      ZERO_RESULTS: 'ZERO_RESULTS',
    },
  },
};

export const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    insert: jest.fn(() => Promise.resolve({ error: null })),
    update: jest.fn(() => Promise.resolve({ error: null })),
    delete: jest.fn(() => Promise.resolve({ error: null })),
  })),
};

// Test data factories
export const createMockBusiness = (overrides = {}) => ({
  id: 'test-business-1',
  name: 'Test Restaurant',
  address: '123 Test St',
  category: 'restaurant',
  latitude: 40.7128,
  longitude: -74.0060,
  rating: 4.5,
  price_level: 2,
  distance: 1000,
  place_id: 'test_place_id',
  ...overrides,
});

export const createMockCardRecommendation = (overrides = {}) => ({
  id: 'test-card-1',
  name: 'Test Rewards Card',
  issuer: 'Test Bank',
  category: 'dining',
  rewardRate: 3.0,
  annualFee: 95,
  signupBonus: 'Earn 50,000 points',
  features: ['3x points on dining', 'No foreign transaction fees'],
  matchScore: 85,
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  preferences: {
    favoriteCategories: ['dining', 'travel'],
    notificationSettings: {
      email: true,
      push: true,
      sms: false,
    },
  },
  ...overrides,
});

// Test utilities
export const waitForLoadingToFinish = () =>
  waitFor(() => {
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  }, { timeout: 5000 });

export const expectLoadingState = () => {
  expect(screen.getByTestId('loading')).toBeInTheDocument();
};

export const expectErrorState = (message?: string) => {
  expect(screen.getByTestId('error')).toBeInTheDocument();
  if (message) {
    expect(screen.getByText(message)).toBeInTheDocument();
  }
};

export const mockFetchResponse = (data: any, ok = true) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    } as Response)
  );
};

export const mockFetchError = (error: Error) => {
  global.fetch = jest.fn(() => Promise.reject(error));
};

// Performance testing utilities
export const measureRenderTime = async (component: ReactElement) => {
  const startTime = performance.now();

  customRender(component);

  await waitFor(() => {
    expect(document.body).toBeInTheDocument();
  });

  const endTime = performance.now();
  return endTime - startTime;
};

export const expectPerformance = (renderTime: number, threshold = 100) => {
  expect(renderTime).toBeLessThan(threshold);
};

// Accessibility testing utilities
export const expectAccessible = (container: HTMLElement) => {
  // Check for ARIA labels
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    expect(button).toHaveAttribute('aria-label');
  });

  // Check for alt text on images
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    expect(img).toHaveAttribute('alt');
  });

  // Check for proper heading hierarchy
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    expect(level).toBeGreaterThanOrEqual(lastLevel);
    lastLevel = level;
  });
};

// Mock service worker
export const mockServiceWorker = {
  register: jest.fn(() => Promise.resolve({
    active: { state: 'activated' },
    waiting: null,
    installing: null,
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Setup function for all tests
export const setupTests = () => {
  // Mock window methods
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock IntersectionObserver
  const mockIntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
  (global as any).IntersectionObserver = mockIntersectionObserver;

  // Mock ResizeObserver
  const mockResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
  (global as any).ResizeObserver = mockResizeObserver;

  // Mock geolocation
  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
  });

  // Mock service worker
  Object.defineProperty(navigator, 'serviceWorker', {
    value: mockServiceWorker,
    writable: true,
  });

  // Mock Google Maps
  (global as any).google = mockGoogleMaps;

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  });
};
