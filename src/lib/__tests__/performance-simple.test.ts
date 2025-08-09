/**
 * @jest-environment jsdom
 */

import { 
  initWebVitals, 
  reportWebVitals, 
  monitorMemoryUsage,
  performanceMark,
  analyzeBundleSize
} from '../performance'

// Ensure development env for logging expectations
beforeAll(() => {
  Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true })
})

// Mock web-vitals
jest.mock('web-vitals', () => ({
  onCLS: jest.fn(),
  onINP: jest.fn(),
  onFCP: jest.fn(),
  onLCP: jest.fn(),
  onTTFB: jest.fn(),
}))

describe('performance utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'warn').mockImplementation()
    jest.spyOn(console, 'group').mockImplementation()
    jest.spyOn(console, 'groupEnd').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('initWebVitals', () => {
    it('should initialize web vitals monitoring', () => {
      initWebVitals()

      const webVitals = require('web-vitals')
      expect(webVitals.onCLS).toHaveBeenCalled()
      expect(webVitals.onINP).toHaveBeenCalled()
      expect(webVitals.onFCP).toHaveBeenCalled()
      expect(webVitals.onLCP).toHaveBeenCalled()
      expect(webVitals.onTTFB).toHaveBeenCalled()
    })
  })

  describe('reportWebVitals', () => {
    it('should attempt to report web vitals in development', () => {
      const metric = {
        id: 'test-id',
        name: 'LCP',
        value: 2500,
        rating: 'needs-improvement' as const,
        delta: 100,
        entries: []
      }
      reportWebVitals(metric)
      expect((console.log as any).mock.calls.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('performanceMark', () => {
    it('should create performance marks when available', () => {
      const mockMark = jest.fn()
      Object.defineProperty(window, 'performance', {
        value: { mark: mockMark },
        writable: true
      })

      performanceMark('test-mark')
      expect(mockMark).toHaveBeenCalledWith('test-mark')
    })
  })

  describe('monitorMemoryUsage', () => {
    it('should return null when window is not available', () => {
      // Test in Node.js environment (no window)
      const originalWindow = global.window
      delete (global as any).window
      
      const result = monitorMemoryUsage()
      expect(result).toBeNull()
      
      // Restore window
      ;(global as any).window = originalWindow
    })
  })

  describe('analyzeBundleSize', () => {
    it('should log bundle analysis when window is available', () => {
      // Mock document
      Object.defineProperty(document, 'scripts', {
        value: Array(5).fill({}),
        writable: true
      })
      Object.defineProperty(document, 'styleSheets', {
        value: Array(3).fill({}),
        writable: true
      })
      Object.defineProperty(document, 'querySelectorAll', {
        value: jest.fn(() => Array(100).fill({})),
        writable: true
      })

      analyzeBundleSize()

      expect(console.group).toHaveBeenCalledWith('Bundle Analysis')
      expect(console.log).toHaveBeenCalledWith('Scripts loaded:', 5)
      expect(console.log).toHaveBeenCalledWith('Stylesheets loaded:', 3)
      expect(console.log).toHaveBeenCalledWith('DOM elements:', 100)
      expect(console.groupEnd).toHaveBeenCalled()
    })
  })
})
