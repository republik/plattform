#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { DEFAULT_AS_OF, endOfDayInZurich } = require('./lib/dates')
const { EXCLUDED_USER_IDS, TOMBSTONE_USER_ID } = require('./lib/excludedUsers')

// Decomposes the gap between our validated count (membershipCategorizedCte.js)
// and the cockpit_membership_evolution materialized view's "activeEndOfMonth"
// column (migrations/sqls/20250604102839-cockpit-materialized-view-up.sql).
//
// Replicates cockpit's OWN minMaxDates definition — union of old
// memberships/membershipPeriods and new payments.subscriptions/invoices,
// aggregated to one row per id via MIN(beginDate)/MAX(endDate), no status
// filter, no endedAt/cancelAt check, only excluding a single hardcoded
// "tombstone" user — then applies cockpit's own activeEndOfMonth filter
// (maxEndDate >= $1 AND minBeginDate < $1), and successively layers on the
// same three corrections our own query already has, printing the count
// after each step so the gap can be attributed to a specific, quantified
// cause instead of asserted.
const COCKPIT_STYLE_MINMAX = `
WITH minmax AS (
  SELECT
    m.id::text AS id,
    m."userId",
    NULL::text AS status,
    NULL::timestamptz AS "endedAt",
    NULL::timestamptz AS "cancelAt",
    MIN(mp."beginDate") AS "minBeginDate",
    MAX(mp."endDate") AS "maxEndDate"
  FROM "memberships" m
  JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
  WHERE m."userId" != $2::uuid
  GROUP BY m.id, m."userId"
  UNION ALL
  SELECT
    s.id::text AS id,
    s."userId",
    s.status::text AS status,
    s."endedAt",
    s."cancelAt",
    MIN(i."periodStart") AS "minBeginDate",
    MAX(i."periodEnd") AS "maxEndDate"
  FROM payments.subscriptions s
  JOIN payments.invoices i ON i."subscriptionId" = s.id
  WHERE s."userId" != $2::uuid
  GROUP BY s.id, s."userId"
)
`

const run = async () => {
  const argv = yargs
    .option('asOf', {
      describe: 'point in time to compare, end-of-day Europe/Zurich',
      coerce: endOfDayInZurich,
      default: endOfDayInZurich(DEFAULT_AS_OF),
    })
    .help()
    .version().argv

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })
  try {
    const asOf = argv.asOf.toDate()
    console.log(`decomposing cockpit-style vs. our count at ${argv.asOf.format('YYYY-MM-DD HH:mm:ss')} Europe/Zurich …\n`)

    // Step A: cockpit's exact definition — no excludedUsers list, no status
    // filter, no endedAt/cancelAt check.
    const [rowA] = await pgdb.query(
      COCKPIT_STYLE_MINMAX +
        `SELECT COUNT(*)::int AS count FROM minmax
         WHERE "maxEndDate" >= $1 AND "minBeginDate" < $1`,
      [asOf, TOMBSTONE_USER_ID],
    )

    // Step B: + exclude our full internal/test account list, not just the
    // single tombstone user.
    const [rowB] = await pgdb.query(
      COCKPIT_STYLE_MINMAX +
        `SELECT COUNT(*)::int AS count FROM minmax
         WHERE "maxEndDate" >= $1 AND "minBeginDate" < $1
           AND "userId" != ALL($3::uuid[])`,
      [asOf, TOMBSTONE_USER_ID, EXCLUDED_USER_IDS],
    )

    // Step C: + exclude incomplete/incomplete_expired (new-system rows only
    // — old-system rows have status = NULL and are left untouched).
    const [rowC] = await pgdb.query(
      COCKPIT_STYLE_MINMAX +
        `SELECT COUNT(*)::int AS count FROM minmax
         WHERE "maxEndDate" >= $1 AND "minBeginDate" < $1
           AND "userId" != ALL($3::uuid[])
           AND (status IS NULL OR status NOT IN ('incomplete', 'incomplete_expired'))`,
      [asOf, TOMBSTONE_USER_ID, EXCLUDED_USER_IDS],
    )

    // Step D: + our stale-invoice-period fix (endedAt/cancelAt check) — this
    // should land close to our own validated `count`.
    const [rowD] = await pgdb.query(
      COCKPIT_STYLE_MINMAX +
        `SELECT COUNT(*)::int AS count FROM minmax
         WHERE "maxEndDate" >= $1 AND "minBeginDate" < $1
           AND "userId" != ALL($3::uuid[])
           AND (status IS NULL OR status NOT IN ('incomplete', 'incomplete_expired'))
           AND (COALESCE("endedAt", "cancelAt") IS NULL OR COALESCE("endedAt", "cancelAt") > $1)`,
      [asOf, TOMBSTONE_USER_ID, EXCLUDED_USER_IDS],
    )

    console.table([
      { step: 'A: cockpit-style (its own definition, replicated here)', count: rowA.count },
      { step: 'B: + exclude our full EXCLUDED_USER_IDS list', count: rowB.count, delta: rowB.count - rowA.count },
      { step: 'C: + exclude incomplete/incomplete_expired', count: rowC.count, delta: rowC.count - rowB.count },
      { step: 'D: + exclude ended/cancelled-mid-period (our fix)', count: rowD.count, delta: rowD.count - rowC.count },
    ])
    console.log(
      '\ncompare step A against the actual cockpit_membership_evolution.activeEndOfMonth for this month (should be close/identical),',
      '\nand step D against membershipsAndSubscriptions.js\'s own Total Mitgliedschaften + Total Abonnemente for this asOf (should now match closely).',
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
