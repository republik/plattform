#!/usr/bin/env node
// Ad-hoc diagnostic: does the old->new system migration create lifecycle
// "gain" events (new subscription created) for users who, at that same
// moment, still have an ACTIVE (not yet is_canceled) old-system membership
// segment covering the same date? The point-in-time count query dedupes
// this overlap (drops the old row, keeps the new one -- see
// lib/membershipCategorizedCte.js's "old_rows WHERE userId NOT IN
// (SELECT userId FROM new_rows)"), but the lifecycle query
// (lib/membershipLifecycleCte.js) is a plain UNION ALL with no equivalent
// dedup -- a candidate source of net over-counting a "gain" the count
// query never reflects as a net increase.
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

const FY_START = '2025-07-01'
const FY_END = '2026-06-30'

const QUERY = `
-- new-system subscriptions created within the FY (a lifecycle "gain")
WITH new_gains AS (
  SELECT s.id, s."userId", s."createdAt"
  FROM payments.subscriptions s
  WHERE s."userId" != ALL($1::uuid[])
    AND s.status NOT IN ('incomplete', 'incomplete_expired')
    AND s."createdAt" >= $2 AND s."createdAt" <= $3
),
-- old-system membership periods that were still active (covering the
-- subscription's createdAt date) at the moment the new subscription was
-- created -- i.e. the migration overlap window.
overlap AS (
  SELECT DISTINCT g.id AS new_subscription_id, g."userId", g."createdAt",
    m.id AS old_membership_id, mp."beginDate", mp."endDate", m.renew
  FROM new_gains g
  JOIN "memberships" m ON m."userId" = g."userId"
  JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
  WHERE mp."beginDate" < g."createdAt" AND mp."endDate" >= g."createdAt"
)
SELECT * FROM overlap ORDER BY "createdAt"
`

const run = async () => {
  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht-diagnose' })
  try {
    const rows = await pgdb.query(QUERY, [EXCLUDED_USER_IDS, FY_START, FY_END])
    console.log(`migration-overlap gains (new subscription created while an old membership period still covered that date): ${rows.length}`)
    rows.slice(0, 30).forEach((r) =>
      console.log(`  userId=${r.userId} newSub=${r.new_subscription_id} createdAt=${r.createdAt.toISOString().slice(0,10)} oldPeriod=${r.beginDate.toISOString().slice(0,10)}..${r.endDate.toISOString().slice(0,10)} renew=${r.renew}`),
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
