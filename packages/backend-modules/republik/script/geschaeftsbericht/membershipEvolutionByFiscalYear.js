#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const dayjs = require('dayjs')
const yargs = require('yargs')

const { writeCsv, writeJson } = require('./lib/output')
const { DEFAULT_AS_OF } = require('./lib/dates')
const { CATEGORIZED_CTE } = require('./lib/membershipCategorizedCte')
const {
  MITGLIEDSCHAFTEN_CATEGORIES,
  ABONNEMENTE_CATEGORIES,
} = require('./lib/membershipCategories')

const ALL_CATEGORIES = [...MITGLIEDSCHAFTEN_CATEGORIES, ...ABONNEMENTE_CATEGORIES]

const argv = yargs
  .option('asOf', {
    describe:
      'fiscal year end (30.06.), e.g. 2026-06-30 — the fiscal year always runs 01.07.-30.06.',
    coerce: dayjs,
    default: dayjs(DEFAULT_AS_OF),
  })
  .option('concurrency', {
    describe: 'how many month-end queries to run in parallel',
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

// Returns the raw (id, category) rows active on `asOf` — same validated
// logic as membershipsAndSubscriptions.js, just without the final
// GROUP BY/COUNT, so callers can diff two months' id sets directly (needed
// to compute new/lost, not just net — a member who joined and left within
// the same month would net to zero but still represents real churn).
const IDS_QUERY =
  CATEGORIZED_CTE +
  `
SELECT DISTINCT id, category
FROM categorized
`

const fetchIdsByCategory = async (pgdb, asOf) => {
  const rows = await pgdb.query(IDS_QUERY, [asOf])
  const idsByCategory = {}
  ALL_CATEGORIES.forEach((c) => {
    idsByCategory[c] = new Set()
  })
  rows.forEach((row) => {
    if (!idsByCategory[row.category]) idsByCategory[row.category] = new Set()
    idsByCategory[row.category].add(row.id)
  })
  return idsByCategory
}

// Fiscal year always runs 01.07.–30.06. Returns 13 month-end snapshots:
// the prior fiscal year's end (30.06., used only as the baseline to diff
// July's new/lost against) followed by the 12 month-ends of the fiscal
// year itself (31.07. … 30.06.).
const buildFiscalYearMonthEnds = (fiscalYearEnd) => {
  const months = [fiscalYearEnd.subtract(1, 'year')]
  let month = months[0]
  for (let i = 0; i < 12; i++) {
    month = month.add(1, 'month').endOf('month')
    months.push(month)
  }
  return months
}

// Simple concurrency-limited map, so we don't fire 100+ queries at once
// against the DB for a multi-year range.
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
  // months[0] is the prior fiscal year's end (30.06.) — only used as the
  // baseline to diff July's new/lost against, not included in the output.
  const months = buildFiscalYearMonthEnds(argv.asOf)
  console.log(
    `calculating fiscal-year membership evolution for 01.07.${months[1].format('YYYY')}-30.06.${months[12].format('YYYY')} (concurrency ${argv.concurrency}) …`,
  )

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })

  try {
    const idsByMonth = await mapWithConcurrency(
      months,
      argv.concurrency,
      async (month, i) => {
        const asOf = month.format('YYYY-MM-DD')
        const idsByCategory = await fetchIdsByCategory(pgdb, asOf)
        console.log(`  ${i + 1}/${months.length} ${asOf} done`)
        return idsByCategory
      },
    )

    const rows = []
    months.forEach((month, i) => {
      if (i === 0) return // baseline only, not a fiscal-year month
      const asOf = month.format('YYYY-MM-DD')
      const current = idsByMonth[i]
      const previous = idsByMonth[i - 1]

      ALL_CATEGORIES.forEach((category) => {
        const currentIds = current[category] || new Set()
        const previousIds = previous[category] || new Set()

        let newCount = 0
        currentIds.forEach((id) => {
          if (!previousIds.has(id)) newCount += 1
        })
        let lostCount = 0
        previousIds.forEach((id) => {
          if (!currentIds.has(id)) lostCount += 1
        })

        rows.push({
          month: asOf,
          category,
          count: currentIds.size,
          new: newCount,
          lost: lostCount,
          net: newCount - lostCount,
        })
      })
    })

    console.log(`\ncomputed ${rows.length} month/category rows`)
    writeCsv(rows, argv.out, 'F-mitgliedschaften-pro-geschaeftsjahr')
    writeJson(rows, argv.out, 'F-mitgliedschaften-pro-geschaeftsjahr')
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
