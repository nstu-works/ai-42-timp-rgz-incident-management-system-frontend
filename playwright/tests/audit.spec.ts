// playwright/tests/audit.spec.ts
import { test, expect } from '@playwright/test'
import { getToken } from '../fixtures'

let incidentId = ''

test.beforeAll(async ({ request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }

  const typeRes = await request.post('/api/v1/location-types', { headers: h, data: { name: `AType-${Date.now()}` } })
  const typeId = (await typeRes.json()).data.id
  const locRes = await request.post('/api/v1/locations', { headers: h, data: { name: `ALoc-${Date.now()}`, location_type_id: typeId } })
  const locationId = (await locRes.json()).data.id
  const catRes = await request.post('/api/v1/categories', { headers: h, data: { name: `ACat-${Date.now()}` } })
  const categoryId = (await catRes.json()).data.id

  const res = await request.post('/api/v1/incidents', { headers: h, data: { title: `AuditInц-${Date.now()}`, status: 'open', threat_level: 3, location_id: locationId, category_id: categoryId, occurred_at: new Date().toISOString() } })
  incidentId = (await res.json()).data.id
})

test('лог аудита отображается', async ({ page }) => {
  await page.goto('/audit')
  await expect(page.getByRole('heading', { name: 'Лог аудита' })).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page.getByText('INSERT')).toBeVisible()
})

test('фильтр по инциденту работает', async ({ page }) => {
  await page.goto('/audit')
  await page.fill('input[placeholder*="UUID"]', incidentId)
  await page.getByRole('button', { name: 'Фильтровать' }).click()
  await expect(page.getByText('INSERT')).toBeVisible()
  await page.getByRole('button', { name: 'Сбросить' }).click()
})
