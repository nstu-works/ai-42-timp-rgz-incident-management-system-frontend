import { test, expect } from '@playwright/test'
import { getToken } from '../fixtures'

const toDelete = new Set<string>()

test.afterEach(async ({ request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  for (const id of toDelete) { try { await request.delete(`/api/v1/categories/${id}`, { headers: h }) } catch {} }
  toDelete.clear()
})

test('список категорий отображается', async ({ page }) => {
  await page.goto('/categories')
  await expect(page.getByRole('heading', { name: 'Категории' })).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
})

test('создать категорию через модальное окно', async ({ page, request }) => {
  const name = `Кат-${Date.now()}`
  await page.goto('/categories')
  await page.getByRole('button', { name: 'Добавить' }).click()
  await page.fill('input[name="name"]', name)
  await page.getByRole('button', { name: 'Сохранить' }).click()
  await expect(page.getByText(name)).toBeVisible()

  const token = await getToken(request)
  const res = await request.get('/api/v1/categories', { headers: { Authorization: `Bearer ${token}` } })
  const created = (await res.json()).data.find((c: any) => c.name === name)
  if (created) toDelete.add(created.id)
})

test('удалить категорию', async ({ page, request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  const name = `Кат-DEL-${Date.now()}`
  const res = await request.post('/api/v1/categories', { headers: h, data: { name } })
  toDelete.add((await res.json()).data.id)

  await page.goto('/categories')
  const row = page.getByRole('row').filter({ has: page.getByText(name) })
  await row.getByRole('button', { name: 'Удалить' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Удалить' }).click()
  await expect(page.getByText(name)).not.toBeVisible()
  toDelete.clear()
})
