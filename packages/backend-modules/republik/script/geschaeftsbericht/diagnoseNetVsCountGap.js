#!/usr/bin/env node
// Ad-hoc diagnostic: why does count(2025-07-31) + sum(net over FY) !=
// count(2026-06-30)? Hypothesis: for NEW-system subscriptions, the
// lifecycle CTE's "new" event fires on s.createdAt (subscription creation),
// while the point-in-time count query requires an invoice whose
// periodStart/periodEnd actually covers the snapshot date. If createdAt
// falls in June but the first invoice's periodStart is in July (trial,
// proration, delayed first invoice), the subscription is counted as "new"
// in June's net but doesn't yet show up in the 2026-06-30 count — a
// phantom gain with no matching count increase. Symmetric check for lost
// (last_end vs count exclusion).
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { endOfDayInZurich } = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

const FY_START = '2025-07-01'
const FY_END = '2026-06-30'

const run = async () => {
  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht-diagnose' })
  const asOfEnd = endOfDayInZurich(FY_END).toDate()

  try {
    // New-system subscriptions whose createdAt is within the FY, but whose
    // first invoice's periodStart is AFTER createdAt's month -- meaning
    // they'd be recorded as a "gain" in createdAt's month while not yet
    // covered by any invoice period at that month's end snapshot.
    const lagRows = await pgdb.query(
      `
      SELECT
        s.id, s."userId", s."createdAt",
        (SELECT MIN(i."periodStart") FROM payments.invoices i WHERE i."subscriptionId" = s.id) AS first_period_start
      FROM payments.subscriptions s
      WHERE s."userId" != ALL($1::uuid[])
        AND s.status NOT IN ('incomplete', 'incomplete_expired')
        AND s."createdAt" >= $2 AND s."createdAt" <= $3
      `,
      [EXCLUDED_USER_IDS, FY_START, asOfEnd],
    )
    const lagged = lagRows.filter((r) => {
      if (!r.first_period_start) return true
      const createdMonth = r.createdAt.toISOString().slice(0, 7)
      const periodMonth = r.first_period_start.toISOString().slice(0, 7)
      return periodMonth > createdMonth
    })
    console.log(`new-system subs created in FY with no/later first invoice period: ${lagged.length} / ${lagRows.length}`)
    lagged.slice(0, 20).forEach((r) =>
      console.log(`  ${r.id} createdAt=${r.createdAt.toISOString().slice(0,10)} firstPeriodStart=${r.first_period_start ? r.first_period_start.toISOString().slice(0,10) : 'NONE'}`),
    )

    // Symmetric: lost events where last_end's month doesn't match when the
    // count query would actually stop seeing them covered.
    const lostRows = await pgdb.query(
      `
      SELECT
        s.id, s."userId", s."endedAt", s."cancelAt",
        (SELECT MAX(i."periodEnd") FROM payments.invoices i WHERE i."subscriptionId" = s.id) AS last_period_end
      FROM payments.subscriptions s
      WHERE s."userId" != ALL($1::uuid[])
        AND s.status NOT IN ('incomplete', 'incomplete_expired')
        AND COALESCE(s."endedAt", s."cancelAt") >= $2 AND COALESCE(s."endedAt", s."cancelAt") <= $3
      `,
      [EXCLUDED_USER_IDS, FY_START, asOfEnd],
    )
    const lostMismatch = lostRows.filter((r) => {
      const lastEnd = r.endedAt || r.cancelAt
      if (!r.last_period_end) return true
      const lastEndMonth = lastEnd.toISOString().slice(0, 7)
      const periodEndMonth = r.last_period_end.toISOString().slice(0, 7)
      return periodEndMonth !== lastEndMonth
    })
    console.log(`\nnew-system subs canceled in FY where last invoice period-end month != last_end month: ${lostMismatch.length} / ${lostRows.length}`)
    lostMismatch.slice(0, 20).forEach((r) =>
      console.log(`  ${r.id} last_end=${(r.endedAt||r.cancelAt).toISOString().slice(0,10)} lastPeriodEnd=${r.last_period_end ? r.last_period_end.toISOString().slice(0,10) : 'NONE'}`),
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
