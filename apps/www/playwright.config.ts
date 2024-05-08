// playwright.config.ts
import { defineConfig } from '@playwright/test'
import { loadEnvConfig } from '@next/env'

const nodeEnv = process.env.NODE_ENV || 'development'
const isDev = nodeEnv === 'development'

loadEnvConfig('.', isDev)

export default defineConfig({
  testDir: './__tests__/e2e/',
  snapshotDir: './__tests__/__snapshots__/',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  // snapshotPathTemplate: '/{test}.snap',
  use: {
    actionTimeout: 0,
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: isDev ? 'yarn dev' : 'yarn start',
    url: process.env.NEXT_PUBLIC_BASE_URL,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120_000, // building the app can take a while
    reuseExistingServer: !isDev,
  },
})
