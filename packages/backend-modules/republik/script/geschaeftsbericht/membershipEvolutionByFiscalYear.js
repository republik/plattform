#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { writeCsv, writeJson } = require('./lib/output')
const {
  DEFAULT_AS_OF,
  endOfDayInZurich,
  fiscalYearLabelFromAsOf,
  fiscalYearStartFromAsOf,
} = require('./lib/dates')
const { CATEGORIZED_CTE } = require('./lib/membershipCategorizedCte')
const { LIFECYCLE_EVENTS_QUERY } = require('./lib/membershipLifecycleCte')
const {
  MITGLIEDSCHAFTEN_CATEGORIES,
  ABONNEMENTE_CATEGORIES,
} = require('./lib/membershipCategories')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

const ALL_CATEGORIES = [...MITGLIEDSCHAFTEN_CATEGORIES, ...ABONNEMENTE_CATEGORIES]

const argv = yargs
  .option('asOf', {
    describe:
      'fiscal year end (30.06.), e.g. 2026-06-30 — interpreted as end-of-day Europe/Zurich; the fiscal year always runs 01.07.-30.06.',
    coerce: endOfDayInZurich,
    default: endOfDayInZurich(DEFAULT_AS_OF),
  })
  .option('concurrency', {
    describe: 'how many month-end count queries to run in parallel',
    number: true,
    default: 4,
  })
  .option('out', {
    describe: 'output directory',
    string: true,
    default: `${__dirname}/output`,
  })
  .help()
  .version().argv

// count: point-in-time active count per category, as of a specific
// month-end — same validated logic as membershipsAndSubscriptions.js
// (period-coverage based). This is the right tool for "how many are active
// on this exact date" and is kept independent of the new/lost computation
// below.
const COUNT_QUERY =
  CATEGORIZED_CTE +
  `
SELECT category, COUNT(DISTINCT id)::int AS count
FROM categorized
GROUP BY category
`

const fetchCounts = async (pgdb, asOf) => {
  const rows = await pgdb.query(COUNT_QUERY, [asOf, EXCLUDED_USER_IDS])
  const counts = {}
  rows.forEach((row) => {
    counts[row.category] = row.count
  })
  return counts
}

// new/lost: lifecycle-event based (creation/cancellation), matching an
// existing Metabase reference dashboard (question #1809,
// "abo-gain-loss-grouped-by-month-company-and-abo-type") — see
// lib/membershipLifecycleCte.js for the full rationale. This is
// deliberately NOT the same method as `count` above: diffing point-in-time
// snapshots month-to-month treats any invoice-period gap (a late renewal,
// a payment retry, proration) as a lost+new pair even when the person
// never left, which inflated gross new/lost by up to ~860/month compared
// to Metabase in the heaviest acquisition months, while net was only off
// by 3-124/month. One single query for the whole fiscal year, not one
// query per month — lifecycle events don't need month-to-month diffing.
const fetchLifecycleEvents = async (pgdb, fyStart, fyEnd) => {
  const rows = await pgdb.query(LIFECYCLE_EVENTS_QUERY, [
    EXCLUDED_USER_IDS,
    fyStart,
    fyEnd,
  ])
  // event_month is DATE_TRUNC('month', ...) — the FIRST day of the month
  // (e.g. 2026-06-01), not the last — key by that, not by the month-end
  // dates used elsewhere in this script.
  // eventsByMonth['2026-06-01']['Monatsabonnement'] = { gain, loss }
  const eventsByMonth = {}
  rows.forEach((row) => {
    const monthKey = row.event_month.toISOString().slice(0, 10)
    if (!eventsByMonth[monthKey]) eventsByMonth[monthKey] = {}
    if (!eventsByMonth[monthKey][row.category]) {
      eventsByMonth[monthKey][row.category] = { gain: 0, loss: 0 }
    }
    eventsByMonth[monthKey][row.category][
      row.event_type === 'gain' ? 'gain' : 'loss'
    ] = row.count
  })
  return eventsByMonth
}

// Fiscal year always runs 01.07.–30.06. Returns the 12 month-end dates of
// that fiscal year (31.07. … 30.06.) — no baseline month needed here,
// unlike the old diff-based approach, since lifecycle events are read
// directly off their own timestamps rather than computed by comparing
// consecutive snapshots.
const buildFiscalYearMonthEnds = (fiscalYearEnd) => {
  const months = []
  let month = fiscalYearEnd.subtract(1, 'year')
  for (let i = 0; i < 12; i++) {
    month = month.add(1, 'month').endOf('month')
    months.push(month)
  }
  return months
}

// Simple concurrency-limited map, so we don't fire 12 count queries at
// once against the DB.
const mapWithConcurrency = async (items, limit, fn) => {
  const results = new Array(items.length)
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i], i)
    }
  })
  await Promise.all(workers)
  return results
}

const run = async () => {
  const months = buildFiscalYearMonthEnds(argv.asOf)
  const fyStart = fiscalYearStartFromAsOf(argv.asOf)
  console.log(
    `calculating fiscal-year membership evolution for 01.07.${fyStart.format('YYYY')}-30.06.${argv.asOf.format('YYYY')} (concurrency ${argv.concurrency}) …`,
  )

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })

  try {
    const [countsByMonth, eventsByMonth] = await Promise.all([
      mapWithConcurrency(months, argv.concurrency, async (month, i) => {
        const counts = await fetchCounts(pgdb, month.toDate())
        console.log(`  count ${i + 1}/${months.length} ${month.format('YYYY-MM-DD')} done`)
        return counts
      }),
      fetchLifecycleEvents(pgdb, fyStart.toDate(), argv.asOf.toDate()),
    ])

    const mitgliedschaftenBreakdown = []
    const abonnementeBreakdown = []
    const mitgliedschaftenTotal = []
    const abonnementeTotal = []
    months.forEach((month, i) => {
      const asOf = month.format('YYYY-MM-DD')
      const counts = countsByMonth[i]
      // events are keyed by month START (see fetchLifecycleEvents), while
      // `asOf`/`month` here is the month END used for the count query and
      // the output label — don't conflate the two.
      const eventsKey = month.startOf('month').format('YYYY-MM-DD')
      const events = eventsByMonth[eventsKey] || {}

      const monthRows = ALL_CATEGORIES.map((category) => {
        const { gain = 0, loss = 0 } = events[category] || {}
        return {
          month: asOf,
          category,
          count: counts[category] || 0,
          new: gain,
          lost: loss,
          net: gain - loss,
        }
      })
      mitgliedschaftenBreakdown.push(
        ...monthRows.filter((r) => MITGLIEDSCHAFTEN_CATEGORIES.includes(r.category)),
      )
      abonnementeBreakdown.push(
        ...monthRows.filter((r) => ABONNEMENTE_CATEGORIES.includes(r.category)),
      )

      // General grouping: aggregate totals per month, matching the
      // Mitgliedschaften/Abonnemente split used elsewhere in this report,
      // so a monthly total series (e.g. Juli 2024: 21326 … Juni 2025:
      // 25112) can be directly compared against.
      const sumRow = (categories, label) => {
        const relevant = monthRows.filter((r) => categories.includes(r.category))
        return {
          month: asOf,
          category: label,
          count: relevant.reduce((sum, r) => sum + r.count, 0),
          new: relevant.reduce((sum, r) => sum + r.new, 0),
          lost: relevant.reduce((sum, r) => sum + r.lost, 0),
          net: relevant.reduce((sum, r) => sum + r.net, 0),
        }
      }
      mitgliedschaftenTotal.push(
        sumRow(MITGLIEDSCHAFTEN_CATEGORIES, 'Total Mitgliedschaften'),
      )
      abonnementeTotal.push(sumRow(ABONNEMENTE_CATEGORIES, 'Total Abonnemente'))
    })

    console.log(
      `\ncomputed ${mitgliedschaftenBreakdown.length + abonnementeBreakdown.length} category rows, ${mitgliedschaftenTotal.length + abonnementeTotal.length} total rows`,
    )
    const fyLabel = fiscalYearLabelFromAsOf(argv.asOf)
    writeCsv(
      mitgliedschaftenTotal,
      argv.out,
      `F-mitgliedschaften-total_FY${fyLabel}`,
    )
    writeCsv(
      mitgliedschaftenBreakdown,
      argv.out,
      `F-mitgliedschaften-breakdown_FY${fyLabel}`,
    )
    writeCsv(abonnementeTotal, argv.out, `F-abonnemente-total_FY${fyLabel}`)
    writeCsv(
      abonnementeBreakdown,
      argv.out,
      `F-abonnemente-breakdown_FY${fyLabel}`,
    )
    writeJson(
      {
        mitgliedschaftenTotal,
        mitgliedschaftenBreakdown,
        abonnementeTotal,
        abonnementeBreakdown,
      },
      argv.out,
      `F-mitgliedschaften-pro-geschaeftsjahr_FY${fyLabel}`,
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
