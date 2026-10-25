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

// Tests whether the published report's "Mitgliedschaft als Geschenk" figure
// (655 for FY24/25) is a FLOW metric (gifts newly given out during that one
// fiscal year) rather than the STOCK metric this script currently computes
// (all still-active gift-originated memberships, accumulated across every
// year they've kept renewing) — see diagnoseGiftDefinition.js, which found
// 1182 ABO_GIVE-based gift memberships active at 2025-06-30, already far
// above 655 on its own (the payer-mismatch heuristic only adds 24 more).
//
// "New this fiscal year" here is approximated by the underlying pledge's
// createdAt falling inside the fiscal year — the actual purchase/gifting
// moment, independent of which membershipPeriod happens to cover the
// snapshot date.
const QUERY = `
SELECT
  COUNT(*) FILTER (
    WHERE p."createdAt" >= $3 AND p."createdAt" < $4
  )::int AS "new_this_fiscal_year",
  COUNT(*) FILTER (
    WHERE p."createdAt" < $3
  )::int AS "originated_in_earlier_years_still_active",
  COUNT(*)::int AS "total_active_stock"
FROM "memberships" m
JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
JOIN "pledges" p ON p.id = m."pledgeId"
JOIN "packages" pkg ON pkg.id = p."packageId"
WHERE mp."beginDate" < $1 AND mp."endDate" >= $1
  AND m."userId" != ALL($2::uuid[])
  AND NOT EXISTS (
    SELECT 1 FROM pledges pex
    WHERE pex.id = m."pledgeId" AND pex."userId" = ANY($2::uuid[])
  )
  AND mt.name = 'ABO'
  AND pkg."name" = 'ABO_GIVE'
  AND m."userId" NOT IN (
    SELECT s."userId" FROM payments.subscriptions s
    JOIN payments.invoices i ON i."subscriptionId" = s.id
    WHERE i."periodStart" < $1 AND i."periodEnd" >= $1
      AND s."userId" != ALL($2::uuid[])
      AND s.status NOT IN ('incomplete', 'incomplete_expired')
  )
`

const run = async () => {
  const argv = yargs
    .option('asOf', {
      describe: 'fiscal year end to check, end-of-day Europe/Zurich',
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
      `ABO_GIVE gift memberships active at ${argv.asOf.format('YYYY-MM-DD')}, split by when the underlying pledge was created …\n`,
    )

    const [row] = await pgdb.query(QUERY, [asOf, EXCLUDED_USER_IDS, fyStart, asOf])
    console.table([row])
    console.log(
      '\ncompare "new_this_fiscal_year" against the published report\'s Geschenk figure for that year (655 for FY24/25)',
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
