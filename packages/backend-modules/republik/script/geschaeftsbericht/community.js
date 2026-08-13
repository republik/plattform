#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { writeJson } = require('./lib/output')
const {
  DEFAULT_AS_OF,
  endOfDayInZurich,
  fiscalYearLabelFromAsOf,
  fiscalYearStartFromAsOf,
} = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

const argv = yargs
  .option('asOf', {
    describe:
      'fiscal year end (30.06.), e.g. 2026-06-30 — interpreted as end-of-day Europe/Zurich; the fiscal year always runs 01.07.-30.06.',
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

// Matches exactly the query used for last year's report (BETWEEN, same
// bounds), plus excluding internal/test accounts (lib/excludedUsers.js) and
// anchoring the bounds to Europe/Zurich day boundaries (see lib/dates.js).
// The upper bound is end-of-day (23:59:59.999 Zurich) on the fiscal year
// end date itself, so the whole last day (30.06.) is included.
//
// "userId" IS NULL OR ... : comments.userId can be NULL (anonymous/deleted
// accounts); plain `"userId" != ALL($3::uuid[])` evaluates to NULL (i.e.
// excluded by WHERE) for those rows, silently dropping every NULL-userId
// comment from Debattenbeiträge — confirmed via diagnostic: this alone
// explained a ~1950-comment gap against the original query, while "Personen,
// die debattiert haben" (COUNT(DISTINCT "userId")) was unaffected either way
// since DISTINCT already ignores NULLs on its own.
const QUERY = `
  SELECT
    COUNT(*)::int AS "Debattenbeiträge",
    COUNT(DISTINCT "userId")::int AS "Personen, die debattiert haben"
  FROM comments
  WHERE "createdAt" BETWEEN $1 AND $2
    AND ("userId" IS NULL OR "userId" != ALL($3::uuid[]))
`

const run = async () => {
  const fromInstant = fiscalYearStartFromAsOf(argv.asOf)
  const toInstant = argv.asOf
  const from = fromInstant.format('YYYY-MM-DD') // display/output label only
  const to = toInstant.format('YYYY-MM-DD') // display/output label only
  console.log(`calculating community stats from ${from} to ${to} (Europe/Zurich) …`)

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })

  try {
    // Pass the precise instants, not the formatted labels above — see
    // lib/dates.js for why re-parsing a bare 'YYYY-MM-DD' string breaks
    // timezone correctness.
    const [result] = await pgdb.query(QUERY, [
      fromInstant.toDate(),
      toInstant.toDate(),
      EXCLUDED_USER_IDS,
    ])
    console.log(result)
    const fyLabel = fiscalYearLabelFromAsOf(argv.asOf)
    writeJson({ from, to, ...result }, argv.out, `C-community_FY${fyLabel}`)
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
