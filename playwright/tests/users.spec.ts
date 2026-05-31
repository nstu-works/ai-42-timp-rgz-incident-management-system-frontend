import { test, expect } from '@playwright/test'
import { getToken } from '../fixtures'

const toDelete = new Set<string>()

test.afterEach(async ({ request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  for (const id of toDelete) { try { await request.delete(`/api/v1/users/${id}`, { headers: h }) } catch {} }
  toDelete.clear()
})

test('список пользователей отображается', async ({ page }) => {
  await page.goto('/users')
  await expect(page.getByRole('heading', { name: 'Пользователи' })).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
})

test('создать пользователя', async ({ page, request }) => {
  const email = `test-${Date.now()}@example.com`
  await page.goto('/users/new')
  await page.fill('input[name="first_name"]', 'Тест')
  await page.fill('input[name="last_name"]', 'Тестов')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', 'Password123!')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/users')
  await expect(page.getByText(email)).toBeVisible()

  const token = await getToken(request)
  const res = await request.get('/api/v1/users', { headers: { Authorization: `Bearer ${token}` } })
  const created = (await res.json()).data.find((u: any) => u.email === email)
  if (created) toDelete.add(created.id)
})

test('удалить пользователя', async ({ page, request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  const email = `del-${Date.now()}@example.com`
  const res = await request.post('/api/v1/users', { headers: h, data: { first_name: 'Дел', last_name: 'Ет', email, password: 'Password123!', role: 'guard', is_active: true } })
  const id = (await res.json()).data.id

  await page.goto('/users')
  const row = page.getByRole('row').filter({ has: page.getByText(email) })
  await row.getByRole('button', { name: 'Удалить' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Удалить' }).click()
  await expect(page.getByText(email)).not.toBeVisible()
})
