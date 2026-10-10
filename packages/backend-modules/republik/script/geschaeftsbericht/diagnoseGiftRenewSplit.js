#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { DEFAULT_AS_OF, endOfDayInZurich } = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

// Further split of ABO_GIVE-based "Mitgliedschaft als Geschenk" memberships
// (see diagnoseGiftDefinition.js / diagnoseGiftStockVsFlow.js) — this time
// by the membership's own `renew` flag and by how many total periods it has
// accumulated. A one-time gift that was never turned into an ongoing
// self-paid membership should show `renew = false` and few periods; one
// that the recipient kept renewing under the same original ABO_GIVE pledge
// (still tagged as a "gift" by our current definition, arguably shouldn't
// be by now) should show `renew = true` and many periods / a first period
// long ago.
const QUERY = `
WITH gift_memberships AS (
  SELECT
    m.id,
    m.renew,
    p."createdAt" AS "pledgeCreatedAt",
    (SELECT COUNT(*) FROM "membershipPeriods" mp2 WHERE mp2."membershipId" = m.id)::int AS "periodCount",
    (SELECT MIN(mp2."beginDate") FROM "membershipPeriods" mp2 WHERE mp2."membershipId" = m.id) AS "firstPeriodStart"
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
)
SELECT
  renew,
  COUNT(*)::int AS count,
  ROUND(AVG("periodCount"), 1) AS avg_period_count,
  MIN("firstPeriodStart") AS earliest_first_period,
  COUNT(*) FILTER (WHERE "periodCount" = 1)::int AS single_period_count
FROM gift_memberships
GROUP BY renew
ORDER BY renew
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
    console.log(`ABO_GIVE gift memberships active at ${argv.asOf.format('YYYY-MM-DD')}, split by renew flag …\n`)

    const rows = await pgdb.query(QUERY, [asOf, EXCLUDED_USER_IDS])
    console.table(rows)
    console.log(
      '\nif renew=false count is close to 655 (the published FY24/25 Geschenk figure), that\'s likely the definition last year used: one-time, not-yet-renewed-into-self-paid gifts only.',
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
