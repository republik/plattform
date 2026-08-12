#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const dayjs = require('dayjs')
const yargs = require('yargs')

const { writeCsv, writeJson } = require('./lib/output')
const { DEFAULT_AS_OF, fiscalYearLabelFromAsOf } = require('./lib/dates')
const { CATEGORIZED_CTE } = require('./lib/membershipCategorizedCte')
const {
  MITGLIEDSCHAFTEN_CATEGORIES,
  ABONNEMENTE_CATEGORIES,
} = require('./lib/membershipCategories')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

const argv = yargs
  .option('asOf', {
    describe: 'point-in-time snapshot date, e.g. 2026-06-30',
    coerce: dayjs,
    default: dayjs(DEFAULT_AS_OF),
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
  const asOf = argv.asOf.format('YYYY-MM-DD')
  const fyLabel = fiscalYearLabelFromAsOf(argv.asOf)
  // Comparison column is always "the same query, one year earlier" — not a
  // hardcoded baseline — so this stays a real year-over-year comparison no
  // matter which --asOf is used in future years.
  const lastYearAsOf = argv.asOf.subtract(1, 'year').format('YYYY-MM-DD')
  console.log(
    `calculating membership/subscription snapshot as of ${asOf} (compared against ${lastYearAsOf}) …`,
  )

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })

  try {
    const [counts, lastYearCounts] = await Promise.all([
      fetchCounts(pgdb, asOf),
      fetchCounts(pgdb, lastYearAsOf),
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
