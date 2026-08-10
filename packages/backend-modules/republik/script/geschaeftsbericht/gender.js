#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { writeCsv } = require('./lib/output')

const argv = yargs
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
  GROUP BY 1, 2
  ORDER BY 3 DESC
`

const run = async () => {
  console.log(
    'calculating gender distribution of currently active members (NOT a historical point-in-time snapshot) …',
  )

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })

  try {
    const result = await pgdb.query(QUERY)
    console.table(result)
    writeCsv(result, argv.out, 'D-geschlechterverteilung')
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
