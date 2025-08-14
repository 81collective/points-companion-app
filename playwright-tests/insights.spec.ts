import { test, expect } from '@playwright/test'

// Basic UI smoke for Insights page
// Assumes route exists and page renders charts containers without crashing.

test.describe('Insights', () => {
  test('renders insights dashboard', async ({ page }) => {
    await page.goto('/dashboard/insights')

    // Title and basic sections
    await expect(page.getByRole('heading', { name: /Assistant Insights/i })).toBeVisible()
    await expect(page.getByText(/Themes, trends, and pain points/i)).toBeVisible()

    // Charts surfaces (containers visible)
    const containers = page.locator('.surface')
    await expect(containers.first()).toBeVisible()

    // Trending terms section may or may not exist depending on data
    // Just ensure page is interactive
    await page.mouse.move(10, 10)
  })
})
