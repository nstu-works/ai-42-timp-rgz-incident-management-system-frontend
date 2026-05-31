import { test, expect } from '@playwright/test'
import { getToken } from '../fixtures'

const toDeleteLocs = new Set<string>()
const toDeleteTypes = new Set<string>()

test.afterEach(async ({ request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  for (const id of toDeleteLocs) { try { await request.delete(`/api/v1/locations/${id}`, { headers: h }) } catch {} }
  toDeleteLocs.clear()
  for (const id of toDeleteTypes) { try { await request.delete(`/api/v1/location-types/${id}`, { headers: h }) } catch {} }
  toDeleteTypes.clear()
})

test('список локаций отображается', async ({ page }) => {
  await page.goto('/locations')
  await expect(page.getByRole('heading', { name: 'Локации' })).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
})

test('создать тип локации через модальное окно', async ({ page, request }) => {
  const name = `ТипЛок-${Date.now()}`
  await page.goto('/locations')
  await page.getByRole('tab', { name: 'Типы локаций' }).click()
  await page.getByRole('button', { name: 'Добавить тип' }).click()
  await page.fill('input[name="name"]', name)
  await page.getByRole('button', { name: 'Сохранить' }).click()
  await expect(page.getByText(name)).toBeVisible()

  const token = await getToken(request)
  const res = await request.get('/api/v1/location-types', { headers: { Authorization: `Bearer ${token}` } })
  const created = (await res.json()).data.find((t: any) => t.name === name)
  if (created) toDeleteTypes.add(created.id)
})

test('создать локацию', async ({ page, request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  const typeRes = await request.post('/api/v1/location-types', { headers: h, data: { name: `LType-${Date.now()}` } })
  const typeId = (await typeRes.json()).data.id
  toDeleteTypes.add(typeId)

  const locName = `Лок-${Date.now()}`
  await page.goto('/locations/new')
  await page.fill('input[name="name"]', locName)
  await page.getByRole('combobox').filter({ hasText: /выберите тип/i }).click()
  await page.getByRole('option').first().click()
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/locations')
  await expect(page.getByText(locName)).toBeVisible()

  const locsRes = await request.get('/api/v1/locations', { headers: h })
  const created = (await locsRes.json()).data.find((l: any) => l.name === locName)
  if (created) toDeleteLocs.add(created.id)
})

test('редактировать локацию', async ({ page, request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  const typeRes = await request.post('/api/v1/location-types', { headers: h, data: { name: `LType-${Date.now()}` } })
  const typeId = (await typeRes.json()).data.id
  toDeleteTypes.add(typeId)
  const locRes = await request.post('/api/v1/locations', { headers: h, data: { name: `Лок-${Date.now()}`, location_type_id: typeId } })
  const locId = (await locRes.json()).data.id
  toDeleteLocs.add(locId)

  await page.goto(`/locations/${locId}`)
  await page.getByRole('button', { name: 'Редактировать' }).click()
  const newName = `Обновлённая-${Date.now()}`
  await page.fill('input[name="name"]', newName)
  await page.getByRole('button', { name: 'Сохранить' }).click()
  await page.waitForURL('/locations')
  await expect(page.getByText(newName)).toBeVisible()
})

test('удалить локацию', async ({ page, request }) => {
  const token = await getToken(request)
  const h = { Authorization: `Bearer ${token}` }
  const typeRes = await request.post('/api/v1/location-types', { headers: h, data: { name: `LType-${Date.now()}` } })
  const typeId = (await typeRes.json()).data.id
  toDeleteTypes.add(typeId)
  const name = `Лок-DEL-${Date.now()}`
  await request.post('/api/v1/locations', { headers: h, data: { name, location_type_id: typeId } })

  await page.goto('/locations')
  const row = page.getByRole('row').filter({ has: page.getByText(name) })
  await row.getByRole('button', { name: 'Удалить' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Удалить' }).click()
  await expect(page.getByText(name)).not.toBeVisible()
})
