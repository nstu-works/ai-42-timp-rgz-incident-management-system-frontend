import { chromium } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

dotenv.config({ path: '.env.test' })

export default async function globalSetup() {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  const base = process.env.BASE_URL ?? 'http://localhost:3000'
  await page.goto(`${base}/login`)
  await page.fill('input[type="email"]', process.env.ADMIN_EMAIL!)
  await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD!)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/incidents')
  await page.waitForSelector('aside')

  const authDir = path.join(__dirname, '.auth')
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true })
  await context.storageState({ path: path.join(authDir, 'admin.json') })
  await browser.close()
}
