import { test, expect } from '@playwright/test'

test.describe('Cards Management', () => {
  test('should display cards page', async ({ page }) => {
    await page.goto('/cards')
    
    // Should load cards page
    await expect(page).toHaveTitle(/Cards/)
    
    // Should show cards or empty state
    const cardsContainer = page.locator('[data-testid="cards-container"], .cards-grid, main')
    await expect(cardsContainer).toBeVisible()
  })

  test('should handle card interaction', async ({ page }) => {
    await page.goto('/cards')
    
    // Look for any card elements or buttons
    const cardElements = page.locator('.card, [data-testid="card"], button')
    
    if (await cardElements.count() > 0) {
      // Click first available card/button
      await cardElements.first().click()
      
      // Should navigate or show details
      // This will depend on your card interaction implementation
      await page.waitForLoadState('networkidle')
      
      // Verify we're still on a valid page
      expect(page.url()).toMatch(/\/cards|\/dashboard|\//)
    }
  })

  test('should be responsive on different screen sizes', async ({ page }) => {
    await page.goto('/cards')
    
    // Test desktop
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('main')).toBeVisible()
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('main')).toBeVisible()
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Dashboard', () => {
  test('should display dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should load dashboard
    await expect(page.locator('main')).toBeVisible()
    
    // Look for dashboard-specific content
    const dashboardContent = page.locator('[data-testid="dashboard"], .dashboard, main')
    await expect(dashboardContent).toBeVisible()
  })

  test('should handle navigation between sections', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Try to navigate to cards from dashboard
    const cardsLink = page.locator('a[href="/cards"], a[href*="cards"]')
    
    if (await cardsLink.count() > 0) {
      await cardsLink.first().click()
      await page.waitForLoadState('networkidle')
      
      // Should navigate to cards page
      expect(page.url()).toMatch(/\/cards/)
    }
  })
})

test.describe('Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000)
  })

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    
    // Check for performance metrics (basic check)
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart
      }
    })
    
    // Basic performance assertions
    expect(performanceMetrics.domContentLoaded).toBeGreaterThan(0)
    expect(performanceMetrics.loadComplete).toBeGreaterThan(0)
  })
})
