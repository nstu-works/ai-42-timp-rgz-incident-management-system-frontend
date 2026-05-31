// playwright/tests/stats.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Статистика', () => {
  test('страница статистики открывается', async ({ page }) => {
    await page.goto('/stats')
    await expect(page.getByRole('heading', { name: 'Статистика' })).toBeVisible()
  })

  test('виджет кол-ва инцидентов отображается', async ({ page }) => {
    await page.goto('/stats')
    await expect(page.getByText('Инцидентов')).toBeVisible()
    const card = page.locator('.rounded-xl').filter({ hasText: 'Инцидентов' })
    await expect(card).toBeVisible()
  })
})
