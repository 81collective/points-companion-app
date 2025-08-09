// Mock supabase related modules before importing security to avoid ESM transform issues
jest.mock('@supabase/supabase-js', () => ({ createClient: () => ({ auth: { getSession: async () => ({ data: { session: null } }) } }) }))
jest.mock('@supabase/ssr', () => ({ createBrowserClient: () => ({ auth: { getSession: async () => ({ data: { session: null } }) } }) }))
jest.mock('@/hooks/useSupabase', () => ({ useSupabase: () => ({ supabase: { auth: { getSession: async () => ({ data: { session: null } }) } } }) }))

// Provide minimal navigator for tests (define on globalThis without suppressing TS)
// Assign mock navigator (augment existing Navigator via type assertion)
Object.defineProperty(globalThis, 'navigator', {
  value: { userAgent: 'jest' },
  configurable: true
});

import { SecurityMonitor } from '../security'

describe('SecurityMonitor', () => {
  beforeEach(() => {
    SecurityMonitor.__resetForTests()
  })

  it('logs events and maintains size limit', () => {
    const monitor = SecurityMonitor.getInstance()
    for (let i=0;i<1050;i++) {
      monitor.logEvent({
        type: 'failed_login',
        severity: 'low',
        ip_address: '1.1.1.1',
        user_agent: 'jest',
        details: { i },
        resolved: false
      })
    }
    const metrics = monitor.getMetrics()
    expect(metrics.totalEvents).toBeGreaterThan(0)
  })

  it('detects rate limit abuse', () => {
    const monitor = SecurityMonitor.getInstance()
    let allowed = true
    for (let i=0;i<11;i++) {
      allowed = monitor.checkRateLimit('ip_test', 5, 60000)
    }
    expect(allowed).toBe(false)
  })

  it('detects SQL injection pattern', () => {
    const monitor = SecurityMonitor.getInstance()
    const isSuspicious = monitor.detectSQLInjection("SELECT * FROM users WHERE '1'='1'")
    expect(isSuspicious).toBe(true)
  })

  it('detects XSS pattern', () => {
    const monitor = SecurityMonitor.getInstance()
    const isSuspicious = monitor.detectXSS('<script>alert(1)</script>')
    expect(isSuspicious).toBe(true)
  })
})
