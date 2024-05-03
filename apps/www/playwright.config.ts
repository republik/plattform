// playwright.config.ts
import { defineConfig } from '@playwright/test'
import { loadEnvConfig } from '@next/env'

loadEnvConfig('.')

export default defineConfig({
  testDir: './e2e/',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    actionTimeout: 0,
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'yarn dev',
    url: process.env.NEXT_PUBLIC_BASE_URL,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
