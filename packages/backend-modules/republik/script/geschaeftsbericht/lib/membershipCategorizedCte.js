// Shared, validated core of the membership/subscription point-in-time
// snapshot logic. Produces a `categorized` CTE with columns (id, userId,
// category) for whichever memberships/subscriptions have a period covering
// the date bound to $1. Callers append their own final SELECT against
// `categorized` — see membershipsAndSubscriptions.js (aggregate counts) and
// membershipEvolutionByMonth.js (raw id/category rows, for month-over-month
// diffing).
//
// A membership/subscription counts as active on $1 if it has a period
// (membershipPeriods row / invoice) that covers $1 directly — not merely
// between the membership's earliest-ever and latest-ever period, since real
// gaps exist between periods (failed payment, later resubscribe) and
// aggregating across them would silently span those gaps (confirmed via
// diagnostic: this overcounted monthly-cycle memberships by ~11% before the
// fix). Unions the legacy pledge-based `memberships` tables with the new
// Stripe-based `payments.subscriptions` tables and classifies both into the
// same German report categories.
//
// $2 is the excluded-user-ids array (lib/excludedUsers.js) — internal/test
// accounts filtered out of both old and new rows.
//
// A user migrating from the old system to the new one during a transition
// can have an active row in BOTH old_rows and new_rows on the same date
// (confirmed via diagnostic: 22 users as of 30.06.2025) — deduped below by
// dropping the old-system row whenever the same user also has a new-system
// row, since the new system is the more current source of truth for anyone
// who's migrated.
const CATEGORIZED_CTE = `
WITH old_rows AS (
  SELECT
    m.id::text AS id,
    m."userId",
    mt.name AS type_name,
    m."reducedPrice",
    -- A membership is a gift if either:
    --  1) it was bought via the dedicated ABO_GIVE package (always a gift,
    --     regardless of who currently holds it), or
    --  2) the pledge's payer differs from the person currently holding the
    --     membership (a regular ABO directly gifted to someone else) — same
    --     signal already used in RevenueStats/segments.js.
    -- (packages."group" was a one-time 2018 backfill, not reliably set for
    -- packages created in later campaigns — use packages."name" instead.)
    EXISTS (
      SELECT 1 FROM pledges p
      JOIN packages pkg ON pkg.id = p."packageId"
      WHERE p.id = m."pledgeId"
        AND (pkg."name" = 'ABO_GIVE' OR p."userId" != m."userId")
    ) AS is_gift,
    mp."beginDate",
    mp."endDate"
  FROM "memberships" m
  JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
  JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
  WHERE mp."beginDate" < $1 AND mp."endDate" >= $1
    AND m."userId" != ALL($2::uuid[])
    -- exclude memberships whose pledge was PURCHASED by an excluded/test
    -- account too, not just ones HELD by one (found via diagnostic: the
    -- "Dummy users" account shows up as purchaser, not holder, for 10
    -- memberships otherwise held by real accounts — these are internal
    -- test data, not real gifts)
    AND NOT EXISTS (
      SELECT 1 FROM pledges pex
      WHERE pex.id = m."pledgeId" AND pex."userId" = ANY($2::uuid[])
    )
),
new_rows AS (
  SELECT
    s.id::text AS id,
    s."userId",
    s.type::text AS type_name,
    -- best-effort: any positive invoice discount is treated as "reduced"
    EXISTS (
      SELECT 1 FROM payments.invoices di
      WHERE di."subscriptionId" = s.id
        AND di."totalDiscountAmount" > 0
        AND $1 BETWEEN di."periodStart" AND di."periodEnd"
    ) AS is_reduced,
    -- best-effort: gift voucher redeemed by this user within +/-14 days of
    -- subscription start (no FK exists between giftVouchers and subscriptions)
    EXISTS (
      SELECT 1 FROM payments."giftVouchers" gv
      WHERE gv."redeemedBy" = s."userId"
        AND gv."redeemedAt" BETWEEN s."currentPeriodStart" - interval '14 days'
                                 AND s."currentPeriodStart" + interval '14 days'
    ) AS is_gift,
    i."periodStart" AS "beginDate",
    i."periodEnd" AS "endDate"
  FROM payments.subscriptions s
  JOIN payments.invoices i ON i."subscriptionId" = s.id
  WHERE i."periodStart" < $1 AND i."periodEnd" >= $1
    AND s."userId" != ALL($2::uuid[])
),
categorized AS (
  SELECT id, "userId", type_name, 'old' AS source,
    CASE
      WHEN type_name = 'ABO' AND is_gift THEN 'Mitgliedschaft als Geschenk'
      WHEN type_name = 'ABO' AND "reducedPrice" THEN 'Jahresmitgliedschaft, reduziert'
      WHEN type_name = 'ABO' THEN 'Jahresmitgliedschaft'
      WHEN type_name = 'BENEFACTOR_ABO' THEN 'Gönnermitgliedschaft'
      WHEN type_name = 'YEARLY_ABO' THEN 'Jahresabo (Mitgliederkampagne)'
      WHEN type_name = 'MONTHLY_ABO' THEN 'Monatsabonnement'
      WHEN type_name = 'ABO_GIVE_MONTHS' THEN 'Monatsabonnement als Geschenk'
      ELSE 'Sonstige (alt): ' || type_name
    END AS category
  FROM old_rows
  WHERE "userId" NOT IN (SELECT "userId" FROM new_rows)
  UNION ALL
  SELECT id, "userId", type_name, 'new' AS source,
    CASE
      WHEN type_name = 'YEARLY_SUBSCRIPTION' AND is_gift THEN 'Mitgliedschaft als Geschenk'
      WHEN type_name = 'YEARLY_SUBSCRIPTION' AND is_reduced THEN 'Jahresmitgliedschaft, reduziert'
      WHEN type_name = 'YEARLY_SUBSCRIPTION' THEN 'Jahresmitgliedschaft'
      WHEN type_name = 'BENEFACTOR_SUBSCRIPTION' THEN 'Gönnermitgliedschaft'
      WHEN type_name = 'MONTHLY_SUBSCRIPTION' AND is_gift THEN 'Monatsabonnement als Geschenk'
      WHEN type_name = 'MONTHLY_SUBSCRIPTION' THEN 'Monatsabonnement'
      ELSE 'Sonstige (neu): ' || type_name
    END AS category
  FROM new_rows
)
`

module.exports = { CATEGORIZED_CTE }
