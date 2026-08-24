#!/usr/bin/env node
// Ad-hoc diagnostic: quantify, in net terms, how much of the
// count-vs-net-sum gap the old->new migration-overlap pattern explains.
//
// For every user with BOTH an old-system membership row and a new-system
// subscription row that are active on overlapping dates (the same
// condition the count query's dedup handles), find the specific old
// segment(s) involved and check whether their lifecycle "loss" lands
// inside the fiscal year. If it doesn't (old period's nominal end is
// beyond FY end, or the segment is never marked is_canceled at all), the
// corresponding "gain" for the new subscription is a phantom net +1 for
// the year -- the count query never actually incremented because of this
// transition (dedup keeps exactly one row throughout), but the lifecycle
// query recorded a gain with no offsetting loss this FY.
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

const FY_START = '2025-07-01'
const FY_END = '2026-06-30'

const QUERY = `
WITH old_periods_with_gaps AS (
  SELECT
    mp."membershipId", mp."beginDate", mp."endDate", mp."pledgeId",
    LAG(mp."endDate") OVER (PARTITION BY mp."membershipId" ORDER BY mp."beginDate") AS previous_end_date
  FROM "membershipPeriods" mp
),
old_segmented AS (
  SELECT "membershipId", "beginDate", "endDate",
    SUM(CASE
      WHEN previous_end_date IS NULL
        OR previous_end_date BETWEEN DATE_TRUNC('month', "beginDate") AND "beginDate"
      THEN 0 ELSE 1
    END) OVER (PARTITION BY "membershipId" ORDER BY "beginDate") AS segment_num
  FROM old_periods_with_gaps
),
old_segments AS (
  SELECT "membershipId", segment_num, MIN("beginDate") AS first_start, MAX("endDate") AS last_end
  FROM old_segmented
  GROUP BY "membershipId", segment_num
),
old_segment_status AS (
  SELECT os.*, m."userId", m.renew,
    (os.last_end <= CURRENT_DATE OR NOT m.renew) AS is_canceled
  FROM old_segments os
  JOIN "memberships" m ON m.id = os."membershipId"
  WHERE m."userId" != ALL($1::uuid[])
),
new_gains AS (
  SELECT s.id, s."userId", s."createdAt"
  FROM payments.subscriptions s
  WHERE s."userId" != ALL($1::uuid[])
    AND s.status NOT IN ('incomplete', 'incomplete_expired')
    AND s."createdAt" >= $2 AND s."createdAt" <= $3
),
overlap AS (
  SELECT DISTINCT
    g.id AS new_subscription_id, g."userId", g."createdAt",
    os."membershipId" AS old_membership_id, os.segment_num,
    os.first_start AS old_first_start, os.last_end AS old_last_end, os.is_canceled
  FROM new_gains g
  JOIN old_segment_status os
    ON os."userId" = g."userId"
    AND os.first_start < g."createdAt" AND os.last_end >= g."createdAt"
)
SELECT *,
  -- does the old segment's own loss land inside the FY window?
  (is_canceled AND old_last_end >= $2 AND old_last_end <= $3) AS old_loss_in_fy
FROM overlap
ORDER BY "createdAt"
`

const run = async () => {
  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht-diagnose' })
  try {
    const rows = await pgdb.query(QUERY, [EXCLUDED_USER_IDS, FY_START, FY_END])
    const phantom = rows.filter((r) => !r.old_loss_in_fy)
    console.log(`total migration-overlap gains in FY: ${rows.length}`)
    console.log(`of those, old segment's loss NOT recorded within FY (phantom net +1 each): ${phantom.length}`)
    phantom.forEach((r) =>
      console.log(`  userId=${r.userId} newSub=${r.new_subscription_id} createdAt=${r.createdAt.toISOString().slice(0,10)} oldSegment last_end=${r.old_last_end.toISOString().slice(0,10)} is_canceled=${r.is_canceled}`),
    )
    console.log(`\nestimated phantom net contribution to the annual total: +${phantom.length}`)
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
