import { 
  initWebVitals, 
  reportWebVitals, 
  monitorMemoryUsage,
  performanceMark,
  performanceMeasure,
  analyzeBundleSize,
  WebVitalsMetric
} from '../performance'

// Mock web-vitals
jest.mock('web-vitals', () => ({
  onCLS: jest.fn(),
  onINP: jest.fn(),
  onFCP: jest.fn(),
  onLCP: jest.fn(),
  onTTFB: jest.fn(),
}))

describe('performance', () => {
  beforeEach(() => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true })
    jest.restoreAllMocks()
    ;['log','warn','error','group','groupEnd'].forEach(m => {
      jest.spyOn(console, m as any).mockImplementation(() => {})
    })

    const perfMock = {
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByName: jest.fn(() => [{ duration: 100 }]),
      now: jest.fn(() => 1000),
      memory: {
        usedJSHeapSize: 50_000_000,
        totalJSHeapSize: 100_000_000,
        jsHeapSizeLimit: 2_000_000_000,
      },
    } as any

    // Ensure window exists (jsdom provides it) and patch performance
    if (!(global as any).window) {
      ;(global as any).window = {} as any
    }
    Object.defineProperty(window, 'performance', { value: perfMock, configurable: true })

    // Spy on existing document querySelectorAll (jsdom provides document)
    if (typeof document !== 'undefined') {
      jest.spyOn(document, 'querySelectorAll').mockImplementation(() => Array(50).fill({}) as any)
    }
  })

  afterEach(() => {
    // Clean up patched properties (leave jsdom window intact)
    if (window && (window as any).performance) {
      delete (window as any).performance
    }
  })

  describe('initWebVitals', () => {
    it('should initialize web vitals monitoring', () => {
      initWebVitals()

      const { onCLS, onINP, onFCP, onLCP, onTTFB } = require('web-vitals')
      expect(onCLS).toHaveBeenCalledWith(reportWebVitals)
      expect(onINP).toHaveBeenCalledWith(reportWebVitals)
      expect(onFCP).toHaveBeenCalledWith(reportWebVitals)
      expect(onLCP).toHaveBeenCalledWith(reportWebVitals)
      expect(onTTFB).toHaveBeenCalledWith(reportWebVitals)
    })
  })

  describe('reportWebVitals', () => {
    it('logs without throwing', () => {
      const metric: WebVitalsMetric = { id:'id', name:'LCP', value:2500, rating:'needs-improvement', delta:100, entries:[] }
      expect(() => reportWebVitals(metric)).not.toThrow()
    })
  })

  describe('performanceMark', () => {
    it('calls performance.mark if available', () => {
      performanceMark('x')
      expect((window as any).performance.mark).toHaveBeenCalledWith('x')
    })
  })

  describe('performanceMeasure', () => {
    it('measures when performance API present', () => {
      performanceMeasure('m','start','end')
      expect((window as any).performance.measure).toHaveBeenCalled()
    })
  })

  describe('analyzeBundleSize', () => {
    it('groups logs', () => {
      analyzeBundleSize()
      expect(console.group).toHaveBeenCalledWith('Bundle Analysis')
      expect((console.log as any).mock.calls.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('monitorMemoryUsage', () => {
    it('returns memory stats', () => {
      const result = monitorMemoryUsage()
      expect(result).not.toBeNull()
      expect(result && result.usedJSHeapSize).toBeGreaterThan(0)
    })
  })
})
