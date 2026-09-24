#!/usr/bin/env node
// Same exact id-level reconciliation as diagnoseExactReconciliation.js, but
// for JULY 2025 ALONE: the transition from official End-FY8 (2025-06-30)
// to the report's own first row (2025-07-31). The report's July "net"
// value (222) is a lifecycle-based figure; the TRUE point-in-time change
// is count(2025-07-31) - count(2025-06-30). If official End-FY8 = 25112
// (per the comment in membershipEvolutionByFiscalYear.js) and
// count(2025-07-31) = 25317, the true July change is 205, not 222 -- a
// 17-unit gap, on top of the 13-unit Aug-Jun gap already fully diagnosed.
// This finds exactly which id(s) cause it, the same way the other 13 were
// found.
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const dayjs = require('dayjs')
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.extend(require('dayjs/plugin/timezone'))

const { endOfDayInZurich } = require('./lib/dates')
const { CATEGORIZED_CTE } = require('./lib/membershipCategorizedCte')
const { LIFECYCLE_EVENTS_QUERY } = require('./lib/membershipLifecycleCte')
const { MITGLIEDSCHAFTEN_CATEGORIES } = require('./lib/membershipCategories')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

const ALL_CATEGORIES = new Set(MITGLIEDSCHAFTEN_CATEGORIES)

const FY_START = '2025-07-01'
const FY_END = '2025-07-31'

const ID_QUERY =
  CATEGORIZED_CTE +
  `
SELECT id, category FROM categorized
`

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

const run = async () => {
  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht-diagnose' })
  try {
    const juneEnd = endOfDayInZurich('2025-06-30')
    const julyEnd = endOfDayInZurich('2025-07-31')

    const [juneRows, julyRows] = await Promise.all([
      pgdb.query(ID_QUERY, [juneEnd.toDate(), EXCLUDED_USER_IDS]),
      pgdb.query(ID_QUERY, [julyEnd.toDate(), EXCLUDED_USER_IDS]),
    ])
    const juneSet = new Set(juneRows.filter((r) => ALL_CATEGORIES.has(r.category)).map((r) => r.id))
    const julySet = new Set(julyRows.filter((r) => ALL_CATEGORIES.has(r.category)).map((r) => r.id))
    console.log(`count(2025-06-30) = ${juneSet.size}`)
    console.log(`count(2025-07-31) = ${julySet.size}`)
    console.log(`true diff-based July net = ${julySet.size - juneSet.size}`)

    const netDiff = new Map()
    for (const id of julySet) if (!juneSet.has(id)) netDiff.set(id, (netDiff.get(id) || 0) + 1)
    for (const id of juneSet) if (!julySet.has(id)) netDiff.set(id, (netDiff.get(id) || 0) - 1)

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
    console.log(`lifecycle-based July net = ${totalLifecycleNet} (report's CSV value: 222)`)
    console.log(`gap = ${totalLifecycleNet - (julySet.size - juneSet.size)}`)

    const allIds = new Set([...netDiff.keys(), ...netLifecycle.keys()])
    const mismatches = []
    for (const id of allIds) {
      const d = netDiff.get(id) || 0
      const l = netLifecycle.get(id) || 0
      if (d !== l) mismatches.push({ id, diffNet: d, lifecycleNet: l, gap: l - d })
    }
    mismatches.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
    console.log(`\n${mismatches.length} ids disagree for July:`)
    mismatches.forEach((m) => console.log(`  ${m.id}  diffNet=${m.diffNet}  lifecycleNet=${m.lifecycleNet}  gap=${m.gap}`))
    const totalGap = mismatches.reduce((sum, m) => sum + m.gap, 0)
    console.log(`\nsum of gaps: ${totalGap}`)
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
