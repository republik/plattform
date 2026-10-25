#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { DEFAULT_AS_OF, endOfDayInZurich } = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

// Finds the EXACT ids where the point-in-time snapshot query
// (lib/membershipCategorizedCte.js) and the lifecycle-event query
// (lib/membershipLifecycleCte.js) disagree about whether something is
// active on a given date. These two queries are independently written and
// are supposed to describe the same reality — if `count` at date T and
// "is this id inside its lifecycle active-range at T" disagree for even one
// id, that's a real bug in one of the two queries, not "residual variance".
// This script surfaces the disagreeing ids with the raw underlying dates so
// the actual cause is visible directly, instead of guessed at.
//
// Old-system ids differ in shape between the two CTEs (point-in-time uses
// the bare membership id; lifecycle segments a membership into
// `id-seq-N` per gap-separated period run), so the old-system comparison is
// done at the membership-id level directly here (segment logic inlined),
// not by reusing the lifecycle module's suffixed ids.
const OLD_DIAGNOSTIC = `
WITH pit_old AS (
  SELECT DISTINCT m.id AS membership_id
  FROM "memberships" m
  JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
  WHERE mp."beginDate" < $1 AND mp."endDate" >= $1
    AND m."userId" != ALL($2::uuid[])
    AND NOT EXISTS (
      SELECT 1 FROM pledges pex
      WHERE pex.id = m."pledgeId" AND pex."userId" = ANY($2::uuid[])
    )
    AND m."userId" NOT IN (
      SELECT s."userId" FROM payments.subscriptions s
      JOIN payments.invoices i ON i."subscriptionId" = s.id
      WHERE i."periodStart" < $1 AND i."periodEnd" >= $1
        AND s."userId" != ALL($2::uuid[])
        AND s.status NOT IN ('incomplete', 'incomplete_expired')
        AND (
          COALESCE(s."endedAt", s."cancelAt") IS NULL
          OR COALESCE(s."endedAt", s."cancelAt") > $1
        )
    )
),
old_periods_with_gaps AS (
  SELECT mp."membershipId", mp."beginDate", mp."endDate",
    LAG(mp."endDate") OVER (
      PARTITION BY mp."membershipId" ORDER BY mp."beginDate"
    ) AS previous_end_date
  FROM "membershipPeriods" mp
),
old_segmented AS (
  SELECT "membershipId", "beginDate", "endDate",
    SUM(
      CASE
        WHEN previous_end_date IS NULL
          OR previous_end_date BETWEEN DATE_TRUNC('month', "beginDate") AND "beginDate"
        THEN 0
        ELSE 1
      END
    ) OVER (PARTITION BY "membershipId" ORDER BY "beginDate") AS segment_num
  FROM old_periods_with_gaps
),
lifecycle_old AS (
  SELECT m.id AS membership_id, m."userId", s.segment_num,
    MIN(s."beginDate") AS first_start,
    MAX(s."endDate") AS last_end
  FROM "memberships" m
  JOIN old_segmented s ON s."membershipId" = m.id
  WHERE m."userId" != ALL($2::uuid[])
    AND NOT EXISTS (
      SELECT 1 FROM pledges pex
      WHERE pex.id = m."pledgeId" AND pex."userId" = ANY($2::uuid[])
    )
  GROUP BY m.id, m."userId", s.segment_num
),
lifecycle_old_active AS (
  SELECT DISTINCT membership_id, "userId", MIN(first_start) AS first_start, MAX(last_end) AS last_end
  FROM lifecycle_old
  WHERE first_start <= $1 AND last_end > $1
  GROUP BY membership_id, "userId"
)
SELECT
  COALESCE(p.membership_id, l.membership_id) AS membership_id,
  (p.membership_id IS NOT NULL) AS in_point_in_time,
  (l.membership_id IS NOT NULL) AS in_lifecycle,
  l.first_start,
  l.last_end,
  -- if true, this old-system membership is correctly excluded from the
  -- point-in-time count by the cross-system dedup (the same user already
  -- has an active new-system subscription at this date) — expected
  -- behaviour, not a bug. If false, it's a genuine discrepancy.
  EXISTS (
    SELECT 1 FROM payments.subscriptions s2
    JOIN payments.invoices i2 ON i2."subscriptionId" = s2.id
    WHERE s2."userId" = l."userId"
      AND i2."periodStart" < $1 AND i2."periodEnd" >= $1
      AND s2."userId" != ALL($2::uuid[])
      AND s2.status NOT IN ('incomplete', 'incomplete_expired')
      AND (
        COALESCE(s2."endedAt", s2."cancelAt") IS NULL
        OR COALESCE(s2."endedAt", s2."cancelAt") > $1
      )
  ) AS user_has_active_new_system_row
FROM pit_old p
FULL OUTER JOIN lifecycle_old_active l ON l.membership_id = p.membership_id
WHERE p.membership_id IS NULL OR l.membership_id IS NULL
`

const NEW_DIAGNOSTIC = `
WITH pit_new AS (
  SELECT DISTINCT s.id
  FROM payments.subscriptions s
  JOIN payments.invoices i ON i."subscriptionId" = s.id
  WHERE i."periodStart" < $1 AND i."periodEnd" >= $1
    AND s."userId" != ALL($2::uuid[])
    AND s.status NOT IN ('incomplete', 'incomplete_expired')
    AND (
      COALESCE(s."endedAt", s."cancelAt") IS NULL
      OR COALESCE(s."endedAt", s."cancelAt") > $1
    )
),
lifecycle_new_active AS (
  SELECT s.id
  FROM payments.subscriptions s
  WHERE s."userId" != ALL($2::uuid[])
    AND s.status NOT IN ('incomplete', 'incomplete_expired')
    AND s."createdAt" <= $1
    AND (
      COALESCE(s."endedAt", s."cancelAt") IS NULL
      OR COALESCE(s."endedAt", s."cancelAt") > $1
    )
)
SELECT
  COALESCE(p.id, l.id) AS id,
  (p.id IS NOT NULL) AS in_point_in_time,
  (l.id IS NOT NULL) AS in_lifecycle,
  s.status,
  s."createdAt",
  s."endedAt",
  s."cancelAt",
  s."currentPeriodStart",
  s."currentPeriodEnd"
FROM pit_new p
FULL OUTER JOIN lifecycle_new_active l ON l.id = p.id
JOIN payments.subscriptions s ON s.id = COALESCE(p.id, l.id)
WHERE p.id IS NULL OR l.id IS NULL
`

const argv = yargs
  .option('asOf', {
    describe: 'point in time to compare, end-of-day Europe/Zurich',
    coerce: endOfDayInZurich,
    default: endOfDayInZurich(DEFAULT_AS_OF),
  })
  .option('limit', {
    describe: 'max sample rows to print per system',
    number: true,
    default: 30,
  })
  .help()
  .version().argv

const run = async () => {
  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })
  try {
    const asOf = argv.asOf.toDate()
    console.log(`comparing point-in-time vs lifecycle-active-range at ${argv.asOf.format('YYYY-MM-DD HH:mm:ss')} Europe/Zurich …\n`)

    const oldRows = await pgdb.query(OLD_DIAGNOSTIC, [asOf, EXCLUDED_USER_IDS])
    const newRows = await pgdb.query(NEW_DIAGNOSTIC, [asOf, EXCLUDED_USER_IDS])

    const oldOnlyPit = oldRows.filter((r) => r.in_point_in_time && !r.in_lifecycle)
    const oldOnlyLifecycle = oldRows.filter((r) => !r.in_point_in_time && r.in_lifecycle)
    const newOnlyPit = newRows.filter((r) => r.in_point_in_time && !r.in_lifecycle)
    const newOnlyLifecycle = newRows.filter((r) => !r.in_point_in_time && r.in_lifecycle)

    console.log('OLD SYSTEM (memberships)')
    console.log(`  in point-in-time count, NOT in lifecycle active-range: ${oldOnlyPit.length}`)
    console.log(`  in lifecycle active-range, NOT in point-in-time count: ${oldOnlyLifecycle.length}`)
    if (oldOnlyPit.length) {
      console.log('  sample (point-in-time only) — membership_id, lifecycle first_start/last_end (if any segment exists at all):')
      console.table(oldOnlyPit.slice(0, argv.limit))
    }
    if (oldOnlyLifecycle.length) {
      const expectedByMigration = oldOnlyLifecycle.filter((r) => r.user_has_active_new_system_row)
      console.log(
        `  of which ${expectedByMigration.length} are the user's OLD row correctly dropped by the cross-system dedup (they already have an active new-system row) — expected, not a bug`,
      )
      console.log('  sample (lifecycle only) — membership_id, first_start, last_end, user_has_active_new_system_row:')
      console.table(oldOnlyLifecycle.slice(0, argv.limit))
    }

    console.log('\nNEW SYSTEM (payments.subscriptions)')
    console.log(`  in point-in-time count, NOT in lifecycle active-range: ${newOnlyPit.length}`)
    console.log(`  in lifecycle active-range, NOT in point-in-time count: ${newOnlyLifecycle.length}`)
    if (newOnlyPit.length) {
      console.log('  sample (point-in-time only):')
      console.table(newOnlyPit.slice(0, argv.limit))
    }
    if (newOnlyLifecycle.length) {
      console.log('  sample (lifecycle only):')
      console.table(newOnlyLifecycle.slice(0, argv.limit))
    }

    const total =
      oldOnlyPit.length + oldOnlyLifecycle.length + newOnlyPit.length + newOnlyLifecycle.length
    console.log(`\ntotal disagreeing ids at this date: ${total}`)
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
