#!/usr/bin/env node
// Reveals the actual Stripe coupons behind the two aggregate rows in
// membershipsAndSubscriptions.js's REDUCED_DURATION_QUERY:
// "Einstiegsangebot oder Kampagnen" (all `duration: 'once'` discounts) and
// "Reduzierte Mitgliedschaften" (all `duration: 'repeating'`/`'forever'`).
// That grouping is coarser than it looks: U30 discounts are created with
// `duration: 'repeating'` and a finite `duration_in_months` tied to the
// person's age (see payments/scripts/create-u30-coupons.ts), tagged with
// `coupon.metadata.campaign = 'U30'` / `'U30M'` -- so today they're hiding
// inside "Reduzierte Mitgliedschaften", not the "once" bucket, even though
// conceptually they're a temporary campaign discount like Einstiegsangebot.
// This groups by the actual coupon name + metadata.campaign + duration +
// duration_in_months so the real breakdown can be designed from real data
// instead of assumptions.
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { DEFAULT_AS_OF, endOfDayInZurich } = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

const argv = yargs
  .option('asOf', {
    coerce: endOfDayInZurich,
    default: endOfDayInZurich(DEFAULT_AS_OF),
  })
  .help()
  .version().argv

const QUERY = `
SELECT
  disc.coupon_id,
  disc.coupon_name,
  disc.campaign,
  disc.duration,
  disc.duration_in_months,
  disc.percent_off,
  disc.amount_off,
  COUNT(DISTINCT s.id)::int AS count
FROM payments.subscriptions s
JOIN payments.invoices i ON i."subscriptionId" = s.id
LEFT JOIN LATERAL (
  SELECT
    d->'coupon'->>'id' AS coupon_id,
    d->'coupon'->>'name' AS coupon_name,
    d->'coupon'->'metadata'->>'campaign' AS campaign,
    d->'coupon'->>'duration' AS duration,
    (d->'coupon'->>'duration_in_months')::int AS duration_in_months,
    d->'coupon'->>'percent_off' AS percent_off,
    d->'coupon'->>'amount_off' AS amount_off
  FROM jsonb_array_elements(i.discounts) d
  LIMIT 1
) disc ON true
WHERE s.type = 'YEARLY_SUBSCRIPTION'
  AND i."periodStart" < $1 AND i."periodEnd" >= $1
  AND i."totalDiscountAmount" > 0
  AND s."userId" != ALL($2::uuid[])
  AND s.status NOT IN ('incomplete', 'incomplete_expired')
GROUP BY 1, 2, 3, 4, 5, 6, 7
ORDER BY count DESC
`

const run = async () => {
  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht-diagnose' })
  try {
    const rows = await pgdb.query(QUERY, [argv.asOf.toDate(), EXCLUDED_USER_IDS])
    console.log(`${rows.length} distinct coupon configurations, as of ${argv.asOf.format('YYYY-MM-DD')}:\n`)
    console.table(rows)
    const total = rows.reduce((sum, r) => sum + r.count, 0)
    console.log(`\ntotal discounted YEARLY_SUBSCRIPTIONs: ${total}`)
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
