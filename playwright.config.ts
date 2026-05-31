import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.test' })

export default defineConfig({
  testDir: './playwright/tests',
  globalSetup: './playwright/global-setup.ts',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    storageState: 'playwright/.auth/admin.json',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
})
