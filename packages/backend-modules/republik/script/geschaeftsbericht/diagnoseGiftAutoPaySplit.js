#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { DEFAULT_AS_OF, endOfDayInZurich } = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

// Twelfth hypothesis, from the user: a gift membership that has NEVER had
// an actual "prolong claim" (a real purchase-driven extension) but IS set
// to autoPay=true should no longer be considered a gift — the recipient
// has proactively taken over financial responsibility for future renewals,
// even before any charge has actually happened.
//
// "Prolong claim" is precisely detectable per
// republik-crowdfundings/lib/generateMemberships.js (explicit prolong
// purchase) and lib/AutoPay.js (autopay-driven renewal) — both create NEW
// membershipPeriods rows with pledgeId = <the new charge's pledge>, while
// memberships.pledgeId itself is never updated and keeps pointing at the
// ORIGINAL gift pledge forever. So "never had a prolong claim" = no
// membershipPeriods row exists with a pledgeId different from the
// membership's own pledgeId.
const QUERY = `
WITH old_rows AS (
  SELECT
    m.id::text AS id,
    mt.name AS type_name,
    m."reducedPrice",
    EXISTS (
      SELECT 1 FROM pledges p
      JOIN packages pkg ON pkg.id = p."packageId"
      WHERE p.id = m."pledgeId"
        AND (pkg."name" = 'ABO_GIVE' OR p."userId" != m."userId")
    ) AS is_gift,
    m."voucherCode" IS NOT NULL AS is_unredeemed,
    m."autoPay",
    EXISTS (
      SELECT 1 FROM "membershipPeriods" mp2
      WHERE mp2."membershipId" = m.id AND mp2."pledgeId" != m."pledgeId"
    ) AS has_prolong_claim
  FROM "memberships" m
  JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
  JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
  WHERE mp."beginDate" < $1 AND mp."endDate" >= $1
    AND m."userId" != ALL($2::uuid[])
    AND NOT EXISTS (
      SELECT 1 FROM pledges pex
      WHERE pex.id = m."pledgeId" AND pex."userId" = ANY($2::uuid[])
    )
    AND mt.name IN ('ABO', 'ABO_GIVE_MONTHS')
    AND m."userId" NOT IN (
      SELECT s."userId" FROM payments.subscriptions s
      JOIN payments.invoices i ON i."subscriptionId" = s.id
      WHERE i."periodStart" < $1 AND i."periodEnd" >= $1
        AND s."userId" != ALL($2::uuid[])
        AND s.status NOT IN ('incomplete', 'incomplete_expired')
    )
)
SELECT
  type_name,
  COUNT(*) FILTER (WHERE is_gift AND NOT is_unredeemed)::int AS current_gift_stock,
  COUNT(*) FILTER (
    WHERE is_gift AND NOT is_unredeemed AND NOT has_prolong_claim AND "autoPay" = true
  )::int AS should_reclassify_per_hypothesis,
  COUNT(*) FILTER (
    WHERE is_gift AND NOT is_unredeemed AND (has_prolong_claim OR "autoPay" IS NOT TRUE)
  )::int AS stays_gift_under_hypothesis
FROM old_rows
GROUP BY type_name
ORDER BY type_name
`

const run = async () => {
  const argv = yargs
    .option('asOf', {
      describe: 'point-in-time snapshot, end-of-day Europe/Zurich',
      coerce: endOfDayInZurich,
      default: endOfDayInZurich(DEFAULT_AS_OF),
    })
    .help()
    .version().argv

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })
  try {
    const asOf = argv.asOf.toDate()
    console.log(
      `gift memberships active at ${argv.asOf.format('YYYY-MM-DD')}, split by autoPay + prolong-claim history …\n`,
    )

    const rows = await pgdb.query(QUERY, [asOf, EXCLUDED_USER_IDS])
    console.table(rows)
    console.log(
      "\nstays_gift_under_hypothesis for ABO -> compare against published 655,",
      "\nstays_gift_under_hypothesis for ABO_GIVE_MONTHS -> MUST stay close to published 146.",
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
