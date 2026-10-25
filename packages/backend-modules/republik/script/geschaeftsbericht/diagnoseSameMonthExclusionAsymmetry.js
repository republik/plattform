#!/usr/bin/env node
// Ad-hoc diagnostic: LIFECYCLE_EVENTS_QUERY excludes a row from new_events
// if its OWN first_start/last_end fall in the same month (refund/immediate
// cancel, matching Metabase), and separately excludes a row from
// lost_events under the identical condition. That's fine for a single
// continuous entity, but a migration-overlap pair (old membership segment
// + new subscription) is TWO SEPARATE lifecycle rows. If the new
// subscription's own first_start/last_end land in the same month (e.g.
// created and then quickly churned), its "gain" is suppressed -- but the
// OLD segment's "loss" (a distinct row, its own first_start likely years
// earlier) is NOT suppressed, since the old segment's own start/end aren't
// in the same month. That leaves an uncancelled loss with no matching
// gain, or vice versa, purely because the exclusion is per-row instead of
// per real-world transition.
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { CATEGORIZED_CTE } = require('./lib/membershipCategorizedCte')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

const FY_START = '2025-07-01'
const FY_END = '2026-06-30'

// Re-derive the LIFECYCLE_CATEGORIZED_CTE's raw first_start/last_end/is_canceled
// per row (without the new_events/lost_events month filtering) so we can see
// which rows would have been excluded by the same-month rule.
const { LIFECYCLE_EVENTS_QUERY } = require('./lib/membershipLifecycleCte')
// Pull just the CTE definition text (everything before "SELECT event_month")
const LIFECYCLE_CATEGORIZED_CTE = LIFECYCLE_EVENTS_QUERY.split(', new_events AS')[0]

const QUERY =
  LIFECYCLE_CATEGORIZED_CTE +
  `
SELECT id, "userId", category, first_start, last_end, is_canceled,
  (first_start >= $2 AND first_start <= $3) AS gain_in_range,
  (is_canceled AND last_end >= $2 AND last_end <= $3) AS loss_in_range,
  (DATE_TRUNC('month', first_start) = DATE_TRUNC('month', last_end)) AS same_month
FROM lifecycle_categorized
WHERE (first_start >= $2 AND first_start <= $3)
   OR (is_canceled AND last_end >= $2 AND last_end <= $3)
`

const run = async () => {
  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht-diagnose' })
  try {
    const rows = await pgdb.query(QUERY, [EXCLUDED_USER_IDS, FY_START, FY_END])
    const suppressedGains = rows.filter((r) => r.gain_in_range && r.same_month)
    const suppressedLosses = rows.filter((r) => r.loss_in_range && r.same_month)
    console.log(`rows with a gain in-range but suppressed by same-month rule: ${suppressedGains.length}`)
    console.log(`rows with a loss in-range but suppressed by same-month rule: ${suppressedLosses.length}`)
    console.log(`net effect of suppression alone: ${suppressedLosses.length - suppressedGains.length} (positive = net undercounted losses)`)

    suppressedGains.slice(0, 10).forEach((r) =>
      console.log(`  [suppressed gain] ${r.id} cat=${r.category} first_start=${r.first_start.toISOString().slice(0,10)} last_end=${r.last_end ? r.last_end.toISOString().slice(0,10) : 'null'}`),
    )
    suppressedLosses.slice(0, 10).forEach((r) =>
      console.log(`  [suppressed loss] ${r.id} cat=${r.category} first_start=${r.first_start.toISOString().slice(0,10)} last_end=${r.last_end.toISOString().slice(0,10)}`),
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
