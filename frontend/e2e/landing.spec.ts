import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('renders the hero, stats and primary CTAs', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(
      page.getByRole('link', { name: /Découvrir les opportunités/i }).first()
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /Comment ça marche/i }).first()
    ).toBeVisible()

    const statsLabels = ['projets financés', 'collectés', 'de réussite']
    for (const label of statsLabels) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }
    await expect(page.getByText('investisseurs', { exact: true })).toBeVisible()
  })

  test('exposes a link to the public projects list', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Découvrir les opportunités/i }).first().click()
    await expect(page).toHaveURL(/\/projects/)
  })

  test('mobile navigation surfaces a sidebar/drawer trigger on small screens', async ({ page, viewport }) => {
    test.skip(viewport && viewport.width > 1024, 'Mobile-only assertion')

    await page.goto('/')
    await expect(page.getByRole('button', { name: /Ouvrir le menu latéral/i })).toBeVisible()
  })
})
