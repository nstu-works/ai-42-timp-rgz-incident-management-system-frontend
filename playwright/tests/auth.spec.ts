// playwright/tests/auth.spec.ts
import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.test' })

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'

test.describe('Аутентификация', () => {
  test('логин с верными данными → редирект на /incidents', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto(`${BASE}/login`)
    await page.fill('input[type="email"]', process.env.ADMIN_EMAIL!)
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD!)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/incidents/)
    await ctx.close()
  })

  test('логин с неверным паролем → сообщение об ошибке', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto(`${BASE}/login`)
    await page.fill('input[type="email"]', process.env.ADMIN_EMAIL!)
    await page.fill('input[type="password"]', 'wrong-password-xyz-99')
    await page.click('button[type="submit"]')
    await expect(page.getByText('Неверный email или пароль')).toBeVisible()
    await ctx.close()
  })

  test('логаут → редирект на /login', async ({ page }) => {
    await page.goto('/incidents')
    await page.waitForSelector('[data-testid="logout"]')
    await page.click('[data-testid="logout"]')
    await expect(page).toHaveURL(/login/)
  })

  test('открыть /incidents без сессии → /login', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: undefined })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/incidents`)
    await expect(page).toHaveURL(/login/)
    await ctx.close()
  })
})
