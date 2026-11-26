/**
 * Price change 2027 – Stripe setup
 *
 * Creates the new list prices and the adjusted coupons/promotion codes for
 * the price change (new shop prices from 01.12.2026). See price-change-2027.md.
 *
 * SAFETY
 *   - Dry run by default. Pass --apply to write.
 *   - Live keys (sk_live_ / rk_live_) are refused unless --live is passed AND
 *     the confirmation phrase is typed interactively. Without --live, the
 *     script aborts if Stripe returns any livemode object.
 *   - Live runs are done by a person only (never by an AI agent). Rehearse in
 *     test mode first; checklist in price-change-2027.md.
 *
 * USAGE
 *   PROJECT_R_STRIPE_API_KEY=sk_test_… REPUBLIK_STRIPE_API_KEY=sk_test_… \
 *     deno -RNE --unstable-sloppy-imports price-change-2027-setup.ts [--apply] [--live]
 *
 *   Optional (coupons without promotion code, used by gifts):
 *     PAYMENTS_PROJECT_R_YEARLY_GIFT_COUPON, PAYMENTS_REPUBLIK_3_MONTH_GIFT_COUPON
 */
import Stripe from 'stripe'
import { createInterface } from 'node:readline/promises'

const STRIPE_API_VERSION = '2025-08-27.basil'
const APPLY = process.argv.includes('--apply')
const LIVE = process.argv.includes('--live')
const LIVE_CONFIRMATION = 'PREISE 2027 LIVE'
const METADATA = { campaign: 'price-change-2027' }

type CompanyName = 'PROJECT_R' | 'REPUBLIK'

type PriceChange = {
  lookupKey: string
  newAmount: number
  // lookup key the *old* price gets after the transfer (e.g. for reduced offers)
  oldPriceNewLookupKey?: string
}

type PromoChange = {
  // exact code or pattern
  code: string | RegExp
  newAmountOff: number
}

type CouponChange =
  // single coupon id in env var, new absolute amount
  | { envVar: string; newAmountOff: number; delta?: never }
  // ';'-separated coupon ids in env var (e.g. reduced memberships), each + delta;
  // the new ids go into targetEnvVar
  | { envVar: string; delta: number; targetEnvVar?: string; newAmountOff?: never }

// new promotion code (coupon + code), e.g. the December transition discount
type NewPromo = {
  code: string
  couponName: string
  amountOff: number
  expiresAt: number // unix seconds
}

type CompanyPlan = {
  name: CompanyName
  envKey: string
  prices: PriceChange[]
  promos: PromoChange[]
  coupons: CouponChange[]
  newPromos: NewPromo[]
}

// 2027-01-01T00:00:00+01:00 – must match PRICE_CHANGE_2027_TRANSITION in lib/shop/offers.ts
const TRANSITION_EXPIRES_AT = 1798758000

const PLAN: CompanyPlan[] = [
  {
    name: 'PROJECT_R',
    envKey: 'PROJECT_R_STRIPE_API_KEY',
    prices: [
      // 240 -> 260; old price stays active and gets lookup key ABO_2026
      // (YEARLY_REDUCED uses it until 31.12.2026)
      { lookupKey: 'ABO', newAmount: 260_00, oldPriceNewLookupKey: 'ABO_2026' },
    ],
    promos: [
      { code: 'EINSTIEG', newAmountOff: 38_00 }, // 260 - 38 = 222
      { code: /^U30M\d{3}$/, newAmountOff: 161_00 }, // 260 - 161 = 99
      { code: 'YEARLY160', newAmountOff: 100_00 }, // 260 - 100 = 160
    ],
    coupons: [
      { envVar: 'PAYMENTS_PROJECT_R_YEARLY_GIFT_COUPON', newAmountOff: 260_00 },
      // reduced memberships keep their price: each discount +20, used from 01.01.2027
      {
        envVar: 'PAYMENTS_PROJECT_R_REDUCED_MEMBERSHIP_DISCOUNTS',
        delta: 20_00,
        targetEnvVar: 'PAYMENTS_PROJECT_R_REDUCED_MEMBERSHIP_DISCOUNTS_2027',
      },
    ],
    newPromos: [
      // December transition discount (decided): first year at most 240 (260 - 20)
      { code: 'PREIS2026', couponName: 'Bisheriger Preis bis 31.12.', amountOff: 20_00, expiresAt: TRANSITION_EXPIRES_AT },
    ],
  },
  {
    name: 'REPUBLIK',
    envKey: 'REPUBLIK_STRIPE_API_KEY',
    prices: [{ lookupKey: 'MONTHLY_ABO', newAmount: 24_00 }],
    promos: [
      { code: 'EINSTIEG', newAmountOff: 13_00 }, // 24 - 13 = 11
      { code: 'EINSTIEG24', newAmountOff: 13_00 },
      { code: /^U30M\d{3}$/, newAmountOff: 15_00 }, // 24 - 15 = 9
    ],
    coupons: [
      { envVar: 'PAYMENTS_REPUBLIK_3_MONTH_GIFT_COUPON', newAmountOff: 24_00 },
    ],
    newPromos: [
      // December transition discount (decided): first month at most 22 (24 - 2)
      { code: 'PREIS2026', couponName: 'Bisheriger Preis bis 31.12.', amountOff: 2_00, expiresAt: TRANSITION_EXPIRES_AT },
    ],
  },
]

function assertKey(envKey: string): string {
  const key = process.env[envKey]
  if (!key) {
    console.error(`${envKey} missing`)
    process.exit(1)
  }
  const isTest = /^(sk|rk)_test_/.test(key)
  const isLive = /^(sk|rk)_live_/.test(key)
  if (!isTest && !isLive) {
    console.error(`${envKey} is not a recognised Stripe secret/restricted key`)
    process.exit(1)
  }
  if (isLive && !LIVE) {
    console.error(`${envKey} is a live key. Pass --live to run against live data.`)
    process.exit(1)
  }
  if (isTest && LIVE) {
    console.error(`--live passed but ${envKey} is a test key`)
    process.exit(1)
  }
  return key
}

// Every object Stripe returns must match the mode we intend to run in.
function assertMode<T extends { livemode?: boolean }>(obj: T): T {
  if (obj.livemode !== LIVE) {
    throw new Error(`Refusing to continue: Stripe returned livemode=${obj.livemode}, expected ${LIVE}`)
  }
  return obj
}

async function confirmLive() {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(
    `You are about to ${APPLY ? 'CHANGE' : 'read'} LIVE Stripe data for ${PLAN.map((c) => c.name).join(' + ')}.\n` +
      `Type "${LIVE_CONFIRMATION}" to continue: `,
  )
  rl.close()
  if (answer.trim() !== LIVE_CONFIRMATION) {
    console.error('Not confirmed – aborting.')
    process.exit(1)
  }
}

const log = (company: CompanyName, ...args: unknown[]) =>
  console.log(`[${company}]${LIVE ? ' [LIVE]' : ' [test]'}${APPLY ? '' : ' [dry-run]'}`, ...args)

async function changePrices(stripe: Stripe, company: CompanyName, changes: PriceChange[]) {
  const result: Record<string, unknown>[] = []
  for (const change of changes) {
    const { data } = await stripe.prices.list({ lookup_keys: [change.lookupKey], limit: 1 })
    const current = data[0] && assertMode(data[0])
    if (!current) {
      log(company, `no price with lookup key ${change.lookupKey} – skipping`)
      continue
    }
    if (current.unit_amount === change.newAmount) {
      log(company, `${change.lookupKey} already at ${change.newAmount} (${current.id}) – skipping`)
      continue
    }

    log(company, `price ${change.lookupKey}: ${current.unit_amount} -> ${change.newAmount}`, {
      currentPriceId: current.id,
      product: current.product,
      oldPriceNewLookupKey: change.oldPriceNewLookupKey,
    })
    if (!APPLY) continue

    const created = assertMode(
      await stripe.prices.create({
        product: typeof current.product === 'string' ? current.product : current.product.id,
        currency: current.currency,
        unit_amount: change.newAmount,
        recurring: current.recurring
          ? {
              interval: current.recurring.interval,
              interval_count: current.recurring.interval_count,
            }
          : undefined,
        tax_behavior: current.tax_behavior ?? undefined,
        nickname: `${current.nickname ?? change.lookupKey} (ab 2027)`,
        lookup_key: change.lookupKey,
        transfer_lookup_key: true,
        metadata: { ...current.metadata, ...METADATA },
      }),
    )

    if (change.oldPriceNewLookupKey) {
      assertMode(
        await stripe.prices.update(current.id, {
          lookup_key: change.oldPriceNewLookupKey,
          transfer_lookup_key: true,
        }),
      )
    }

    result.push({ lookupKey: change.lookupKey, oldPriceId: current.id, newPriceId: created.id })
  }
  return result
}

async function listActivePromotionCodes(stripe: Stripe) {
  const codes: Stripe.PromotionCode[] = []
  for await (const pc of stripe.promotionCodes.list({ active: true, limit: 100 })) {
    codes.push(assertMode(pc))
  }
  return codes
}

function couponCreateParams(old: Stripe.Coupon, newAmountOff: number): Stripe.CouponCreateParams {
  if (old.amount_off === null) {
    throw new Error(`coupon ${old.id} is not amount_off – not handled`)
  }
  return {
    name: old.name ?? undefined,
    amount_off: newAmountOff,
    currency: old.currency ?? 'chf',
    duration: old.duration,
    duration_in_months: old.duration_in_months ?? undefined,
    max_redemptions: old.max_redemptions ?? undefined,
    redeem_by: old.redeem_by ?? undefined,
    applies_to: old.applies_to?.products?.length
      ? { products: old.applies_to.products }
      : undefined,
    metadata: { ...old.metadata, ...METADATA, replaces: old.id },
  }
}

async function changePromos(stripe: Stripe, company: CompanyName, changes: PromoChange[]) {
  const result: Record<string, unknown>[] = []
  const active = await listActivePromotionCodes(stripe)
  // codes sharing an old coupon (EINSTIEG + EINSTIEG24) get one shared new coupon
  const newCouponByOldCoupon = new Map<string, string>()

  for (const change of changes) {
    const matches = active.filter((pc) =>
      typeof change.code === 'string' ? pc.code === change.code : change.code.test(pc.code),
    )
    if (matches.length === 0) {
      log(company, `no active promotion code matching ${change.code} – skipping`)
      continue
    }

    for (const pc of matches) {
      const oldCoupon = pc.coupon
      if (oldCoupon.amount_off === change.newAmountOff) {
        log(company, `${pc.code} already at ${change.newAmountOff} off – skipping`)
        continue
      }

      log(company, `promo ${pc.code}: coupon ${oldCoupon.id} ${oldCoupon.amount_off} -> ${change.newAmountOff} off`, {
        duration: oldCoupon.duration,
        duration_in_months: oldCoupon.duration_in_months,
      })
      if (!APPLY) continue

      let newCouponId = newCouponByOldCoupon.get(oldCoupon.id)
      if (!newCouponId) {
        const created = assertMode(
          await stripe.coupons.create(couponCreateParams(oldCoupon, change.newAmountOff)),
        )
        newCouponId = created.id
        newCouponByOldCoupon.set(oldCoupon.id, newCouponId)
      }

      // a code can only be active once -> deactivate old, then create new
      assertMode(await stripe.promotionCodes.update(pc.id, { active: false }))
      const newPc = assertMode(
        await stripe.promotionCodes.create({
          coupon: newCouponId,
          code: pc.code,
          expires_at: pc.expires_at ?? undefined,
          max_redemptions: pc.max_redemptions ?? undefined,
          restrictions: {
            first_time_transaction: pc.restrictions.first_time_transaction,
            minimum_amount: pc.restrictions.minimum_amount ?? undefined,
            minimum_amount_currency: pc.restrictions.minimum_amount_currency ?? undefined,
          },
          metadata: { ...pc.metadata, ...METADATA, replaces: pc.id },
        }),
      )

      result.push({
        code: pc.code,
        oldPromotionCodeId: pc.id,
        newPromotionCodeId: newPc.id,
        oldCouponId: oldCoupon.id,
        newCouponId,
      })
    }
  }
  return result
}

async function changeCoupons(stripe: Stripe, company: CompanyName, changes: CouponChange[]) {
  const result: Record<string, unknown>[] = []
  for (const change of changes) {
    const couponIds = (process.env[change.envVar] ?? '').split(';').map((s) => s.trim()).filter(Boolean)
    if (couponIds.length === 0) {
      log(company, `${change.envVar} not set – skipping`)
      continue
    }

    const newIds: string[] = []
    for (const couponId of couponIds) {
      const old = assertMode(await stripe.coupons.retrieve(couponId))
      if (old.amount_off === null) {
        log(company, `coupon ${old.id} is not amount_off – skipping`)
        newIds.push(old.id)
        continue
      }
      if (change.delta !== undefined && old.metadata?.campaign === METADATA.campaign) {
        log(company, `coupon ${old.id} was already created by this script – skipping`)
        newIds.push(old.id)
        continue
      }
      const target = change.delta !== undefined ? old.amount_off + change.delta : change.newAmountOff!
      if (old.amount_off === target) {
        log(company, `coupon ${old.id} already at ${target} off – skipping`)
        newIds.push(old.id)
        continue
      }
      log(company, `coupon ${change.envVar} (${old.id}, ${old.name}) ${old.amount_off} -> ${target} off`)
      if (!APPLY) continue

      const created = assertMode(await stripe.coupons.create(couponCreateParams(old, target)))
      newIds.push(created.id)
      result.push({ envVar: change.envVar, oldCouponId: old.id, newCouponId: created.id })
    }
    const target = ('targetEnvVar' in change && change.targetEnvVar) || change.envVar
    if (APPLY) log(company, `set ${target}=${newIds.join(';')}`)
  }
  return result
}

async function createNewPromos(stripe: Stripe, company: CompanyName, promos: NewPromo[]) {
  const result: Record<string, unknown>[] = []
  for (const promo of promos) {
    const existing = await stripe.promotionCodes.list({ code: promo.code, active: true, limit: 1 })
    if (existing.data[0]) {
      assertMode(existing.data[0])
      log(company, `promo ${promo.code} already exists (${existing.data[0].id}) – skipping`)
      continue
    }
    log(company, `new promo ${promo.code}: «${promo.couponName}» ${promo.amountOff} off once, expires ${new Date(promo.expiresAt * 1000).toISOString()}`)
    if (!APPLY) continue

    const coupon = assertMode(
      await stripe.coupons.create({
        name: promo.couponName,
        amount_off: promo.amountOff,
        currency: 'chf',
        duration: 'once',
        redeem_by: promo.expiresAt,
        metadata: METADATA,
      }),
    )
    const pc = assertMode(
      await stripe.promotionCodes.create({
        coupon: coupon.id,
        code: promo.code,
        expires_at: promo.expiresAt,
        metadata: METADATA,
      }),
    )
    result.push({ code: promo.code, couponId: coupon.id, promotionCodeId: pc.id })
  }
  return result
}

async function main() {
  // check all keys before touching anything
  const keys = PLAN.map((company) => assertKey(company.envKey))
  if (LIVE && APPLY) await confirmLive()

  const summary: Record<string, unknown> = {}
  for (const [i, company] of PLAN.entries()) {
    const stripe = new Stripe(keys[i], {
      apiVersion: STRIPE_API_VERSION as Stripe.LatestApiVersion,
    })
    summary[company.name] = {
      prices: await changePrices(stripe, company.name, company.prices),
      promotionCodes: await changePromos(stripe, company.name, company.promos),
      coupons: await changeCoupons(stripe, company.name, company.coupons),
      newPromotionCodes: await createNewPromos(stripe, company.name, company.newPromos),
    }
  }

  console.log(JSON.stringify(summary, null, 2))
  if (!APPLY) console.log('Dry run – nothing was written. Re-run with --apply to write.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
