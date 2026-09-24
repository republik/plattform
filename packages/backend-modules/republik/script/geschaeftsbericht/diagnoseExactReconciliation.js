#!/usr/bin/env node
// Exact, id-level reconciliation between the two methodologies used in
// membershipEvolutionByFiscalYear.js:
//  - "diff": the categorized() id-set at each FY month-end, diffed
//    month-to-month. This is TAUTOLOGICALLY exact -- summed over the FY it
//    must equal count(2026-06-30) - count(2025-07-31) exactly, since it's
//    derived directly from the same ids the count query uses.
//  - "lifecycle": the gain/loss events from LIFECYCLE_EVENTS_QUERY.
//
// For every id (old-system ids normalized to their base membershipId,
// stripping the "-seq-N" lifecycle suffix -- a single membership can split
// into several lifecycle segments but the count query only ever sees the
// bare membership id), compute:
//   net_diff[id]      = (# times id was added across the 11 month-to-month
//                        diffs) - (# times removed)
//   net_lifecycle[id] = (# gain events within FY) - (# loss events within FY)
// Any id where these disagree is a concrete, named discrepancy. Summed
// over all ids, the disagreement must total exactly
// sum(lifecycle net) - (count(2026-06-30) - count(2025-07-31)).
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const dayjs = require('dayjs')
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.extend(require('dayjs/plugin/timezone'))

const { endOfDayInZurich } = require('./lib/dates')
const { CATEGORIZED_CTE } = require('./lib/membershipCategorizedCte')
const { LIFECYCLE_EVENTS_QUERY } = require('./lib/membershipLifecycleCte')
const {
  MITGLIEDSCHAFTEN_CATEGORIES,
  ABONNEMENTE_CATEGORIES,
} = require('./lib/membershipCategories')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

// Restricted to Mitgliedschaften only -- that's the specific Total the
// 13-unit gap was originally reported against (25317 -> 30362). Change to
// the ABONNEMENTE_CATEGORIES set (or the union) to check that total too,
// but don't conflate the two -- they're separate published totals.
const ALL_CATEGORIES = new Set(MITGLIEDSCHAFTEN_CATEGORIES)

// NOTE: starts at August, not July -- 2025-07-31 is used as the fixed
// baseline count (matching the original user calculation: base + sum of
// net for Aug-Jun), so July's own lifecycle events must be excluded from
// this comparison, or they'd double count against the baseline.
const FY_START = '2025-08-01'
const FY_END = '2026-06-30'

const ID_QUERY =
  CATEGORIZED_CTE +
  `
SELECT id, category FROM categorized
`

// Use the real (original, unmodified) production query directly rather
// than hand-reconstructing new_events/lost_events here -- just swap
// event_month for the raw event date so we can bucket by id instead of by
// month. Matches the CURRENT text of lib/membershipLifecycleCte.js -- the
// cross-system dedup fix explored earlier in this investigation was
// reverted (too fragile to ship after repeated regressions), so this
// targets the original, unfixed query.
const LIFECYCLE_ID_QUERY = LIFECYCLE_EVENTS_QUERY
  .replace(
    `SELECT DATE_TRUNC('month', first_start)::date AS event_month, category, id`,
    `SELECT first_start AS event_date, category, id`,
  )
  .replace(
    `SELECT DATE_TRUNC('month', last_end)::date AS event_month, category, id`,
    `SELECT last_end AS event_date, category, id`,
  )
  .replace(
    `SELECT event_month, category, 'gain'::text AS event_type, COUNT(DISTINCT id)::int AS count
FROM new_events
GROUP BY 1, 2
UNION ALL
SELECT event_month, category, 'loss'::text AS event_type, COUNT(DISTINCT id)::int AS count
FROM lost_events
GROUP BY 1, 2`,
    `SELECT event_date, category, 'gain'::text AS event_type, id FROM new_events
UNION ALL
SELECT event_date, category, 'loss'::text AS event_type, id FROM lost_events`,
  )

const baseId = (lifecycleId) => lifecycleId.replace(/-seq-\d+$/, '')

const buildMonthEnds = () => {
  const end = endOfDayInZurich(FY_END)
  const months = []
  let month = end.subtract(1, 'year')
  for (let i = 0; i < 12; i++) {
    month = month.add(1, 'month').endOf('month')
    months.push(month)
  }
  return months
}

const run = async () => {
  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht-diagnose' })
  try {
    const months = buildMonthEnds()

    console.log(`fetching categorized id-sets for ${months.length} month-ends…`)
    const idSets = []
    for (const month of months) {
      const rows = await pgdb.query(ID_QUERY, [month.toDate(), EXCLUDED_USER_IDS])
      const set = new Set(rows.filter((r) => ALL_CATEGORIES.has(r.category)).map((r) => r.id))
      idSets.push(set)
      console.log(`  ${month.format('YYYY-MM-DD')}: ${set.size} ids`)
    }

    // diff-based net per id across the 11 month-to-month transitions
    const netDiff = new Map()
    for (let i = 1; i < idSets.length; i++) {
      const prev = idSets[i - 1]
      const curr = idSets[i]
      for (const id of curr) {
        if (!prev.has(id)) netDiff.set(id, (netDiff.get(id) || 0) + 1)
      }
      for (const id of prev) {
        if (!curr.has(id)) netDiff.set(id, (netDiff.get(id) || 0) - 1)
      }
    }
    const totalDiffNet = [...netDiff.values()].reduce((a, b) => a + b, 0)
    const expectedNet = idSets[idSets.length - 1].size - idSets[0].size
    console.log(`\ndiff-based total net: ${totalDiffNet} (sanity check, must equal final-baseline: ${expectedNet})`)

    console.log(`\nfetching lifecycle events…`)
    const asOfEnd = endOfDayInZurich(FY_END).toDate()
    const lifecycleRows = await pgdb.query(LIFECYCLE_ID_QUERY, [EXCLUDED_USER_IDS, FY_START, asOfEnd])
    const netLifecycle = new Map()
    lifecycleRows
      .filter((r) => ALL_CATEGORIES.has(r.category))
      .forEach((r) => {
        const id = baseId(r.id)
        const delta = r.event_type === 'gain' ? 1 : -1
        netLifecycle.set(id, (netLifecycle.get(id) || 0) + delta)
      })
    const totalLifecycleNet = [...netLifecycle.values()].reduce((a, b) => a + b, 0)
    console.log(`lifecycle-based total net: ${totalLifecycleNet}`)
    console.log(`gap (lifecycle - diff): ${totalLifecycleNet - totalDiffNet}`)

    // per-id reconciliation
    const allIds = new Set([...netDiff.keys(), ...netLifecycle.keys()])
    const mismatches = []
    for (const id of allIds) {
      const d = netDiff.get(id) || 0
      const l = netLifecycle.get(id) || 0
      if (d !== l) mismatches.push({ id, diffNet: d, lifecycleNet: l, gap: l - d })
    }
    mismatches.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
    console.log(`\n${mismatches.length} ids disagree between diff-based and lifecycle-based net`)

    // histogram of (diffNet, lifecycleNet) pairs -- far more readable than
    // dumping every id when there are hundreds
    const histogram = new Map()
    mismatches.forEach((m) => {
      const key = `diffNet=${m.diffNet} lifecycleNet=${m.lifecycleNet} (gap=${m.gap})`
      histogram.set(key, (histogram.get(key) || 0) + 1)
    })
    console.log(`\nhistogram of mismatch patterns:`)
    ;[...histogram.entries()]
      .sort((a, b) => b[1] - a[1])
      .forEach(([key, count]) => console.log(`  ${count.toString().padStart(5)}x  ${key}`))

    // a handful of sample ids per pattern, for manual inspection
    console.log(`\nsample ids per pattern (up to 5 each):`)
    const byPattern = new Map()
    mismatches.forEach((m) => {
      const key = `diffNet=${m.diffNet} lifecycleNet=${m.lifecycleNet}`
      if (!byPattern.has(key)) byPattern.set(key, [])
      if (byPattern.get(key).length < 5) byPattern.get(key).push(m.id)
    })
    ;[...byPattern.entries()].forEach(([key, ids]) => console.log(`  ${key}: ${ids.join(', ')}`))

    const totalGap = mismatches.reduce((sum, m) => sum + m.gap, 0)
    console.log(`\nsum of all per-id gaps: ${totalGap} (must equal ${totalLifecycleNet - totalDiffNet} above)`)
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
