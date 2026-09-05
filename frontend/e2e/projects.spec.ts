import { test, expect } from '@playwright/test'

test.describe('Public projects list', () => {
  test('loads /projects and shows the listing header', async ({ page }) => {
    await page.goto('/projects')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('clicking a project navigates to its detail page', async ({ page }) => {
    await page.goto('/projects')

    const firstProject = page.getByRole('link', { name: /(Voir|Découvrir)/i }).first()
    const hasProject = await firstProject.count()
    if (hasProject === 0) {
      test.skip(true, 'No published project available in the test environment')
    }

    await firstProject.click()
    await expect(page).toHaveURL(/\/projects\/\d+/)
  })
})
