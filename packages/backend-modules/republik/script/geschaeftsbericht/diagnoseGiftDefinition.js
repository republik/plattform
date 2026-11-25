#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { DEFAULT_AS_OF, endOfDayInZurich } = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

// lib/membershipCategorizedCte.js currently treats a membership as
// "Mitgliedschaft als Geschenk" if EITHER:
//   1) it was bought via the dedicated ABO_GIVE package (a real, intentional
//      gift-purchase flow), OR
//   2) the pledge's payer differs from the current holder (a much broader
//      signal that also catches non-gift cases: someone paying for a family
//      member's regular membership, a business/shared account, a manual
//      account transfer, etc.)
// Comparing against the published FY24/25 report showed our "als Geschenk"
// count is 551 higher than published (1206 vs. 655) while the combined
// Mitgliedschaften total matches almost exactly — meaning condition (2) is
// very likely over-flagging real Jahresmitgliedschaften as gifts. This
// script splits the two conditions apart to see how much each contributes,
// and samples the payer-mismatch-only rows to see if there's a pattern
// (e.g. one recurring purchaser paying for many accounts, suggesting a
// business/family arrangement rather than a one-off gift).
const QUERY = `
WITH old_rows AS (
  SELECT
    m.id::text AS id,
    m."userId",
    mt.name AS type_name,
    m."reducedPrice",
    EXISTS (
      SELECT 1 FROM pledges p
      JOIN packages pkg ON pkg.id = p."packageId"
      WHERE p.id = m."pledgeId" AND pkg."name" = 'ABO_GIVE'
    ) AS is_abo_give,
    EXISTS (
      SELECT 1 FROM pledges p
      WHERE p.id = m."pledgeId" AND p."userId" != m."userId"
    ) AS is_payer_mismatch,
    (SELECT p."userId" FROM pledges p WHERE p.id = m."pledgeId") AS "payerId",
    mp."beginDate",
    mp."endDate"
  FROM "memberships" m
  JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
  JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
  WHERE mp."beginDate" < $1 AND mp."endDate" >= $1
    AND m."userId" != ALL($2::uuid[])
    AND NOT EXISTS (
      SELECT 1 FROM pledges pex
      WHERE pex.id = m."pledgeId" AND pex."userId" = ANY($2::uuid[])
    )
    AND mt.name = 'ABO'
    AND m."userId" NOT IN (
      SELECT s."userId" FROM payments.subscriptions s
      JOIN payments.invoices i ON i."subscriptionId" = s.id
      WHERE i."periodStart" < $1 AND i."periodEnd" >= $1
        AND s."userId" != ALL($2::uuid[])
        AND s.status NOT IN ('incomplete', 'incomplete_expired')
    )
)
SELECT
  CASE
    WHEN is_abo_give THEN 'real gift (ABO_GIVE package)'
    WHEN is_payer_mismatch THEN 'payer mismatch only (not ABO_GIVE)'
    ELSE 'not flagged as gift'
  END AS bucket,
  COUNT(*)::int AS count
FROM old_rows
GROUP BY 1
ORDER BY 1
`

const SAMPLE_QUERY = `
WITH old_rows AS (
  SELECT
    m.id::text AS id,
    m."userId",
    (SELECT p."userId" FROM pledges p WHERE p.id = m."pledgeId") AS "payerId",
    EXISTS (
      SELECT 1 FROM pledges p
      JOIN packages pkg ON pkg.id = p."packageId"
      WHERE p.id = m."pledgeId" AND pkg."name" = 'ABO_GIVE'
    ) AS is_abo_give,
    mp."beginDate",
    mp."endDate"
  FROM "memberships" m
  JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
  JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
  WHERE mp."beginDate" < $1 AND mp."endDate" >= $1
    AND m."userId" != ALL($2::uuid[])
    AND mt.name = 'ABO'
),
payer_mismatch_only AS (
  SELECT * FROM old_rows
  WHERE "payerId" IS NOT NULL AND "payerId" != "userId" AND NOT is_abo_give
)
SELECT "payerId", COUNT(*)::int AS memberships_paid_for
FROM payer_mismatch_only
GROUP BY "payerId"
ORDER BY memberships_paid_for DESC
LIMIT 20
`

const run = async () => {
  const argv = yargs
    .option('asOf', {
      describe: 'point in time to check, end-of-day Europe/Zurich',
      coerce: endOfDayInZurich,
      default: endOfDayInZurich(DEFAULT_AS_OF),
    })
    .help()
    .version().argv

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })
  try {
    const asOf = argv.asOf.toDate()
    console.log(`splitting 'Mitgliedschaft als Geschenk' (old-system ABO only) at ${argv.asOf.format('YYYY-MM-DD')} …\n`)

    const rows = await pgdb.query(QUERY, [asOf, EXCLUDED_USER_IDS])
    console.table(rows)

    console.log(
      '\ntop purchasers behind payer-mismatch-only rows (not ABO_GIVE) — a purchaser',
      '\nwith many memberships suggests a business/family arrangement, not one-off gifts:',
    )
    const sample = await pgdb.query(SAMPLE_QUERY, [asOf, EXCLUDED_USER_IDS])
    console.table(sample)
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
