#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const dayjs = require('dayjs')
const yargs = require('yargs')

const { writeCsv } = require('./lib/output')
const { DEFAULT_AS_OF, fiscalYearLabelFromAsOf } = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

const argv = yargs
  .option('forFiscalYear', {
    describe:
      'fiscal year end (30.06.) this run is for, e.g. 2026-06-30 — labeling only, the query itself is always current-state',
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

// Reuses republik/lib/MembershipStats/names.js as-is. NOTE: this reflects
// CURRENTLY active members (m.active = true) as of whenever this script is
// run, NOT a point-in-time snapshot as of the fiscal year-end date. Making
// this truly point-in-time would require reusing the same min/max
// beginDate/endDate CTE as membershipsAndSubscriptions.js — left as a
// follow-up rather than duplicating/destabilizing that query here.
const QUERY = `
  SELECT s."firstName" "key", UPPER(s.sex) sex, COUNT(DISTINCT u.id) count
  FROM users u
  JOIN memberships m ON m."userId" = u.id
  LEFT JOIN "statisticsNameSex" s ON SPLIT_PART(TRIM(u."firstName"), ' ', 1) = s."firstName"
  WHERE m.active = true
    AND u.id != ALL($1::uuid[])
  GROUP BY 1, 2
  ORDER BY 3 DESC
`

const run = async () => {
  console.log(
    'calculating gender distribution of currently active members (NOT a historical point-in-time snapshot) …',
  )

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })

  try {
    const result = await pgdb.query(QUERY, [EXCLUDED_USER_IDS])
    console.table(result)
    const fyLabel = fiscalYearLabelFromAsOf(argv.forFiscalYear)
    writeCsv(result, argv.out, `D-geschlechterverteilung_FY${fyLabel}`)
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
