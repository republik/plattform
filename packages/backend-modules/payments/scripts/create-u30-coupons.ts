import Stripe from 'stripe'

const STRIPE_API_VERSION = '2020-08-27'

const PROJECT_R_STRIPE_API_KEY = process.env.PROJECT_R_STRIPE_API_KEY
const REPUBLIK_STRIPE_API_KEY = process.env.REPUBLIK_STRIPE_API_KEY

if (
  PROJECT_R_STRIPE_API_KEY === undefined ||
  REPUBLIK_STRIPE_API_KEY === undefined
) {
  console.log('STRIPE KEYS missing')
  process.exit(1)
}

export const ProjectRStripe = new Stripe(PROJECT_R_STRIPE_API_KEY, {
  // @ts-expect-error stripe-version-2020-08-27
  apiVersion: STRIPE_API_VERSION,
})

export const RepublikAGStripe = new Stripe(REPUBLIK_STRIPE_API_KEY, {
  // @ts-expect-error stripe-version-2020-08-27
  apiVersion: STRIPE_API_VERSION,
})

function* calculateMonths(minAge: number, maxAge: number) {
  for (let age = minAge; age < maxAge + 1; age++) {
    const months = (1 + maxAge - age) * 12
    yield { age: age, months }
  }
}

async function main() {
  for (const { months } of calculateMonths(15, 30)) {
    const res = await Promise.all([
      RepublikAGStripe.coupons.create({
        name: `U30 Angebot - ${months} Monate`,
        amount_off: 13 * 100, // 22 - 13 = 9
        currency: 'CHF',
        duration: 'repeating',
        duration_in_months: months,
        metadata: {
          campaign: 'U30',
        },
      }),
      ProjectRStripe.coupons.create({
        name: `U30 Angebot - ${months} Monate`,
        amount_off: 141 * 100, // 240 - 141 = 99 CHF in Rappen
        currency: 'CHF',
        duration: 'repeating',
        duration_in_months: months,
        metadata: {
          campaign: 'U30',
        },
      }),
    ])

    console.log({ months, republik_id: res[0].id, project_r_id: res[1].id })
  }
}

main()
