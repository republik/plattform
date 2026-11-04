#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { DEFAULT_AS_OF, endOfDayInZurich } = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

// Thirteenth hypothesis, from the user: the existing is_gift check is
// evaluated against the WRONG pledge — memberships."pledgeId" is the
// membership's ORIGINAL pledge, fixed forever, but each renewal
// (membershipPeriods row) carries its OWN pledgeId
// (republik-crowdfundings/lib/generateMemberships.js /
// lib/AutoPay.js both insert new periods with pledgeId = the NEW charge's
// pledge, never touching memberships.pledgeId). So a membership renewed
// many times over years still evaluates is_gift off its very first pledge,
// even if the CURRENT active period's pledge shows the recipient now paying
// for themselves. Fix tested here: evaluate is_gift against the pledge
// behind the CURRENT period covering asOf (mp."pledgeId"), not the
// membership's fixed pledgeId.
const QUERY = `
WITH old_rows AS (
  SELECT
    m.id::text AS id,
    mt.name AS type_name,
    m."reducedPrice",
    m."voucherCode" IS NOT NULL AS is_unredeemed,
    -- OLD (current production) definition: off the membership's fixed,
    -- original pledge.
    EXISTS (
      SELECT 1 FROM pledges p
      JOIN packages pkg ON pkg.id = p."packageId"
      WHERE p.id = m."pledgeId"
        AND (pkg."name" = 'ABO_GIVE' OR p."userId" != m."userId")
    ) AS is_gift_original_pledge,
    -- NEW hypothesis: off the CURRENT PERIOD's own pledge.
    EXISTS (
      SELECT 1 FROM pledges p
      JOIN packages pkg ON pkg.id = p."packageId"
      WHERE p.id = mp."pledgeId"
        AND (pkg."name" = 'ABO_GIVE' OR p."userId" != m."userId")
    ) AS is_gift_current_period_pledge
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
  COUNT(*) FILTER (WHERE is_gift_original_pledge AND NOT is_unredeemed)::int AS current_definition_stock,
  COUNT(*) FILTER (WHERE is_gift_current_period_pledge AND NOT is_unredeemed)::int AS new_definition_stock,
  COUNT(*) FILTER (
    WHERE is_gift_original_pledge AND NOT is_gift_current_period_pledge AND NOT is_unredeemed
  )::int AS reclassified_out_of_gift
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
      `gift memberships active at ${argv.asOf.format('YYYY-MM-DD')}, is_gift evaluated on original pledge vs. current-period pledge …\n`,
    )

    const rows = await pgdb.query(QUERY, [asOf, EXCLUDED_USER_IDS])
    console.table(rows)
    console.log(
      "\nnew_definition_stock for ABO -> compare against published 655,",
      "\nnew_definition_stock for ABO_GIVE_MONTHS -> MUST stay close to published 146.",
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
