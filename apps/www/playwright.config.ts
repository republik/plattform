// playwright.config.ts
import { defineConfig } from '@playwright/test'
import { loadEnvConfig } from '@next/env'

const nodeEnv = process.env.NODE_ENV || 'development'
const isDev = nodeEnv === 'development'

loadEnvConfig('.', isDev)

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
    command: isDev
      ? 'yarn turbo run dev --filter=@orbiting/www-app'
      : 'yarn turbo run build --filter=@orbiting/www-app && yarn start',
    url: process.env.NEXT_PUBLIC_BASE_URL,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120_000, // building the app can take a while
  },
})
