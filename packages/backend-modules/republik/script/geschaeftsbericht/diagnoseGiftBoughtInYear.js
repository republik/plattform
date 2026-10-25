#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const {
  DEFAULT_AS_OF,
  endOfDayInZurich,
  fiscalYearStartFromAsOf,
} = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

// Sixth hypothesis for the ABO_GIVE gift-membership mismatch (1206 here vs.
// 655 published for FY24/25) — per the user: gifts BOUGHT during the fiscal
// year (pledge created within it) that also had an active period SOMEWHERE
// during that fiscal year — not necessarily covering the exact 30.06.
// snapshot date, just overlapping the fiscal year window at all. Broader
// than diagnoseGiftStockVsFlow.js's "new_this_fiscal_year" (which required
// active exactly at the snapshot date), narrower than the full
// point-in-time-accumulation definition currently used.
const QUERY = `
SELECT COUNT(DISTINCT m.id)::int AS count
FROM "memberships" m
JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
JOIN "pledges" p ON p.id = m."pledgeId"
JOIN "packages" pkg ON pkg.id = p."packageId"
WHERE mt.name = 'ABO'
  AND pkg."name" = 'ABO_GIVE'
  AND p."createdAt" >= $2 AND p."createdAt" < $1
  AND mp."beginDate" < $1 AND mp."endDate" >= $2
  AND m."userId" != ALL($3::uuid[])
  AND NOT EXISTS (
    SELECT 1 FROM pledges pex
    WHERE pex.id = m."pledgeId" AND pex."userId" = ANY($3::uuid[])
  )
`

const run = async () => {
  const argv = yargs
    .option('asOf', {
      describe: 'fiscal year end (exclusive upper bound), end-of-day Europe/Zurich',
      coerce: endOfDayInZurich,
      default: endOfDayInZurich(DEFAULT_AS_OF),
    })
    .help()
    .version().argv

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })
  try {
    const asOf = argv.asOf.toDate()
    const fyStart = fiscalYearStartFromAsOf(argv.asOf).toDate()
    console.log(
      `ABO_GIVE gift memberships bought during FY (pledge createdAt in range) with a period overlapping the fiscal year ${fiscalYearStartFromAsOf(argv.asOf).format('YYYY-MM-DD')}–${argv.asOf.format('YYYY-MM-DD')} …\n`,
    )

    const [row] = await pgdb.query(QUERY, [asOf, fyStart, EXCLUDED_USER_IDS])
    console.table([row])
    console.log('\ncompare against the published FY24/25 Geschenk figure: 655')
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
