// Jest setup file for comprehensive testing environment
// Configures mocks, utilities, and test environment

import { setupTests } from './testUtils';

// Setup global test environment
setupTests();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock navigator.geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
  writable: true,
});

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: jest.fn(() => Promise.resolve({
      active: { state: 'activated' },
      waiting: null,
      installing: null,
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  writable: true,
});

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

// Mock Google Maps API
(global as any).google = {
  maps: {
    Map: jest.fn(),
    Marker: jest.fn(),
    InfoWindow: jest.fn(),
    PlacesService: jest.fn(),
    PlacesServiceStatus: {
      OK: 'OK',
      ZERO_RESULTS: 'ZERO_RESULTS',
      OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
      REQUEST_DENIED: 'REQUEST_DENIED',
      INVALID_REQUEST: 'INVALID_REQUEST',
    },
  },
};

// Mock fetch API
global.fetch = jest.fn();

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock performance API
global.performance.mark = jest.fn();
global.performance.measure = jest.fn();
global.performance.getEntriesByName = jest.fn(() => []);
global.performance.clearMarks = jest.fn();
global.performance.clearMeasures = jest.fn();

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

// Mock requestIdleCallback
global.requestIdleCallback = jest.fn(cb => setTimeout(cb, 1));
global.cancelIdleCallback = jest.fn();

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Global test utilities
(global as any).testUtils = {
  // Helper to wait for async operations
  waitForAsync: () => new Promise(resolve => setImmediate(resolve)),

  // Helper to create mock promises
  createMockPromise: <T>(value: T, delay = 0) =>
    new Promise<T>(resolve => setTimeout(() => resolve(value), delay)),

  // Helper to create mock rejections
  createMockRejection: (error: Error, delay = 0) =>
    new Promise((_, reject) => setTimeout(() => reject(error), delay)),
};

// Performance testing utilities
(global as any).performanceUtils = {
  // Measure function execution time
  measureExecutionTime: async <T>(fn: () => Promise<T> | T): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  },

  // Assert performance threshold
  assertPerformance: (duration: number, threshold: number) => {
    if (duration > threshold) {
      throw new Error(`Performance test failed: ${duration}ms exceeded threshold of ${threshold}ms`);
    }
  },
};

// Memory testing utilities
(global as any).memoryUtils = {
  // Get current memory usage
  getMemoryUsage: () => {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  },

  // Assert memory usage is within limits
  assertMemoryUsage: (maxHeapUsed: number) => {
    const memory = (global as any).memoryUtils.getMemoryUsage();
    if (memory && memory.usedJSHeapSize > maxHeapUsed) {
      throw new Error(`Memory usage test failed: ${memory.usedJSHeapSize} exceeded limit of ${maxHeapUsed}`);
    }
  },
};

// Accessibility testing utilities
(global as any).a11yUtils = {
  // Check if element has proper ARIA attributes
  hasAriaAttributes: (element: HTMLElement) => {
    const ariaAttributes = [
      'aria-label',
      'aria-labelledby',
      'aria-describedby',
      'aria-expanded',
      'aria-selected',
      'role',
    ];

    return ariaAttributes.some(attr => element.hasAttribute(attr));
  },

  // Check if element is keyboard accessible
  isKeyboardAccessible: (element: HTMLElement) => {
    const tabIndex = element.getAttribute('tabindex');
    const tagName = element.tagName.toLowerCase();

    return (
      tabIndex !== '-1' &&
      (tabIndex !== null || ['button', 'input', 'select', 'textarea', 'a'].includes(tagName))
    );
  },
};

// Network testing utilities
(global as any).networkUtils = {
  // Mock successful API response
  mockApiSuccess: (data: any, status = 200) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    });
  },

  // Mock failed API response
  mockApiError: (error: Error, _status = 500) => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(error);
  },

  // Mock network timeout
  mockNetworkTimeout: (delay = 5000) => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), delay)
      )
    );
  },
};

// Mock environment variables
delete (process.env as any).NODE_ENV;
(process.env as any).NODE_ENV = 'test';
(process.env as any).REACT_APP_API_URL = 'http://localhost:3001';
(process.env as any).REACT_APP_GOOGLE_MAPS_API_KEY = 'test-api-key';

// Export for use in tests
export {};
global.testUtils = {
  // Helper to wait for async operations
  waitForAsync: () => new Promise(resolve => setImmediate(resolve)),

  // Helper to create mock promises
  createMockPromise: <T>(value: T, delay = 0) =>
    new Promise<T>(resolve => setTimeout(() => resolve(value), delay)),

  // Helper to create mock rejections
  createMockRejection: (error: Error, delay = 0) =>
    new Promise((_, reject) => setTimeout(() => reject(error), delay)),
};

// Performance testing utilities
global.performanceUtils = {
  // Measure function execution time
  measureExecutionTime: async <T>(fn: () => Promise<T> | T): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  },

  // Assert performance threshold
  assertPerformance: (duration: number, threshold: number) => {
    if (duration > threshold) {
      throw new Error(`Performance test failed: ${duration}ms exceeded threshold of ${threshold}ms`);
    }
  },
};

// Memory testing utilities
global.memoryUtils = {
  // Get current memory usage
  getMemoryUsage: () => {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  },

  // Assert memory usage is within limits
  assertMemoryUsage: (maxHeapUsed: number) => {
    const memory = global.memoryUtils.getMemoryUsage();
    if (memory && memory.usedJSHeapSize > maxHeapUsed) {
      throw new Error(`Memory usage test failed: ${memory.usedJSHeapSize} exceeded limit of ${maxHeapUsed}`);
    }
  },
};

// Accessibility testing utilities
global.a11yUtils = {
  // Check if element has proper ARIA attributes
  hasAriaAttributes: (element: HTMLElement) => {
    const ariaAttributes = [
      'aria-label',
      'aria-labelledby',
      'aria-describedby',
      'aria-expanded',
      'aria-selected',
      'role',
    ];

    return ariaAttributes.some(attr => element.hasAttribute(attr));
  },

  // Check if element is keyboard accessible
  isKeyboardAccessible: (element: HTMLElement) => {
    const tabIndex = element.getAttribute('tabindex');
    const tagName = element.tagName.toLowerCase();

    return (
      tabIndex !== '-1' &&
      (tabIndex !== null || ['button', 'input', 'select', 'textarea', 'a'].includes(tagName))
    );
  },
};

// Network testing utilities
global.networkUtils = {
  // Mock successful API response
  mockApiSuccess: (data: any, _status = 200) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    status: _status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    });
  },

  // Mock failed API response
  mockApiError: (error: Error, _status = 500) => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(error);
  },

  // Mock network timeout
  mockNetworkTimeout: (delay = 5000) => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), delay)
      )
    );
  },
};

// Extend global types for test utilities
declare global {
  var testUtils: {
    waitForAsync: () => Promise<void>;
    createMockPromise: <T>(value: T, delay?: number) => Promise<T>;
    createMockRejection: (error: Error, delay?: number) => Promise<never>;
  };

  var performanceUtils: {
    measureExecutionTime: <T>(fn: () => Promise<T> | T) => Promise<{ result: T; duration: number }>;
    assertPerformance: (duration: number, threshold: number) => void;
  };

  var memoryUtils: {
    getMemoryUsage: () => any;
    assertMemoryUsage: (maxHeapUsed: number) => void;
  };

  var a11yUtils: {
    hasAriaAttributes: (element: HTMLElement) => boolean;
    isKeyboardAccessible: (element: HTMLElement) => boolean;
  };

  var networkUtils: {
    mockApiSuccess: (data: any, status?: number) => void;
    mockApiError: (error: Error, status?: number) => void;
    mockNetworkTimeout: (delay?: number) => void;
  };
}
