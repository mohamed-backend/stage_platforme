import { test, expect } from '@playwright/test'

test.describe('App-wide navigation smoke', () => {
  test('clicking the brand logo on the landing returns home', async ({ page }) => {
    await page.goto('/projects')
    await page.getByRole('link', { name: /Fundsy/i }).first().click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('unauthenticated access to a protected route redirects to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('public 404 page renders when route is unknown', async ({ page }) => {
    await page.goto('/this-route-does-not-exist')
    await expect(page.getByText('404')).toBeVisible()
  })
})
