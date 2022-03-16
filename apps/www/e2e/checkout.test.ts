import { test, expect } from '@playwright/test'

function getUserInput() {
  const date = new Date(Date.now())
  const year = date.getFullYear() + 1 // next year

  return {
    userInfo: {
      email: `max.muster+${Date.now()}@example.com`,
      firstName: 'Max',
      lastName: 'Muster',
    },
    card: {
      cardNumber: '4242 4242 4242 4242',
      expiry: `01 / ${year.toString().slice(-2)}`,
      cvc: '123',
    },
  }
}

test.describe('checkout test-suite', () => {
  test('can checkout with Stripe credit-card when given a valid input', async ({
    page,
  }) => {
    const userInput = getUserInput()

    await page.goto('/angebote?package=ABO')

    for (const [key, value] of Object.entries(userInput.userInfo)) {
      await page.fill(`input[name="${key}"]`, value)
    }

    // Initialize Stripe by clicking on card field
    await page.locator('text=Kreditkartennummer').click()
    console.log(userInput.card.expiry)
    for (const [key, value] of Object.entries(userInput.card)) {
      await page
        .frameLocator(`.StripeElement-${key} iframe`)
        .locator('input[aria-label]')
        .fill(value)
    }

    // Accept AGB
    await page.locator('div:nth-child(8) label span span >> nth=0').click()

    await page.locator('text=CHF 240 bezahlen').click()

    await page.locator('text=Zugriff via E-Mail bestätigen')
  })
})
