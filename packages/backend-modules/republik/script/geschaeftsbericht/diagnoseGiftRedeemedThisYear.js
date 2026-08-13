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

// Eleventh hypothesis: "Geschenk" = gifts actually REDEEMED during this
// specific fiscal year, using memberships."updatedAt" as the redemption
// signal — republik-crowdfundings/lib/activateMembership.js explicitly sets
// updatedAt: now() at the moment of redemption, which is more direct than
// the firstPeriodBeginDate proxy used in earlier attempts (shown to be
// unreliable — periods can multiply from repeated re-gifting, unrelated to
// redemption). Caveat: updatedAt could in principle be bumped by other
// unrelated admin edits too, not only redemption — treat this as
// best-effort, not exact. Checked against BOTH sides this time (the
// ABO_GIVE_MONTHS number MUST stay close to the published 146, or this
// hypothesis is unsafe the same way the last one was).
const QUERY = `
WITH old_rows AS (
  SELECT
    m.id::text AS id,
    mt.name AS type_name,
    EXISTS (
      SELECT 1 FROM pledges p
      JOIN packages pkg ON pkg.id = p."packageId"
      WHERE p.id = m."pledgeId"
        AND (pkg."name" = 'ABO_GIVE' OR p."userId" != m."userId")
    ) AS is_gift,
    m."voucherCode" IS NOT NULL AS is_unredeemed,
    m."updatedAt"
  FROM "memberships" m
  JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
  JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
  WHERE mp."beginDate" < $1 AND mp."endDate" >= $1
    AND m."userId" != ALL($3::uuid[])
    AND NOT EXISTS (
      SELECT 1 FROM pledges pex
      WHERE pex.id = m."pledgeId" AND pex."userId" = ANY($3::uuid[])
    )
    AND mt.name IN ('ABO', 'ABO_GIVE_MONTHS')
    AND m."userId" NOT IN (
      SELECT s."userId" FROM payments.subscriptions s
      JOIN payments.invoices i ON i."subscriptionId" = s.id
      WHERE i."periodStart" < $1 AND i."periodEnd" >= $1
        AND s."userId" != ALL($3::uuid[])
        AND s.status NOT IN ('incomplete', 'incomplete_expired')
    )
)
SELECT
  type_name,
  COUNT(*) FILTER (WHERE NOT is_unredeemed)::int AS total_redeemed_gift_stock,
  COUNT(*) FILTER (
    WHERE NOT is_unredeemed AND "updatedAt" >= $2 AND "updatedAt" < $1
  )::int AS redeemed_this_fy_by_updated_at
FROM old_rows
WHERE is_gift
GROUP BY type_name
ORDER BY type_name
`

const run = async () => {
  const argv = yargs
    .option('asOf', {
      describe: 'fiscal year end, end-of-day Europe/Zurich',
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
      `gift memberships active at ${argv.asOf.format('YYYY-MM-DD')}, split by whether updatedAt falls within FY (redemption proxy) …\n`,
    )

    const rows = await pgdb.query(QUERY, [asOf, fyStart, EXCLUDED_USER_IDS])
    console.table(rows)
    console.log(
      "\ncompare ABO's redeemed_this_fy_by_updated_at against published Mitgliedschaften-Geschenk (655),",
      "\nand ABO_GIVE_MONTHS's against published Abonnemente-Geschenk (146) — this one MUST stay close, or the signal is contaminated by unrelated updates.",
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
