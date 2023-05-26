import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Republik/)
})

test('nooodle around', async ({ page }) => {
  await page.goto('http://localhost:3010/')
  await page
    .locator('div')
    .filter({ hasText: /^AnmeldenAboJetzt abonnieren$/ })
    .getByRole('link', { name: 'Anmelden' })
    .click()
  await page
    .locator('div')
    .filter({
      hasText: /^Datenschutz – FAQ – Erste-Hilfe-Team: kontakt@republik\.ch\.$/,
    })
    .getByRole('link', { name: 'Datenschutz' })
    .click()
  await page.getByRole('heading', { name: 'Datenschutz' }).click()
  await page.getByRole('link', { name: 'Republik – Magazin' }).click()
  await page.getByRole('heading', { name: 'Wir sind nützlich' }).click()
})
