import { test, expect } from '@playwright/test'

test('audio player shows up on article page', async ({ page }) => {
  await page.goto(
    'http://localhost:3010/2023/05/01/der-heilige-krieg-der-taliban-gegen-die-bildung-von-frauen',
  )
  const audioPlayerWrapper = page.locator('#audio-player-wrapper')

  await expect(audioPlayerWrapper).not.toBeInViewport()

  await page.getByRole('button', { name: 'Hören' }).click()

  await expect(audioPlayerWrapper).toBeInViewport()

  const audioElement = page.locator('[data-audioplayer-element="true"]')

  await expect(audioElement).toHaveJSProperty('paused', false)

  await page.getByRole('button', { name: 'Audioplayer schliessen' }).click()

  await expect(audioElement).toHaveJSProperty('paused', true)

  await expect(audioPlayerWrapper).not.toBeInViewport()
})
