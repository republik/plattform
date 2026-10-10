#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { writeCsv } = require('./lib/output')
const { DEFAULT_AS_OF, endOfDayInZurich, fiscalYearLabelFromAsOf } = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

// Lists every individual gift-flagged membership/subscription active at
// --asOf, with enough detail (recipient/purchaser email, package, dates,
// redemption status) for a human to manually cross-check against another
// source (e.g. a checkout/order log, Stripe, a marketing tool) — this is
// the raw data behind the aggregate counts in membershipsAndSubscriptions.js
// ("Mitgliedschaft als Geschenk" / "Monatsabonnement als Geschenk"), for
// when the aggregate numbers alone aren't enough to explain a mismatch
// (see README's "Gift-membership definition" section — eleven mechanism
// hypotheses have been tested and ruled out from aggregate data alone).
const OLD_SYSTEM_QUERY = `
SELECT
  m.id::text AS membership_id,
  'old' AS source,
  mt.name AS type_name,
  CASE
    WHEN m."voucherCode" IS NOT NULL THEN 'uneingelöst'
    ELSE 'eingelöst'
  END AS redemption_status,
  pkg."name" AS package_name,
  ru.email AS recipient_email,
  pu.email AS purchaser_email,
  (ru.email = pu.email) AS purchaser_is_recipient,
  m."reducedPrice",
  p."createdAt" AS pledge_created_at,
  m."createdAt" AS membership_created_at,
  m."updatedAt" AS membership_updated_at,
  (SELECT MIN(mp2."beginDate") FROM "membershipPeriods" mp2 WHERE mp2."membershipId" = m.id) AS first_period_begin_date,
  mp."beginDate" AS current_period_begin_date,
  mp."endDate" AS current_period_end_date,
  (SELECT COUNT(*) FROM "membershipPeriods" mp3 WHERE mp3."membershipId" = m.id)::int AS total_period_count,
  m.renew,
  m.active
FROM "memberships" m
JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
JOIN "pledges" p ON p.id = m."pledgeId"
JOIN "packages" pkg ON pkg.id = p."packageId"
JOIN "users" ru ON ru.id = m."userId"
JOIN "users" pu ON pu.id = p."userId"
WHERE mp."beginDate" < $1 AND mp."endDate" >= $1
  AND m."userId" != ALL($2::uuid[])
  AND NOT EXISTS (
    SELECT 1 FROM pledges pex
    WHERE pex.id = m."pledgeId" AND pex."userId" = ANY($2::uuid[])
  )
  AND mt.name IN ('ABO', 'ABO_GIVE_MONTHS')
  AND (pkg."name" IN ('ABO_GIVE', 'ABO_GIVE_MONTHS') OR p."userId" != m."userId")
  AND m."userId" NOT IN (
    SELECT s."userId" FROM payments.subscriptions s
    JOIN payments.invoices i ON i."subscriptionId" = s.id
    WHERE i."periodStart" < $1 AND i."periodEnd" >= $1
      AND s."userId" != ALL($2::uuid[])
      AND s.status NOT IN ('incomplete', 'incomplete_expired')
  )
ORDER BY pledge_created_at
`

// New-system gift detection is a fuzzy heuristic (no FK between
// giftVouchers and subscriptions) — see lib/membershipCategorizedCte.js.
// Currently produces zero matches in practice, but included for
// completeness/future-proofing.
const NEW_SYSTEM_QUERY = `
SELECT
  s.id::text AS membership_id,
  'new' AS source,
  s.type::text AS type_name,
  'eingelöst' AS redemption_status,
  NULL AS package_name,
  ru.email AS recipient_email,
  NULL AS purchaser_email,
  NULL AS purchaser_is_recipient,
  NULL AS "reducedPrice",
  gv."redeemedAt" AS pledge_created_at,
  s."createdAt" AS membership_created_at,
  s."updatedAt" AS membership_updated_at,
  s."createdAt" AS first_period_begin_date,
  i."periodStart" AS current_period_begin_date,
  i."periodEnd" AS current_period_end_date,
  NULL AS total_period_count,
  NULL AS renew,
  NULL AS active
FROM payments.subscriptions s
JOIN payments.invoices i ON i."subscriptionId" = s.id
JOIN "users" ru ON ru.id = s."userId"
JOIN payments."giftVouchers" gv
  ON gv."redeemedBy" = s."userId"
  AND gv."redeemedAt" BETWEEN s."currentPeriodStart" - interval '14 days'
                           AND s."currentPeriodStart" + interval '14 days'
WHERE i."periodStart" < $1 AND i."periodEnd" >= $1
  AND s."userId" != ALL($2::uuid[])
  AND s.status NOT IN ('incomplete', 'incomplete_expired')
  AND (
    COALESCE(s."endedAt", s."cancelAt") IS NULL
    OR COALESCE(s."endedAt", s."cancelAt") > $1
  )
ORDER BY pledge_created_at
`

const argv = yargs
  .option('asOf', {
    describe: 'point-in-time snapshot date, end-of-day Europe/Zurich',
    coerce: endOfDayInZurich,
    default: endOfDayInZurich(DEFAULT_AS_OF),
  })
  .option('out', {
    describe: 'output directory',
    string: true,
    default: `${__dirname}/output`,
  })
  .help()
  .version().argv

const run = async () => {
  const asOf = argv.asOf.toDate()
  const fyLabel = fiscalYearLabelFromAsOf(argv.asOf)
  console.log(
    `listing gift memberships/subscriptions active at ${argv.asOf.format('YYYY-MM-DD')} 23:59:59 Europe/Zurich …`,
  )

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })
  try {
    const [oldRows, newRows] = await Promise.all([
      pgdb.query(OLD_SYSTEM_QUERY, [asOf, EXCLUDED_USER_IDS]),
      pgdb.query(NEW_SYSTEM_QUERY, [asOf, EXCLUDED_USER_IDS]),
    ])
    const rows = [...oldRows, ...newRows]

    console.log(`found ${rows.length} gift memberships/subscriptions (${oldRows.length} old system, ${newRows.length} new system)`)

    const filename = `gift-memberships_${argv.asOf.format('YYYY-MM-DD')}_FY${fyLabel}`
    writeCsv(rows, argv.out, filename)
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
