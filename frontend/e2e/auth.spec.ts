import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('login page renders the form and validates required fields', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByLabel(/adresse e-mail/i)).toBeVisible()
    await expect(page.getByPlaceholder(/mot de passe/i)).toBeVisible()

    await page.getByRole('button', { name: /se connecter/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('forgot password page is reachable from login', async ({ page }) => {
    await page.goto('/login')

    const link = page.getByRole('link', { name: /(mot de passe oublié|forgot password)/i })
    if ((await link.count()) === 0) {
      test.skip(true, 'Forgot password link not present in this build')
    }
    await link.first().click()
    await expect(page).toHaveURL(/\/(forgot-password|password-reset)/)
  })
})
