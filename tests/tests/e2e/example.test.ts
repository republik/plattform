// tests/e2e/example.spec.ts
import { test, expect } from '@playwright/test'
import { v4 } from 'uuid'

function getCheckoutAccount() {
  const uuid = v4()
  const email = `albert+${uuid}@example.com`

  // TODO: ideally we would use some random seeder here

  return {
    email: email,
    firstname: 'Albert',
    lastname: 'Albertson',
    street: 'Strasse 1',
    zip: '1000',
    city: 'Stadt',
  }
}

test('republik checkout test (payment-slip)', async ({ page }) => {
  const user = getCheckoutAccount()

  await page.goto('https://republik.love/angebote?open_sesame=<secret>')
  await page.getByRole('link', { name: 'Jahresmitgliedschaft CHF 240' }).click()
  await page.getByLabel('Visa/Mastercard/Amex').check()
  await page.getByText('Ihr Vorname').click()
  await page.getByLabel('Ihr Vorname').fill(user.firstname)
  await page.locator('label').filter({ hasText: 'Ihr Nachname' }).click()
  await page.getByLabel('Ihr Nachname').fill(user.lastname)
  await page.getByText('Ihre E-Mail-Adresse').click()
  await page.getByLabel('Ihre E-Mail-Adresse').fill(user.email)

  await page.getByLabel('Rechnung').check()
  await page.getByText('Gleich wie Lieferadresse').click()

  await page.getByLabel('Eindeutige Anschrift').click()

  await page.getByText('Strasse und Hausnummer').click()
  await page.getByLabel('Strasse und Hausnummer').fill(user.street)
  await page.getByLabel('Zusatz (Optional)').click()
  await page.getByLabel('Postleitzahl').click()
  await page.getByLabel('Postleitzahl').fill(user.zip)
  await page.getByLabel('Ort').click()
  await page.getByLabel('Ort').fill(user.city)
  await page.getByLabel('Ich bin mit den AGB, den').check()

  await page.getByRole('button', { name: 'CHF 240 bezahlen' }).click()

  await page
    .getByRole('heading', { name: 'Zugriff via E-Mail bestätigen' })
    .click()
})
