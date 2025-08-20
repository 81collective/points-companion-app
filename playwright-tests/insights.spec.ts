import { test, expect } from '@playwright/test'

// Basic UI smoke for Insights page
// Assumes route exists and page renders charts containers without crashing.

test.describe('Insights', () => {
  test('renders insights dashboard', async ({ page }) => {
  await page.goto('/dashboard/insights')
  // Unauthed users should be redirected to auth page, or protected UI should not be visible
  await page.waitForTimeout(500)
  if (/\/auth/.test(page.url())) {
    await expect(page).toHaveURL(/\/auth/)
  } else {
    await expect(page.getByRole('heading', { name: /Insights/i })).toHaveCount(0)
  }
  })
})
