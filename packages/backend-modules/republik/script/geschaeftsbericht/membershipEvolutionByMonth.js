#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const dayjs = require('dayjs')
const yargs = require('yargs')

const { writeCsv, writeJson } = require('./lib/output')
const { CATEGORIZED_CTE } = require('./lib/membershipCategorizedCte')
const {
  MITGLIEDSCHAFTEN_CATEGORIES,
  ABONNEMENTE_CATEGORIES,
} = require('./lib/membershipCategories')

const ALL_CATEGORIES = [...MITGLIEDSCHAFTEN_CATEGORIES, ...ABONNEMENTE_CATEGORIES]

const argv = yargs
  .option('from', {
    describe: 'first month-end to include, e.g. 2018-01-31',
    coerce: dayjs,
    default: dayjs('2018-01-31'),
  })
  .option('to', {
    describe: 'last month-end to include, e.g. 2026-06-30',
    coerce: dayjs,
    default: dayjs('2026-06-30'),
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

const buildMonthEnds = (from, to) => {
  const months = []
  let month = from.endOf('month')
  while (month.isBefore(to) || month.isSame(to, 'day')) {
    months.push(month)
    month = month.add(1, 'month').endOf('month')
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
  const months = buildMonthEnds(argv.from, argv.to)
  console.log(
    `calculating monthly membership evolution for ${months.length} month-ends, from ${months[0].format('YYYY-MM-DD')} to ${months[months.length - 1].format('YYYY-MM-DD')} (concurrency ${argv.concurrency}) …`,
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
      const asOf = month.format('YYYY-MM-DD')
      const current = idsByMonth[i]
      const previous = i > 0 ? idsByMonth[i - 1] : null

      ALL_CATEGORIES.forEach((category) => {
        const currentIds = current[category] || new Set()
        const previousIds = previous ? previous[category] || new Set() : new Set()

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
          new: previous ? newCount : currentIds.size,
          lost: previous ? lostCount : 0,
          net: previous ? newCount - lostCount : currentIds.size,
        })
      })
    })

    console.log(`\ncomputed ${rows.length} month/category rows`)
    writeCsv(rows, argv.out, 'F-mitgliedschaften-zum-monatsende')
    writeJson(rows, argv.out, 'F-mitgliedschaften-zum-monatsende')
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
