#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { writeJson } = require('./lib/output')
const {
  DEFAULT_FY_FROM,
  DEFAULT_FY_TO,
  startOfDayInZurich,
  endOfDayInZurich,
  fiscalYearLabelFromAsOf,
} = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

const argv = yargs
  .option('from', {
    describe:
      'fiscal year start, e.g. 2025-07-01 — interpreted as start-of-day Europe/Zurich',
    coerce: startOfDayInZurich,
    default: startOfDayInZurich(DEFAULT_FY_FROM),
  })
  .option('to', {
    describe:
      'fiscal year end (30.06.), e.g. 2026-06-30 — interpreted as end-of-day Europe/Zurich (the whole last day is included)',
    coerce: endOfDayInZurich,
    default: endOfDayInZurich(DEFAULT_FY_TO),
  })
  .option('out', {
    describe: 'output directory',
    string: true,
    default: `${__dirname}/output`,
  })
  .help()
  .version().argv

// Matches exactly the query used for last year's report (BETWEEN, same
// bounds), plus excluding internal/test accounts (lib/excludedUsers.js) and
// anchoring the bounds to Europe/Zurich day boundaries (see lib/dates.js).
// --to is end-of-day (23:59:59.999 Zurich) on the fiscal year end date
// itself, so the whole last day (30.06.) is included — no need to pass the
// day after as an exclusive boundary.
const QUERY = `
  SELECT
    COUNT(*)::int AS "Debattenbeiträge",
    COUNT(DISTINCT "userId")::int AS "Personen, die debattiert haben"
  FROM comments
  WHERE "createdAt" BETWEEN $1 AND $2
    AND "userId" != ALL($3::uuid[])
`

const run = async () => {
  const from = argv.from.format('YYYY-MM-DD') // display/output label only
  const to = argv.to.format('YYYY-MM-DD') // display/output label only
  console.log(`calculating community stats from ${from} to ${to} (Europe/Zurich) …`)

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })

  try {
    // Pass the precise instants, not the formatted labels above — see
    // lib/dates.js for why re-parsing a bare 'YYYY-MM-DD' string breaks
    // timezone correctness.
    const [result] = await pgdb.query(QUERY, [
      argv.from.toDate(),
      argv.to.toDate(),
      EXCLUDED_USER_IDS,
    ])
    console.log(result)
    const fyLabel = fiscalYearLabelFromAsOf(argv.to)
    writeJson({ from, to, ...result }, argv.out, `C-community_FY${fyLabel}`)
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
