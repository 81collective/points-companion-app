import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads
  await expect(page).toHaveTitle(/PointAdvisor/)
    
    // Check for main navigation
    await expect(page.locator('nav')).toBeVisible()
    
    // Check for main content
  await expect(page.locator('main')).toBeVisible({ timeout: 15000 })
  })

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/')
    
    // Check for navigation links (adjust selectors based on your actual navigation)
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible()
    await expect(page.locator('a[href="/cards"]')).toBeVisible()
    await expect(page.locator('a[href="/loyalty"]')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check that content is still visible and accessible
  await expect(page.locator('main')).toBeVisible({ timeout: 15000 })
    
    // Check for mobile navigation (hamburger menu, etc.)
    // This will depend on your specific mobile navigation implementation
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('should handle basic accessibility requirements', async ({ page }) => {
    await page.goto('/')
    
    // Check for basic accessibility features
    await expect(page.locator('html')).toHaveAttribute('lang')
    
    // Check for main landmark
  await expect(page.locator('main')).toBeVisible({ timeout: 15000 })
    
    // Check that there's a skip link or main content is easily accessible
    // This will depend on your accessibility implementation
  })
})
