#!/usr/bin/env node
// Ad-hoc diagnostic: find new-system subscriptions that WERE covered by an
// invoice at some point within the FY, then stopped being covered by any
// invoice by FY end (2026-06-30) -- i.e. the count query would correctly
// exclude them from that point on -- while Stripe never set
// endedAt/cancelAt on the subscription itself. The lifecycle query's
// is_canceled requires endedAt/cancelAt, so these never generate a "lost"
// event: a real, permanent count drop with zero offsetting entry in net.
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

const FY_START = '2025-07-01'
const FY_END = '2026-06-30'

const QUERY = `
WITH candidate_subs AS (
  -- subscriptions never formally ended/cancelled, per Stripe
  SELECT s.id, s."userId", s."createdAt", s.status
  FROM payments.subscriptions s
  WHERE s."userId" != ALL($1::uuid[])
    AND s.status NOT IN ('incomplete', 'incomplete_expired')
    AND COALESCE(s."endedAt", s."cancelAt") IS NULL
),
last_invoice AS (
  SELECT DISTINCT ON (i."subscriptionId")
    i."subscriptionId", i."periodStart", i."periodEnd"
  FROM payments.invoices i
  ORDER BY i."subscriptionId", i."periodEnd" DESC
)
SELECT cs.id, cs."userId", cs."createdAt", cs.status,
  li."periodStart" AS last_period_start, li."periodEnd" AS last_period_end
FROM candidate_subs cs
JOIN last_invoice li ON li."subscriptionId" = cs.id
-- last invoice's period ended before FY end, i.e. not covering the FY-end
-- snapshot -- the count query would have already stopped counting them
WHERE li."periodEnd" < $2::date
ORDER BY li."periodEnd" DESC
`

const run = async () => {
  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht-diagnose' })
  try {
    const rows = await pgdb.query(QUERY, [EXCLUDED_USER_IDS, FY_END])
    console.log(`subscriptions never formally cancelled, but with no invoice covering FY end (${FY_END}): ${rows.length}`)
    rows.slice(0, 30).forEach((r) =>
      console.log(`  ${r.id} status=${r.status} createdAt=${r.createdAt.toISOString().slice(0,10)} lastPeriod=${r.last_period_start.toISOString().slice(0,10)}..${r.last_period_end.toISOString().slice(0,10)}`),
    )
    // how many of these had their last invoice period end WITHIN the FY
    // (i.e. the drop itself happened during the FY, not before it started)
    const droppedInFy = rows.filter((r) => r.last_period_end.toISOString().slice(0,10) >= FY_START)
    console.log(`\nof those, last invoice period ended WITHIN the FY (a drop that happened this year): ${droppedInFy.length}`)
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
