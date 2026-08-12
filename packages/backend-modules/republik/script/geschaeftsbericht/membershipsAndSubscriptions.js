#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { writeCsv, writeJson } = require('./lib/output')
const {
  DEFAULT_AS_OF,
  endOfDayInZurich,
  fiscalYearLabelFromAsOf,
} = require('./lib/dates')
const { CATEGORIZED_CTE } = require('./lib/membershipCategorizedCte')
const {
  MITGLIEDSCHAFTEN_CATEGORIES,
  ABONNEMENTE_CATEGORIES,
} = require('./lib/membershipCategories')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

const argv = yargs
  .option('asOf', {
    describe:
      'point-in-time snapshot date, e.g. 2026-06-30 — interpreted as end-of-day Europe/Zurich',
    coerce: endOfDayInZurich,
    default: endOfDayInZurich(DEFAULT_AS_OF),
  })
  .option('out', {
    describe: 'output directory',
    string: true,
    default: `${__dirname}/output`,
  })
  .help()
  .version().argv

// DISTINCT id guards against the (should-be-rare) case of overlapping
// periods for the same membership both covering asOf.
const QUERY =
  CATEGORIZED_CTE +
  `
SELECT category, COUNT(DISTINCT id)::int AS count
FROM categorized
GROUP BY category
ORDER BY category
`

const fetchCounts = async (pgdb, asOf) => {
  const result = await pgdb.query(QUERY, [asOf, EXCLUDED_USER_IDS])
  const counts = {}
  result.forEach((row) => {
    counts[row.category] = row.count
  })
  return counts
}

const buildTable = (counts, lastYearCounts, categories, totalLabel) => {
  const rows = categories.map((category) => ({
    category,
    count: counts[category] || 0,
    lastYear: lastYearCounts[category] || 0,
  }))
  const total = rows.reduce((sum, r) => sum + r.count, 0)
  const lastYearTotal = rows.reduce((sum, r) => sum + r.lastYear, 0)
  rows.push({ category: totalLabel, count: total, lastYear: lastYearTotal })
  return rows
}

const run = async () => {
  // argv.asOf is already the precise end-of-day-Zurich instant — pass it
  // (via .toDate()) straight to Postgres. Never re-derive a query parameter
  // by formatting it down to a bare 'YYYY-MM-DD' string and back — that
  // throws away the timezone and lets Postgres reinterpret it using its own
  // session timezone instead (see lib/dates.js for the ~22h bug this caused).
  const asOfInstant = argv.asOf
  const asOf = asOfInstant.format('YYYY-MM-DD') // display/output label only
  const fyLabel = fiscalYearLabelFromAsOf(argv.asOf)
  // Comparison column is always "the same query, one year earlier" — not a
  // hardcoded baseline — so this stays a real year-over-year comparison no
  // matter which --asOf is used in future years.
  const lastYearAsOfInstant = argv.asOf.subtract(1, 'year')
  const lastYearAsOf = lastYearAsOfInstant.format('YYYY-MM-DD') // label only
  console.log(
    `calculating membership/subscription snapshot as of ${asOf} 23:59:59 Europe/Zurich (compared against ${lastYearAsOf} 23:59:59 Europe/Zurich) …`,
  )

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })

  try {
    const [counts, lastYearCounts] = await Promise.all([
      fetchCounts(pgdb, asOfInstant.toDate()),
      fetchCounts(pgdb, lastYearAsOfInstant.toDate()),
    ])

    const unexpected = Object.keys(counts).filter((c) =>
      c.startsWith('Sonstige'),
    )
    if (unexpected.length) {
      console.warn(
        'WARNING: unexpected membership/subscription categories found — investigate before trusting totals:',
        unexpected.map((c) => `${c}: ${counts[c]}`),
      )
    }

    const mitgliedschaften = buildTable(
      counts,
      lastYearCounts,
      MITGLIEDSCHAFTEN_CATEGORIES,
      'Total Mitgliedschaften',
    )
    const abonnemente = buildTable(
      counts,
      lastYearCounts,
      ABONNEMENTE_CATEGORIES,
      'Total Abonnemente',
    )

    console.log(`\nMitgliedschaften per ${asOf} (vs. ${lastYearAsOf})`)
    console.table(mitgliedschaften)
    console.log(`\nAbonnemente per ${asOf} (vs. ${lastYearAsOf})`)
    console.table(abonnemente)

    writeCsv(mitgliedschaften, argv.out, `A-mitgliedschaften_FY${fyLabel}`)
    writeCsv(abonnemente, argv.out, `B-abonnemente_FY${fyLabel}`)
    writeJson(
      {
        asOf,
        lastYearAsOf,
        mitgliedschaften,
        abonnemente,
        rawCounts: counts,
        rawCountsLastYear: lastYearCounts,
      },
      argv.out,
      `A-B-mitgliedschaften-abonnemente_FY${fyLabel}`,
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
