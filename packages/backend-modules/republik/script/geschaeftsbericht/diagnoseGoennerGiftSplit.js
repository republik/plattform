#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { DEFAULT_AS_OF, endOfDayInZurich } = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

// Gönnermitgliedschaft (BENEFACTOR_ABO) is currently categorized
// unconditionally by type — no gift check at all, unlike ABO (which does
// check payer != current holder, see lib/membershipCategorizedCte.js).
// Diverges from the published FY24/25 report (154 here vs. 136 published,
// at 2025-06-30). This checks the same signal that explained the ABO
// mismatch: how many BENEFACTOR_ABO memberships have a payer differing
// from the current holder (evaluated against the CURRENT PERIOD's own
// pledge, same fix already applied to ABO) — if a meaningful chunk turns
// out to be gifted, that's a plausible explanation for the overcount.
const QUERY = `
WITH rows AS (
  SELECT
    m.id::text AS id,
    ru.email AS recipient_email,
    pu.email AS purchaser_email,
    pkg."name" AS package_name,
    p."createdAt" AS pledge_created_at
  FROM "memberships" m
  JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
  JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
  JOIN "pledges" p ON p.id = mp."pledgeId"
  JOIN "packages" pkg ON pkg.id = p."packageId"
  JOIN "users" ru ON ru.id = m."userId"
  JOIN "users" pu ON pu.id = p."userId"
  WHERE mp."beginDate" < $1 AND mp."endDate" >= $1
    AND m."userId" != ALL($2::uuid[])
    AND NOT EXISTS (
      SELECT 1 FROM pledges pex
      WHERE pex.id = m."pledgeId" AND pex."userId" = ANY($2::uuid[])
    )
    AND mt.name = 'BENEFACTOR_ABO'
    AND m."userId" NOT IN (
      SELECT s."userId" FROM payments.subscriptions s
      JOIN payments.invoices i ON i."subscriptionId" = s.id
      WHERE i."periodStart" < $1 AND i."periodEnd" >= $1
        AND s."userId" != ALL($2::uuid[])
        AND s.status NOT IN ('incomplete', 'incomplete_expired')
    )
)
SELECT
  CASE WHEN recipient_email = purchaser_email THEN 'self-paid' ELSE 'payer != holder (gifted?)' END AS bucket,
  COUNT(*)::int AS count
FROM rows
GROUP BY 1
ORDER BY 1
`

const SAMPLE_QUERY = `
SELECT
  m.id::text AS id,
  ru.email AS recipient_email,
  pu.email AS purchaser_email,
  pkg."name" AS package_name,
  p."createdAt" AS pledge_created_at
FROM "memberships" m
JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
JOIN "pledges" p ON p.id = mp."pledgeId"
JOIN "packages" pkg ON pkg.id = p."packageId"
JOIN "users" ru ON ru.id = m."userId"
JOIN "users" pu ON pu.id = p."userId"
WHERE mp."beginDate" < $1 AND mp."endDate" >= $1
  AND m."userId" != ALL($2::uuid[])
  AND NOT EXISTS (
    SELECT 1 FROM pledges pex
    WHERE pex.id = m."pledgeId" AND pex."userId" = ANY($2::uuid[])
  )
  AND mt.name = 'BENEFACTOR_ABO'
  AND ru.email != pu.email
  AND m."userId" NOT IN (
    SELECT s."userId" FROM payments.subscriptions s
    JOIN payments.invoices i ON i."subscriptionId" = s.id
    WHERE i."periodStart" < $1 AND i."periodEnd" >= $1
      AND s."userId" != ALL($2::uuid[])
      AND s.status NOT IN ('incomplete', 'incomplete_expired')
  )
ORDER BY pledge_created_at
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
      `BENEFACTOR_ABO (Gönnermitgliedschaft) memberships active at ${argv.asOf.format('YYYY-MM-DD')}, split by payer vs. holder …\n`,
    )

    const rows = await pgdb.query(QUERY, [asOf, EXCLUDED_USER_IDS])
    console.table(rows)

    const sample = await pgdb.query(SAMPLE_QUERY, [asOf, EXCLUDED_USER_IDS])
    if (sample.length) {
      console.log('\nsample of payer != holder rows:')
      console.table(sample)
    }
    console.log('\ncompare "self-paid" against the published Gönnermitgliedschaft figure: 136')
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
