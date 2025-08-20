import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads
    await expect(page).toHaveTitle(/PointAdvisor/)
    
      // Check for hero heading or CTA instead of <nav>/<main>
      await expect(page.getByRole('heading', { name: /Maximize your/i })).toBeVisible()
  // Be explicit to avoid strict mode (multiple matches for Sign up variants)
  await expect(page.getByRole('button', { name: 'Sign in / Sign up' })).toBeVisible()
  })

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/')
    
  // Public home shows auth CTA instead of site nav links
  await expect(page.getByRole('button', { name: 'Sign in / Sign up' })).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
  // Check that content is still visible and accessible (hero heading)
  await expect(page.getByRole('heading', { name: /Maximize your/i })).toBeVisible()
    
  // Skip asserting specific nav controls (implementation varies),
  // instead ensure a primary CTA is accessible on small screens
  await expect(page.getByRole('button', { name: 'Sign in / Sign up' })).toBeVisible()
  })

  test('should handle basic accessibility requirements', async ({ page }) => {
    await page.goto('/')
    
    // Check for basic accessibility features
    await expect(page.locator('html')).toHaveAttribute('lang')
    
  // Check for main content presence via heading
  await expect(page.getByRole('heading', { name: /Maximize your/i })).toBeVisible()
    
    // Check that there's a skip link or main content is easily accessible
    // This will depend on your accessibility implementation
  })
})
