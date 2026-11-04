#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { DEFAULT_AS_OF, endOfDayInZurich } = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

// Tests a new hypothesis for the ABO_GIVE gift-membership mismatch (1206
// here vs. 655 published for FY24/25 — see diagnoseGiftDefinition.js /
// diagnoseGiftStockVsFlow.js / diagnoseGiftRenewSplit.js /
// diagnoseOldSystemActiveFlag.js, all of which ruled out other mechanisms):
// maybe "active" for a membership means "still has ANY membershipPeriods
// row covering right now" — i.e. once a membership's last period lapses
// with no further renewal, it's considered inactive from that point on,
// independent of whether it covered a past snapshot date. Under that
// definition, a gift membership that was genuinely valid on 30.06.2025 but
// has since fully lapsed (no period covers today) would no longer count as
// "active" — which the mutable, continuously-updated `memberships.active`
// flag doesn't capture cleanly (see diagnoseOldSystemActiveFlag.js), but a
// direct MAX(endDate) vs. now() check does.
const QUERY = `
WITH gift_memberships AS (
  SELECT
    m.id,
    (SELECT MAX(mp2."endDate") FROM "membershipPeriods" mp2 WHERE mp2."membershipId" = m.id) AS "overallMaxEndDate"
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
  CASE WHEN "overallMaxEndDate" >= NOW() THEN 'still ongoing today' ELSE 'fully lapsed since, never renewed' END AS bucket,
  COUNT(*)::int AS count
FROM gift_memberships
GROUP BY 1
ORDER BY 1
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
    console.log(
      `ABO_GIVE gift memberships active at ${argv.asOf.format('YYYY-MM-DD')}, split by whether they still have a period covering today …\n`,
    )

    const rows = await pgdb.query(QUERY, [asOf, EXCLUDED_USER_IDS])
    console.table(rows)
    console.log(
      '\nif "still ongoing today" is close to 655, that\'s likely the definition last year used.',
      '\nnote: this number will keep drifting the longer after the fiscal year end you run it, since more will have lapsed by then — worth knowing regardless of whether it explains 655.',
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
