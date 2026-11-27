/**
 * Price change 2027 – switch between the 2026 and 2027 prices
 *
 * price-change-2027-setup.ts creates everything in advance in state 2026
 * (switched off). This script toggles between the two states. Nothing is
 * created or deleted; every switch only moves lookup keys and (de)activates
 * promotion codes, so it can be run back and forth. Existing subscriptions are
 * NOT changed.
 *
 *   --to 2027  new prices (run on 01.12.2026)
 *     Project R  ABO -> 260 price, ABO_2026 -> original 240 price
 *     Republik   MONTHLY_ABO -> 24 price
 *     promotion codes: the ones created by the setup script are active,
 *     incl. PREIS2026
 *
 *   --to 2026  old prices (state after the setup script / rollback)
 *     Project R  ABO -> original 240 price, 260 price -> ABO_2027,
 *                no ABO_2026 (YEARLY_REDUCED falls back to ABO)
 *     Republik   MONTHLY_ABO -> original 22 price, 24 price -> MONTHLY_ABO_2027
 *     promotion codes: the original codes are active, PREIS2026 is off
 *
 * Coupons without promotion code live in env vars (reduced memberships,
 * gifts). The script prints the values for the chosen state; set them by hand.
 *
 * SAFETY
 *   - Dry run by default. Pass --apply to write.
 *   - Live keys are refused unless --live is passed AND the confirmation
 *     phrase is typed interactively. Live runs are done by a person only.
 *
 * USAGE (keys: PROJECT_R_STRIPE_API_KEY / REPUBLIK_STRIPE_API_KEY, falls back
 * to STRIPE_SECRET_KEY_PROJECT_R / STRIPE_SECRET_KEY_REPUBLIK from apps/api/.env)
 *   node --env-file=../../../../apps/api/.env price-change-2027-switch.ts --to 2026|2027 [--apply] [--live]
 */
import Stripe from 'stripe'
import { createInterface } from 'node:readline/promises'

const STRIPE_API_VERSION = '2025-08-27.basil'
const APPLY = process.argv.includes('--apply')
const LIVE = process.argv.includes('--live')
const LIVE_CONFIRMATION = 'PREISE 2027 SWITCH LIVE'
const CAMPAIGN = 'price-change-2027'

const toArg = process.argv[process.argv.indexOf('--to') + 1]
if (!process.argv.includes('--to') || (toArg !== '2026' && toArg !== '2027')) {
  console.error(
    'Usage: price-change-2027-switch.ts --to 2026|2027 [--apply] [--live]',
  )
  process.exit(1)
}
const TO: '2026' | '2027' = toArg

type CompanyName = 'PROJECT_R' | 'REPUBLIK'

type CompanyPlan = {
  name: CompanyName
  envKeys: string[]
  lookupKey: string
  // key of the old price in state 2027 (Project R: YEARLY_REDUCED in December)
  oldLookupKey2027?: string
  // key of the new price in state 2026
  newLookupKey2026: string
  // coupon env vars (old ids) – the script prints the value for the state
  couponEnvVars: { envVar: string; targetEnvVar?: string }[]
}

const PLAN: CompanyPlan[] = [
  {
    name: 'PROJECT_R',
    envKeys: ['PROJECT_R_STRIPE_API_KEY', 'STRIPE_SECRET_KEY_PROJECT_R'],
    lookupKey: 'ABO',
    oldLookupKey2027: 'ABO_2026',
    newLookupKey2026: 'ABO_2027',
    couponEnvVars: [
      { envVar: 'PAYMENTS_PROJECT_R_YEARLY_GIFT_COUPON' },
      {
        envVar: 'PAYMENTS_PROJECT_R_REDUCED_MEMBERSHIP_DISCOUNTS',
        targetEnvVar: 'PAYMENTS_PROJECT_R_REDUCED_MEMBERSHIP_DISCOUNTS_2027',
      },
    ],
  },
  {
    name: 'REPUBLIK',
    envKeys: ['REPUBLIK_STRIPE_API_KEY', 'STRIPE_SECRET_KEY_REPUBLIK'],
    lookupKey: 'MONTHLY_ABO',
    newLookupKey2026: 'MONTHLY_ABO_2027',
    couponEnvVars: [{ envVar: 'PAYMENTS_REPUBLIK_3_MONTH_GIFT_COUPON' }],
  },
]

function assertKey(envKeys: string[]): string {
  const envKey = envKeys.find((k) => process.env[k])
  const key = envKey && process.env[envKey]
  if (!envKey || !key) {
    console.error(`${envKeys.join(' / ')} missing`)
    process.exit(1)
  }
  const isTest = /^(sk|rk)_test_/.test(key)
  const isLive = /^(sk|rk)_live_/.test(key)
  if (!isTest && !isLive) {
    console.error(`${envKey} is not a recognised Stripe secret/restricted key`)
    process.exit(1)
  }
  if (isLive && !LIVE) {
    console.error(
      `${envKey} is a live key. Pass --live to run against live data.`,
    )
    process.exit(1)
  }
  if (isTest && LIVE) {
    console.error(`--live passed but ${envKey} is a test key`)
    process.exit(1)
  }
  return key
}

function assertMode<T extends { livemode?: boolean }>(obj: T): T {
  if (obj.livemode !== LIVE) {
    throw new Error(
      `Refusing to continue: Stripe returned livemode=${obj.livemode}, expected ${LIVE}`,
    )
  }
  return obj
}

async function confirmLive() {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(
    `You are about to switch LIVE Stripe prices to ${TO}.\nType "${LIVE_CONFIRMATION}" to continue: `,
  )
  rl.close()
  if (answer.trim() !== LIVE_CONFIRMATION) {
    console.error('Not confirmed – aborting.')
    process.exit(1)
  }
}

const log = (company: CompanyName, ...args: unknown[]) =>
  console.log(
    `[${company}]${LIVE ? ' [LIVE]' : ' [test]'}${
      APPLY ? '' : ' [dry-run]'
    } [-> ${TO}]`,
    ...args,
  )

const productId = (p: Stripe.Price) =>
  typeof p.product === 'string' ? p.product : p.product.id

async function priceByLookupKey(stripe: Stripe, lookupKey: string) {
  const { data } = await stripe.prices.list({
    lookup_keys: [lookupKey],
    limit: 1,
  })
  return data[0] ? assertMode(data[0]) : null
}

async function setLookupKey(
  stripe: Stripe,
  company: CompanyName,
  price: Stripe.Price,
  lookupKey: string,
) {
  if (price.lookup_key === lookupKey) {
    log(company, `${price.id} already has lookup key ${lookupKey}`)
    return
  }
  log(
    company,
    `lookup key ${lookupKey} -> ${price.id} (${price.unit_amount}, was: ${
      price.lookup_key ?? '–'
    })`,
  )
  if (APPLY) {
    assertMode(
      await stripe.prices.update(price.id, {
        lookup_key: lookupKey,
        transfer_lookup_key: true,
      }),
    )
  }
}

// Finds the price created by the setup script (new) and the price it replaced (old).
async function findPrices(
  stripe: Stripe,
  company: CompanyName,
  plan: CompanyPlan,
) {
  const holder =
    (await priceByLookupKey(stripe, plan.lookupKey)) ??
    (await priceByLookupKey(stripe, plan.newLookupKey2026))
  if (!holder)
    throw new Error(`[${company}] no price with lookup key ${plan.lookupKey}`)

  const productPrices: Stripe.Price[] = []
  for await (const p of stripe.prices.list({
    product: productId(holder),
    limit: 100,
  })) {
    productPrices.push(assertMode(p))
  }
  const newPrice = productPrices.find(
    (p) => p.metadata?.campaign === CAMPAIGN && p.metadata?.replaces,
  )
  if (!newPrice) {
    throw new Error(
      `[${company}] no price from price-change-2027-setup.ts on ${productId(
        holder,
      )} – run the setup script first`,
    )
  }
  const oldPrice = productPrices.find(
    (p) => p.id === newPrice.metadata.replaces,
  )
  if (!oldPrice)
    throw new Error(
      `[${company}] old price ${newPrice.metadata.replaces} not found`,
    )
  if (!newPrice.active || !oldPrice.active) {
    throw new Error(
      `[${company}] ${newPrice.id} or ${oldPrice.id} is archived – reactivate it in Stripe first`,
    )
  }
  return { oldPrice, newPrice }
}

async function switchPrices(
  stripe: Stripe,
  company: CompanyName,
  plan: CompanyPlan,
) {
  const { oldPrice, newPrice } = await findPrices(stripe, company, plan)
  log(
    company,
    `old ${oldPrice.id} (${oldPrice.unit_amount}, ${
      oldPrice.lookup_key ?? '–'
    }), new ${newPrice.id} (${newPrice.unit_amount}, ${
      newPrice.lookup_key ?? '–'
    })`,
  )

  if (TO === '2027') {
    await setLookupKey(stripe, company, newPrice, plan.lookupKey)
    if (plan.oldLookupKey2027)
      await setLookupKey(stripe, company, oldPrice, plan.oldLookupKey2027)
    return
  }

  // TO 2026: the original price takes the main lookup key back (this also
  // removes ABO_2026 from it), the new price goes back to its parking key
  await setLookupKey(stripe, company, oldPrice, plan.lookupKey)
  await setLookupKey(stripe, company, newPrice, plan.newLookupKey2026)
}

async function switchPromotionCodes(stripe: Stripe, company: CompanyName) {
  const ours: Stripe.PromotionCode[] = []
  const byId = new Map<string, Stripe.PromotionCode>()
  for await (const pc of stripe.promotionCodes.list({ limit: 100 })) {
    assertMode(pc)
    byId.set(pc.id, pc)
    if (pc.metadata?.campaign === CAMPAIGN) ours.push(pc)
  }
  if (ours.length === 0)
    log(company, 'no promotion codes from the setup script found')

  // deactivate first (a code can only be active once), then activate
  const deactivate: Stripe.PromotionCode[] = []
  const activate: Stripe.PromotionCode[] = []
  for (const pc of ours) {
    const replaces = pc.metadata?.replaces
    const replaced = replaces ? byId.get(replaces) : undefined
    if (replaces && !replaced) {
      log(company, `${pc.code}: replaced code ${replaces} not found – skipping`)
      continue
    }
    const [on, off] = TO === '2027' ? [pc, replaced] : [replaced, pc]
    if (off?.active) deactivate.push(off)
    if (on && !on.active) activate.push(on)
  }

  for (const pc of deactivate) {
    log(
      company,
      `deactivate ${pc.code} (${pc.id}, ${
        pc.coupon.amount_off ?? pc.coupon.percent_off + '%'
      } off)`,
    )
    if (APPLY)
      assertMode(await stripe.promotionCodes.update(pc.id, { active: false }))
  }
  for (const pc of activate) {
    if (pc.expires_at && pc.expires_at * 1000 < Date.now()) {
      log(
        company,
        `${pc.code} (${pc.id}) has expired – cannot reactivate, skipping`,
      )
      continue
    }
    log(
      company,
      `activate ${pc.code} (${pc.id}, ${
        pc.coupon.amount_off ?? pc.coupon.percent_off + '%'
      } off)`,
    )
    if (APPLY)
      assertMode(await stripe.promotionCodes.update(pc.id, { active: true }))
  }
  if (deactivate.length === 0 && activate.length === 0)
    log(company, `promotion codes already in state ${TO}`)
}

async function printCouponEnv(
  stripe: Stripe,
  company: CompanyName,
  plan: CompanyPlan,
) {
  const replacedBy = new Map<string, string>()
  for await (const c of stripe.coupons.list({ limit: 100 })) {
    if (c.metadata?.campaign === CAMPAIGN && c.metadata?.replaces)
      replacedBy.set(c.metadata.replaces, c.id)
  }
  const lines: string[] = []
  for (const { envVar, targetEnvVar } of plan.couponEnvVars) {
    const oldIds = (process.env[envVar] ?? '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
    if (oldIds.length === 0) {
      lines.push(`# ${envVar} not set`)
      continue
    }
    const newIds = oldIds.map((id) => replacedBy.get(id) ?? id)
    if (targetEnvVar) {
      // reduced: the old coupons stay in envVar; the 2027 variable (used from
      // 01.01.2027) gets the +20 coupons, or the old ones in state 2026
      lines.push(`${envVar}=${oldIds.join(';')}`)
      lines.push(
        `${targetEnvVar}=${(TO === '2027' ? newIds : oldIds).join(';')}`,
      )
    } else {
      lines.push(`${envVar}=${(TO === '2027' ? newIds : oldIds).join(';')}`)
    }
  }
  log(
    company,
    `env for state ${TO} (set by hand, the script does not change env):\n  ${lines.join(
      '\n  ',
    )}`,
  )
}

async function main() {
  const keys = PLAN.map((plan) => assertKey(plan.envKeys))
  if (LIVE && APPLY) await confirmLive()

  for (const [i, plan] of PLAN.entries()) {
    const stripe = new Stripe(keys[i], {
      apiVersion: STRIPE_API_VERSION as Stripe.LatestApiVersion,
    })
    await switchPrices(stripe, plan.name, plan)
    await switchPromotionCodes(stripe, plan.name)
    await printCouponEnv(stripe, plan.name, plan)
  }

  if (!APPLY)
    console.log('Dry run – nothing was written. Re-run with --apply to write.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
