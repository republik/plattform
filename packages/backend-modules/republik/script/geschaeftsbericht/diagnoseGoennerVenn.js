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

// BENEFACTOR_ABO-only count (154) is +18 vs. published Gönnermitgliedschaft
// (136); CHF 1000-this-fiscal-year-only count (119) is -17 — roughly
// symmetric but opposite in direction. Tests whether "Gönner" is really the
// UNION of "holds a BENEFACTOR_ABO membership" OR "paid >= CHF 1000 this
// fiscal year", by breaking down the full Venn diagram: type-only,
// threshold-only, both, and the union total.
const QUERY = `
WITH benefactor_holders AS (
  SELECT DISTINCT m."userId"
  FROM "memberships" m
  JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
  JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
  WHERE mt.name = 'BENEFACTOR_ABO'
    AND mp."beginDate" < $1 AND mp."endDate" >= $1
    AND m."userId" != ALL($2::uuid[])
),
active_users AS (
  SELECT DISTINCT m."userId" AS "userId"
  FROM "memberships" m
  JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
  WHERE mp."beginDate" < $1 AND mp."endDate" >= $1
    AND m."userId" != ALL($2::uuid[])
  UNION
  SELECT DISTINCT s."userId" AS "userId"
  FROM payments.subscriptions s
  JOIN payments.invoices i ON i."subscriptionId" = s.id
  WHERE i."periodStart" < $1 AND i."periodEnd" >= $1
    AND s."userId" != ALL($2::uuid[])
    AND s.status NOT IN ('incomplete', 'incomplete_expired')
),
pledge_totals AS (
  SELECT p."userId", SUM(p.total)::bigint AS total_rappen
  FROM pledges p
  WHERE p.status = 'SUCCESSFUL'
    AND p."userId" != ALL($2::uuid[])
    AND p."createdAt" >= $3 AND p."createdAt" < $1
  GROUP BY p."userId"
),
threshold_holders AS (
  SELECT au."userId"
  FROM active_users au
  JOIN pledge_totals pt ON pt."userId" = au."userId"
  WHERE pt.total_rappen >= 100000
)
SELECT
  (SELECT COUNT(*) FROM benefactor_holders bh WHERE bh."userId" NOT IN (SELECT "userId" FROM threshold_holders))::int AS "type_only",
  (SELECT COUNT(*) FROM threshold_holders th WHERE th."userId" NOT IN (SELECT "userId" FROM benefactor_holders))::int AS "threshold_only",
  (SELECT COUNT(*) FROM benefactor_holders bh WHERE bh."userId" IN (SELECT "userId" FROM threshold_holders))::int AS "both",
  (SELECT COUNT(DISTINCT "userId") FROM (
    SELECT "userId" FROM benefactor_holders
    UNION
    SELECT "userId" FROM threshold_holders
  ) u)::int AS "union_total"
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
    const fyStart = fiscalYearStartFromAsOf(argv.asOf).toDate()
    console.log(
      `Venn breakdown: BENEFACTOR_ABO type vs. CHF 1000+ this fiscal year, at ${argv.asOf.format('YYYY-MM-DD')} …\n`,
    )

    const [row] = await pgdb.query(QUERY, [asOf, EXCLUDED_USER_IDS, fyStart])
    console.table([row])
    console.log('\ncompare "union_total" against published Gönnermitgliedschaft: 136')
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
