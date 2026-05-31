import { test, expect } from '@playwright/test'
import { getToken } from '../fixtures'

let locationTypeId = '', locationId = '', locationName = '', categoryId = '', categoryName = ''
let currentIncidentId = ''

test.beforeAll(async ({ request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }

  const typeRes = await request.post('/api/v1/location-types', { headers: h, data: { name: `IType-${Date.now()}` } })
  locationTypeId = (await typeRes.json()).data.id

  locationName = `ILoc-${Date.now()}`
  const locRes = await request.post('/api/v1/locations', { headers: h, data: { name: locationName, location_type_id: locationTypeId } })
  locationId = (await locRes.json()).data.id

  categoryName = `ICat-${Date.now()}`
  const catRes = await request.post('/api/v1/categories', { headers: h, data: { name: categoryName } })
  categoryId = (await catRes.json()).data.id
})

test.afterEach(async ({ request }) => {
  if (!currentIncidentId) return
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  try {
    await request.patch(`/api/v1/incidents/${currentIncidentId}`, { headers: h, data: { status: 'closed' } })
    await request.delete(`/api/v1/incidents/${currentIncidentId}`, { headers: h })
  } finally { currentIncidentId = '' }
})

test.afterAll(async ({ request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  if (locationId) await request.delete(`/api/v1/locations/${locationId}`, { headers: h })
  if (locationTypeId) await request.delete(`/api/v1/location-types/${locationTypeId}`, { headers: h })
  if (categoryId) await request.delete(`/api/v1/categories/${categoryId}`, { headers: h })
})

test('список инцидентов отображается', async ({ page }) => {
  await page.goto('/incidents')
  await expect(page.getByRole('heading', { name: 'Инциденты' })).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
})

test('создать инцидент → появляется в таблице', async ({ page }) => {
  const title = `Инц-${Date.now()}`
  await page.goto('/incidents/new')
  await page.fill('input[name="title"]', title)

  await page.getByRole('combobox').filter({ hasText: /выберите локацию/i }).click()
  await page.getByRole('option', { name: locationName }).click()

  await page.getByRole('combobox').filter({ hasText: /выберите категорию/i }).click()
  await page.getByRole('option', { name: categoryName }).click()

  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/incidents')
  const link = page.getByRole('link', { name: title })
  await expect(link).toBeVisible()
  const href = await link.getAttribute('href')
  currentIncidentId = href?.split('/').pop() ?? ''
})

test('открыть детали инцидента', async ({ page, request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  const res = await request.post('/api/v1/incidents', { headers: h, data: { title: `Инц-${Date.now()}`, status: 'open', threat_level: 3, location_id: locationId, category_id: categoryId, occurred_at: new Date().toISOString() } })
  currentIncidentId = (await res.json()).data.id

  await page.goto(`/incidents/${currentIncidentId}`)
  await expect(page.getByText('Фотографии')).toBeVisible()
  await expect(page.getByText('Меры реагирования')).toBeVisible()
})

test('редактировать статус инцидента', async ({ page, request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  const res = await request.post('/api/v1/incidents', { headers: h, data: { title: `Инц-${Date.now()}`, status: 'open', threat_level: 3, location_id: locationId, category_id: categoryId, occurred_at: new Date().toISOString() } })
  currentIncidentId = (await res.json()).data.id

  await page.goto(`/incidents/${currentIncidentId}`)
  await page.getByRole('button', { name: 'Редактировать' }).click()
  await page.getByRole('combobox').filter({ hasText: /Открыт/i }).click()
  await page.getByRole('option', { name: 'В работе' }).click()
  await page.getByRole('button', { name: 'Сохранить' }).click()
  await expect(page).toHaveURL('/incidents')
})

test('добавить меру реагирования', async ({ page, request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  const res = await request.post('/api/v1/incidents', { headers: h, data: { title: `Инц-${Date.now()}`, status: 'open', threat_level: 3, location_id: locationId, category_id: categoryId, occurred_at: new Date().toISOString() } })
  currentIncidentId = (await res.json()).data.id

  await page.goto(`/incidents/${currentIncidentId}`)
  await page.getByRole('button', { name: 'Добавить' }).click()
  await page.fill('textarea', 'Тестовая мера реагирования')
  await page.getByRole('button', { name: 'Сохранить' }).click()
  await expect(page.getByText('Тестовая мера реагирования')).toBeVisible()
})

test('удалить закрытый инцидент', async ({ page, request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  const title = `Инц-DEL-${Date.now()}`
  const res = await request.post('/api/v1/incidents', { headers: h, data: { title, status: 'closed', threat_level: 3, location_id: locationId, category_id: categoryId, occurred_at: new Date().toISOString() } })
  currentIncidentId = (await res.json()).data.id

  await page.goto('/incidents')
  const row = page.getByRole('row').filter({ has: page.getByText(title) })
  await row.getByRole('button', { name: 'Удалить' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Удалить' }).click()
  await expect(page.getByText(title)).not.toBeVisible()
  currentIncidentId = ''
})
