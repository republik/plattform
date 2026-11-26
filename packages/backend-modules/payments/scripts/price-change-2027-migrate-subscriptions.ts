/**
 * Price change 2027 – migrate existing Stripe subscriptions to the new prices
 *
 * Moves subscriptions whose NEXT renewal is on/after 01.01.2027 from the old
 * price to the new one (proration_behavior: 'none' → current period unchanged,
 * next invoice uses the new price). See price-change-2027.md.
 *
 *   REPUBLIK   price `MONTHLY_ABO` (22.–)  → lookup key MONTHLY_ABO (24.–)
 *              covers legacy MONTHLY_ABO memberships and MONTHLY_SUBSCRIPTION
 *   PROJECT_R  yearly 240.– price(s)      → lookup key ABO (260.–)
 *
 * Run AFTER the setup script (new prices + new U30 coupons must exist).
 * Planned runs: (1) after the opt-out cutoff mid December, (2) on 31.12.2026.
 * Upgrades still on 240 (registered before 01.12.) are picked up by a later run
 * once their subscription exists – the first year stays at 240.
 *
 * SKIPPED (listed in the report):
 *   - users on the opt-out list (CSV of user ids)
 *   - next renewal before 01.01.2027 (picked up by the 31.12. run)
 *   - cancelling subscriptions, subscriptions managed by a schedule
 *   - additional items (recurring donation)
 *   - reduced memberships (metadata republik.reduced-price-reason)
 *   - any discount other than U30 → manual review
 * U30 («Angebot für Junge»): price + discount are swapped together so the
 * price stays 99.– / 9.–; the new coupon covers the remaining discount months.
 *
 * SAFETY
 *   - Dry run by default. Pass --apply to write.
 *   - Live keys only with --live AND the typed confirmation phrase.
 *   - Every Stripe response is checked against the expected mode.
 *   - --apply requires --opt-out <file> (or explicitly --no-opt-out).
 *   - Idempotent: subscriptions already on the new price are not touched.
 *   - Live runs are done by a person only (never by an AI agent).
 *
 * USAGE
 *   PROJECT_R_STRIPE_API_KEY=… REPUBLIK_STRIPE_API_KEY=… DATABASE_URL=… \
 *     deno -RNEW --unstable-sloppy-imports price-change-2027-migrate-subscriptions.ts \
 *       [--company PROJECT_R|REPUBLIK] [--opt-out optout.csv | --no-opt-out] \
 *       [--limit 10] [--report report.csv] [--apply] [--live]
 *
 *   DATABASE_URL is only read (SELECT) to map opt-out user ids to Stripe customers.
 */
import Stripe from 'stripe'
import { PgDb } from 'pogi'
import { readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'

const STRIPE_API_VERSION = '2025-08-27.basil'
const LIVE_CONFIRMATION = 'PREISE 2027 MIGRATION LIVE'
const RENEWAL_FROM = Math.floor(Date.parse('2027-01-01T00:00:00+01:00') / 1000)
const MARKER = 'price_change_2027'
const U30_TRANSFER_CAMPAIGN = 'price-change-2027-u30-transfer'
const MIGRATABLE_STATUSES: Stripe.Subscription.Status[] = ['active', 'trialing', 'past_due']

type CompanyName = 'PROJECT_R' | 'REPUBLIK'

type CompanyPlan = {
  name: CompanyName
  envKey: string
  newLookupKey: string
  newAmount: number
  oldAmount: number
  interval: 'month' | 'year'
  u30AmountOff: number // new U30 discount so the price stays at 99 / 9
}

const PLAN: CompanyPlan[] = [
  {
    name: 'PROJECT_R',
    envKey: 'PROJECT_R_STRIPE_API_KEY',
    newLookupKey: 'ABO',
    newAmount: 260_00,
    oldAmount: 240_00,
    interval: 'year',
    u30AmountOff: 161_00,
  },
  {
    name: 'REPUBLIK',
    envKey: 'REPUBLIK_STRIPE_API_KEY',
    newLookupKey: 'MONTHLY_ABO',
    newAmount: 24_00,
    oldAmount: 22_00,
    interval: 'month',
    u30AmountOff: 15_00,
  },
]

// ---------------------------------------------------------------- args

const argv = process.argv.slice(2)
const flag = (name: string) => argv.includes(name)
const option = (name: string) => {
  const i = argv.indexOf(name)
  return i >= 0 ? argv[i + 1] : undefined
}

const APPLY = flag('--apply')
const LIVE = flag('--live')
const ONLY_COMPANY = option('--company') as CompanyName | undefined
const OPT_OUT_FILE = option('--opt-out')
const NO_OPT_OUT = flag('--no-opt-out')
const LIMIT = option('--limit') ? Number(option('--limit')) : undefined
const REPORT_FILE =
  option('--report') ??
  `price-change-2027-migration-${LIVE ? 'live' : 'test'}-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`

if (ONLY_COMPANY && !PLAN.some((c) => c.name === ONLY_COMPANY)) {
  console.error(`unknown --company ${ONLY_COMPANY}`)
  process.exit(1)
}
if (APPLY && !OPT_OUT_FILE && !NO_OPT_OUT) {
  console.error('--apply requires --opt-out <file> (or explicitly --no-opt-out)')
  process.exit(1)
}

// ---------------------------------------------------------------- guards

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

function assertMode<T extends { livemode?: boolean }>(obj: T): T {
  if (obj.livemode !== LIVE) {
    throw new Error(`Refusing to continue: Stripe returned livemode=${obj.livemode}, expected ${LIVE}`)
  }
  return obj
}

async function confirmLive(companies: CompanyPlan[]) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(
    `You are about to CHANGE LIVE subscriptions for ${companies.map((c) => c.name).join(' + ')}.\n` +
      `Type "${LIVE_CONFIRMATION}" to continue: `,
  )
  rl.close()
  if (answer.trim() !== LIVE_CONFIRMATION) {
    console.error('Not confirmed – aborting.')
    process.exit(1)
  }
}

// ---------------------------------------------------------------- opt-out

function readOptOutUserIds(file: string): string[] {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const ids = readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.split(/[,;]/)[0].trim().replace(/^"|"$/g, ''))
    .filter((v) => uuid.test(v))
  return [...new Set(ids)]
}

// customer ids of opted-out users, per company (new + legacy customer table)
async function loadOptOutCustomers(pgdb: PgDb, userIds: string[]) {
  const result = new Map<CompanyName, Set<string>>([
    ['PROJECT_R', new Set()],
    ['REPUBLIK', new Set()],
  ])
  if (userIds.length === 0) return result

  const rows: { company: CompanyName; customerId: string }[] = await pgdb.query(
    `SELECT company, "customerId" FROM payments."stripeCustomers" WHERE "userId" = ANY(:userIds)
     UNION
     SELECT c.name AS company, s.id AS "customerId"
       FROM public."stripeCustomers" s
       JOIN public.companies c ON c.id = s."companyId"
      WHERE s."userId" = ANY(:userIds)`,
    { userIds },
  )
  for (const row of rows) result.get(row.company)?.add(row.customerId)
  return result
}

// ---------------------------------------------------------------- report

type ReportRow = {
  company: CompanyName
  subscription: string
  customer: string
  status: string
  nextRenewal: string
  action: 'migrate' | 'migrated' | 'skip' | 'error'
  reason: string
  oldPrice: string
  newPrice: string
  discount: string
}
const report: ReportRow[] = []

function writeReport() {
  const cols: (keyof ReportRow)[] = [
    'company', 'subscription', 'customer', 'status', 'nextRenewal',
    'action', 'reason', 'oldPrice', 'newPrice', 'discount',
  ]
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
  writeFileSync(
    REPORT_FILE,
    [cols.join(','), ...report.map((r) => cols.map((c) => esc(String(r[c] ?? ''))).join(','))].join('\n') + '\n',
  )
}

// ---------------------------------------------------------------- stripe helpers

async function resolvePrices(stripe: Stripe, plan: CompanyPlan) {
  const { data } = await stripe.prices.list({ lookup_keys: [plan.newLookupKey], limit: 1 })
  const newPrice = data[0] && assertMode(data[0])
  if (!newPrice || newPrice.unit_amount !== plan.newAmount) {
    throw new Error(
      `[${plan.name}] lookup key ${plan.newLookupKey} is not on a ${plan.newAmount} price yet – run the setup script first`,
    )
  }
  const product = typeof newPrice.product === 'string' ? newPrice.product : newPrice.product.id

  const oldPrices: Stripe.Price[] = []
  for await (const p of stripe.prices.list({ product, limit: 100 })) {
    assertMode(p)
    if (
      p.id !== newPrice.id &&
      p.unit_amount === plan.oldAmount &&
      p.recurring?.interval === plan.interval &&
      (p.recurring?.interval_count ?? 1) === 1
    ) {
      oldPrices.push(p)
    }
  }
  if (oldPrices.length === 0) throw new Error(`[${plan.name}] no old ${plan.oldAmount} price found`)
  return { newPrice, oldPrices }
}

function isU30(coupon: Stripe.Coupon) {
  return coupon.name === 'Angebot für Junge' || /^U30/.test(coupon.metadata?.campaign ?? '')
}

// remaining whole months of a discount, counted from now (rounded up)
function remainingMonths(discount: Stripe.Discount) {
  if (!discount.end) return null
  const months = (discount.end * 1000 - Date.now()) / (1000 * 60 * 60 * 24 * 30.4375)
  return Math.max(1, Math.ceil(months))
}

function makeU30CouponResolver(stripe: Stripe, plan: CompanyPlan) {
  let cache: Map<number, string> | undefined
  return async (months: number): Promise<string | null> => {
    if (!cache) {
      cache = new Map()
      for await (const c of stripe.coupons.list({ limit: 100 })) {
        assertMode(c)
        if (c.valid && c.metadata?.campaign === U30_TRANSFER_CAMPAIGN && c.amount_off === plan.u30AmountOff) {
          cache.set(Number(c.metadata.months), c.id)
        }
      }
    }
    const existing = cache.get(months)
    if (existing) return existing
    if (!APPLY) return null

    const created = assertMode(
      await stripe.coupons.create({
        name: 'Angebot für Junge',
        amount_off: plan.u30AmountOff,
        currency: 'chf',
        duration: 'repeating',
        duration_in_months: months,
        metadata: { campaign: U30_TRANSFER_CAMPAIGN, months: String(months) },
      }),
    )
    cache.set(months, created.id)
    return created.id
  }
}

// ---------------------------------------------------------------- migration

async function migrateCompany(stripe: Stripe, plan: CompanyPlan, optOutCustomers: Set<string>) {
  const { newPrice, oldPrices } = await resolvePrices(stripe, plan)
  const resolveU30Coupon = makeU30CouponResolver(stripe, plan)
  console.log(
    `[${plan.name}] new price ${newPrice.id} (${plan.newAmount}), old price(s) ${oldPrices.map((p) => p.id).join(', ')}`,
  )

  let processed = 0
  for (const oldPrice of oldPrices) {
    for await (const sub of stripe.subscriptions.list({
      price: oldPrice.id,
      limit: 100,
      expand: ['data.discounts'],
    })) {
      if (LIMIT !== undefined && processed >= LIMIT) return
      processed++
      assertMode(sub)

      const customer = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
      const item = sub.items.data.find((i) => i.price.id === oldPrice.id)
      const nextRenewal = item?.current_period_end
      const row: ReportRow = {
        company: plan.name,
        subscription: sub.id,
        customer,
        status: sub.status,
        nextRenewal: nextRenewal ? new Date(nextRenewal * 1000).toISOString() : '',
        action: 'skip',
        reason: '',
        oldPrice: oldPrice.id,
        newPrice: newPrice.id,
        discount: '',
      }
      report.push(row)

      const discounts = (sub.discounts ?? []).filter((d): d is Stripe.Discount => typeof d !== 'string')
      row.discount = discounts.map((d) => `${d.coupon.name ?? d.coupon.id} (${d.coupon.amount_off ?? d.coupon.percent_off + '%'})`).join(' | ')

      // --- exclusions
      if (!item) { row.reason = 'old price item not found'; continue }
      if (!MIGRATABLE_STATUSES.includes(sub.status)) { row.reason = `status ${sub.status}`; continue }
      if (optOutCustomers.has(customer)) { row.reason = 'opt-out'; continue }
      if (sub.cancel_at_period_end || sub.cancel_at) { row.reason = 'cancelling'; continue }
      if (sub.schedule) { row.reason = 'managed by schedule'; continue }
      if (!nextRenewal || nextRenewal < RENEWAL_FROM) { row.reason = 'next renewal before 2027 (next run)'; continue }
      if (sub.items.data.length > 1) { row.reason = 'additional items (recurring donation?)'; continue }
      if (sub.metadata?.['republik.reduced-price-reason']) { row.reason = 'reduced membership'; continue }

      let newDiscounts: Stripe.SubscriptionUpdateParams.Discount[] | undefined
      if (discounts.length > 0) {
        const u30 = discounts.length === 1 && isU30(discounts[0].coupon) ? discounts[0] : null
        if (!u30) { row.reason = 'discount – manual review'; continue }
        const months = remainingMonths(u30)
        if (!months) { row.reason = 'U30 discount without end – manual review'; continue }
        const couponId = await resolveU30Coupon(months)
        row.discount += ` → U30 ${plan.u30AmountOff} off × ${months} months (${couponId ?? 'new coupon'})`
        if (couponId) newDiscounts = [{ coupon: couponId }]
      }

      row.action = 'migrate'
      if (!APPLY) continue

      try {
        assertMode(
          await stripe.subscriptions.update(sub.id, {
            items: [{ id: item.id, price: newPrice.id }],
            proration_behavior: 'none',
            ...(newDiscounts ? { discounts: newDiscounts } : {}),
            metadata: {
              [MARKER]: 'migrated',
              [`${MARKER}_old_price`]: oldPrice.id,
              [`${MARKER}_at`]: new Date().toISOString(),
            },
          }),
        )
        row.action = 'migrated'
      } catch (e) {
        row.action = 'error'
        row.reason = e instanceof Error ? e.message : String(e)
        if (e instanceof Error && /livemode/.test(e.message)) throw e
      }
    }
  }
}

async function main() {
  const companies = PLAN.filter((c) => !ONLY_COMPANY || c.name === ONLY_COMPANY)
  const keys = companies.map((c) => assertKey(c.envKey)) // check all keys before anything else
  if (LIVE && APPLY) await confirmLive(companies)

  let optOut = new Map<CompanyName, Set<string>>()
  if (OPT_OUT_FILE) {
    const userIds = readOptOutUserIds(OPT_OUT_FILE)
    console.log(`opt-out: ${userIds.length} user ids from ${OPT_OUT_FILE}`)
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL missing (needed to map opt-out user ids to Stripe customers)')
      process.exit(1)
    }
    const pgdb = await PgDb.connect({ connectionString: process.env.DATABASE_URL })
    try {
      optOut = await loadOptOutCustomers(pgdb, userIds)
    } finally {
      await pgdb.close()
    }
  }

  try {
    for (const [i, plan] of companies.entries()) {
      const stripe = new Stripe(keys[i], { apiVersion: STRIPE_API_VERSION as Stripe.LatestApiVersion })
      await migrateCompany(stripe, plan, optOut.get(plan.name) ?? new Set())
    }
  } finally {
    writeReport()
    const count = (a: ReportRow['action']) => report.filter((r) => r.action === a).length
    console.log(
      `${LIVE ? '[LIVE]' : '[test]'}${APPLY ? '' : ' [dry-run]'} subscriptions: ${report.length}, ` +
        `to migrate: ${count('migrate')}, migrated: ${count('migrated')}, skipped: ${count('skip')}, errors: ${count('error')}`,
    )
    const reasons = new Map<string, number>()
    for (const r of report.filter((r) => r.action === 'skip')) reasons.set(r.reason, (reasons.get(r.reason) ?? 0) + 1)
    for (const [reason, n] of reasons) console.log(`  skipped – ${reason}: ${n}`)
    console.log(`report: ${REPORT_FILE}`)
    if (!APPLY) console.log('Dry run – nothing was written. Re-run with --apply to write.')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
