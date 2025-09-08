import Stripe from 'stripe'

const STRIPE_API_VERSION = '2020-08-27'

const REPUBLIK_STRIPE_API_KEY = process.env.REPUBLIK_STRIPE_API_KEY

if (REPUBLIK_STRIPE_API_KEY === undefined) {
  console.log('STRIPE KEY missing')
  process.exit(1)
}

export const RepublikAGStripe = new Stripe(REPUBLIK_STRIPE_API_KEY, {
  // @ts-expect-error stripe-version-2020-08-27
  apiVersion: STRIPE_API_VERSION,
})

function* calculateCHFAmount(minCHF: number, maxCHF: number, step: number) {
  for (let chf = minCHF; chf <= maxCHF; chf = chf + step) {
    yield chf
  }
}

async function main() {
  for (const chf of calculateCHFAmount(1, 21, 1)) {
    const promoCode = `H25OFF${(22 - chf).toString().padStart(2, '0')}`

    const res = await Promise.all([
      RepublikAGStripe.coupons
        .create({
          name: `Herbst-Sonderangebot`,
          amount_off: chf * 100,
          currency: 'CHF',
          duration: 'once',
          metadata: {
            campaign: 'Herbst 2025',
          },
        })
        .then(async (coupon) => {
          await RepublikAGStripe.promotionCodes.create({
            coupon: coupon.id,
            code: promoCode,
            metadata: {
              campaign: 'Herbst 2025',
            },
            expires_at: 1759096800, // Mon Sep 29 2025 00:00:00 GMT+0200 (Central European Summer Time)
          })

          return coupon
        }),
    ])

    console.log({
      chf,
      promoCode,
      republik_id: res[0]?.id,
    })
  }
}

main()
