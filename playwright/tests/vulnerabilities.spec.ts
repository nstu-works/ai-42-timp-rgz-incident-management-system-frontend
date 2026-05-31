import { test, expect } from '@playwright/test'
import { getToken } from '../fixtures'

let locationTypeId = '', locationId = '', vulnerabilityId = ''

test.beforeAll(async ({ request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  const typeRes = await request.post('/api/v1/location-types', { headers: h, data: { name: `VType-${Date.now()}` } })
  locationTypeId = (await typeRes.json()).data.id
  const locRes = await request.post('/api/v1/locations', { headers: h, data: { name: `VLoc-${Date.now()}`, location_type_id: locationTypeId } })
  locationId = (await locRes.json()).data.id
})

test.afterEach(async ({ request }) => {
  if (!vulnerabilityId) return
  const token = await getToken(request)
  try {
    await request.delete(`/api/v1/vulnerabilities/${vulnerabilityId}`, { headers: { Authorization: `Bearer ${token}` } })
  } finally { vulnerabilityId = '' }
})

test.afterAll(async ({ request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  if (locationId) await request.delete(`/api/v1/locations/${locationId}`, { headers: h })
  if (locationTypeId) await request.delete(`/api/v1/location-types/${locationTypeId}`, { headers: h })
})

test('список уязвимостей отображается', async ({ page }) => {
  await page.goto('/vulnerabilities')
  await expect(page.getByRole('heading', { name: 'Уязвимости' })).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
})

test('создать уязвимость → появляется в таблице', async ({ page }) => {
  const name = `Уязв-${Date.now()}`
  await page.goto('/vulnerabilities/new')
  await page.fill('input[name="name"]', name)
  await page.getByRole('combobox').filter({ hasText: /выберите локацию/i }).click()
  await page.getByRole('option').first().click()
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/vulnerabilities')
  const link = page.getByRole('link', { name })
  await expect(link).toBeVisible()
  const href = await link.getAttribute('href')
  vulnerabilityId = href?.split('/').pop() ?? ''
})

test('редактировать уязвимость', async ({ page, request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  const res = await request.post('/api/v1/vulnerabilities', { headers: h, data: { name: `Уязв-${Date.now()}`, status: 'open', severity: 3, location_id: locationId, discovered_at: new Date().toISOString() } })
  vulnerabilityId = (await res.json()).data.id

  await page.goto(`/vulnerabilities/${vulnerabilityId}`)
  await page.getByRole('button', { name: 'Редактировать' }).click()
  const newName = `Обновл-${Date.now()}`
  await page.fill('input[name="name"]', newName)
  await page.getByRole('button', { name: 'Сохранить' }).click()
  await expect(page).toHaveURL('/vulnerabilities')
})

test('удалить уязвимость', async ({ page, request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  const name = `Уязв-DEL-${Date.now()}`
  const res = await request.post('/api/v1/vulnerabilities', { headers: h, data: { name, status: 'open', severity: 3, location_id: locationId, discovered_at: new Date().toISOString() } })
  vulnerabilityId = (await res.json()).data.id

  await page.goto('/vulnerabilities')
  const row = page.getByRole('row').filter({ has: page.getByText(name) })
  await row.getByRole('button', { name: 'Удалить' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Удалить' }).click()
  await expect(page.getByText(name)).not.toBeVisible()
  vulnerabilityId = ''
})
