// Lifecycle-event version of the membership/subscription categorization,
// used ONLY for computing new/lost in membershipEvolutionByFiscalYear.js —
// NOT for point-in-time counts (membershipsAndSubscriptions.js still uses
// the period-coverage-based lib/membershipCategorizedCte.js for that,
// which remains the right tool for "how many are active on this exact
// date").
//
// Why this exists: diffing period-coverage snapshots month-to-month (the
// original approach) measures something different from — and, compared to
// an existing Metabase reference dashboard (question #1809,
// "abo-gain-loss-grouped-by-month-company-and-abo-type"), disagreed with —
// a lifecycle-event model. Metabase's model counts a "gain" once, when a
// membership/subscription is first created, and a "loss" once, only when
// it's actually canceled — regardless of billing/invoice-period gaps in
// between. The period-based diff instead treats ANY invoice-period gap
// (a renewal invoice generated a few days late, a payment retry cycle,
// proration adjustments — none of which mean the person actually left) as
// a lost+new event pair. That inflates gross new/lost substantially in
// high-volume months without the person ever leaving, which is exactly
// what a side-by-side comparison against Metabase's numbers showed: net
// was only off by 3-124/month, but gross new/lost was off by up to
// ~860/month, concentrated in the heaviest acquisition months.
//
// This module ports Metabase's #1809 logic as closely as possible:
//  - old system (memberships): SEGMENTS membershipPeriods by gaps (a gap
//    that crosses a calendar-month boundary starts a new segment; a gap
//    within the same month doesn't), then uses each segment's
//    min(beginDate)/max(endDate) as its lifecycle start/end. "Canceled" =
//    the segment's last period has already ended as of today, or the
//    membership's renew flag is off.
//  - new system (payments.subscriptions): uses the subscription's own
//    createdAt as lifecycle start, and COALESCE(endedAt, cancelAt) as
//    lifecycle end — ignoring invoice periods entirely, matching Metabase.
//    "Reduced" is evaluated against the FIRST invoice only (fixed at
//    signup), not re-evaluated per snapshot date, since a lifecycle event
//    has no single "snapshot date" to re-evaluate against.
//
// $1 is the excluded-user-ids array (lib/excludedUsers.js).
const LIFECYCLE_CATEGORIZED_CTE = `
WITH old_periods_with_gaps AS (
  SELECT
    mp."membershipId",
    mp."beginDate",
    mp."endDate",
    LAG(mp."endDate") OVER (
      PARTITION BY mp."membershipId" ORDER BY mp."beginDate"
    ) AS previous_end_date
  FROM "membershipPeriods" mp
),
old_segmented AS (
  SELECT
    "membershipId",
    "beginDate",
    "endDate",
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
old_lifecycle AS (
  SELECT
    m.id::text || '-seq-' || s.segment_num::text AS id,
    m."userId",
    MIN(mt.name) AS type_name,
    bool_or(m."reducedPrice") AS "reducedPrice",
    bool_or(
      EXISTS (
        SELECT 1 FROM pledges p
        JOIN packages pkg ON pkg.id = p."packageId"
        WHERE p.id = m."pledgeId"
          AND (pkg."name" = 'ABO_GIVE' OR p."userId" != m."userId")
      )
    ) AS is_gift,
    MIN(s."beginDate") AS first_start,
    MAX(s."endDate") AS last_end,
    (MAX(s."endDate") <= CURRENT_DATE OR bool_or(NOT m.renew)) AS is_canceled
  FROM "memberships" m
  JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
  JOIN old_segmented s ON s."membershipId" = m.id
  WHERE m."userId" != ALL($1::uuid[])
    AND NOT EXISTS (
      SELECT 1 FROM pledges pex
      WHERE pex.id = m."pledgeId" AND pex."userId" = ANY($1::uuid[])
    )
  GROUP BY m.id, m."userId", s.segment_num
),
new_lifecycle AS (
  SELECT
    s.id::text AS id,
    s."userId",
    s.type::text AS type_name,
    -- fixed-at-signup: does the FIRST-EVER invoice for this subscription
    -- have a discount? (not re-evaluated per snapshot date, unlike
    -- lib/membershipCategorizedCte.js's is_reduced)
    EXISTS (
      SELECT 1 FROM payments.invoices di
      WHERE di."subscriptionId" = s.id
        AND di."totalDiscountAmount" > 0
        AND di."periodStart" = (
          SELECT MIN(di2."periodStart")
          FROM payments.invoices di2
          WHERE di2."subscriptionId" = s.id
        )
    ) AS is_reduced,
    EXISTS (
      SELECT 1 FROM payments."giftVouchers" gv
      WHERE gv."redeemedBy" = s."userId"
        AND gv."redeemedAt" BETWEEN s."currentPeriodStart" - interval '14 days'
                                 AND s."currentPeriodStart" + interval '14 days'
    ) AS is_gift,
    s."createdAt" AS first_start,
    COALESCE(s."endedAt", s."cancelAt") AS last_end,
    (COALESCE(s."endedAt", s."cancelAt") IS NOT NULL) AS is_canceled
  FROM payments.subscriptions s
  WHERE s."userId" != ALL($1::uuid[])
    AND s.status NOT IN ('incomplete', 'incomplete_expired')
),
lifecycle_categorized AS (
  SELECT id, "userId", first_start, last_end, is_canceled,
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
  FROM old_lifecycle
  UNION ALL
  SELECT id, "userId", first_start, last_end, is_canceled,
    CASE
      WHEN type_name = 'YEARLY_SUBSCRIPTION' AND is_gift THEN 'Mitgliedschaft als Geschenk'
      WHEN type_name = 'YEARLY_SUBSCRIPTION' AND is_reduced THEN 'Jahresmitgliedschaft, reduziert'
      WHEN type_name = 'YEARLY_SUBSCRIPTION' THEN 'Jahresmitgliedschaft'
      WHEN type_name = 'BENEFACTOR_SUBSCRIPTION' THEN 'Gönnermitgliedschaft'
      WHEN type_name = 'MONTHLY_SUBSCRIPTION' AND is_gift THEN 'Monatsabonnement als Geschenk'
      WHEN type_name = 'MONTHLY_SUBSCRIPTION' THEN 'Monatsabonnement'
      ELSE 'Sonstige (neu): ' || type_name
    END AS category
  FROM new_lifecycle
)
`

// Full query: one row per (event_month, category, event_type, count).
// $2/$3 bound first_start/last_end to the fiscal year (with a little
// slack isn't needed — new_events only needs first_start in range,
// lost_events only needs last_end in range; events with the other endpoint
// outside the range are still counted correctly since only ONE endpoint's
// range is checked per CTE).
const LIFECYCLE_EVENTS_QUERY =
  LIFECYCLE_CATEGORIZED_CTE +
  `
, new_events AS (
  SELECT DATE_TRUNC('month', first_start)::date AS event_month, category, id
  FROM lifecycle_categorized
  WHERE first_start >= $2 AND first_start <= $3
    -- don't count it as "new" if it also ended within the same month it
    -- started (refunded/immediately-canceled) — matches Metabase.
    AND (
      last_end IS NULL
      OR last_end > (DATE_TRUNC('month', first_start) + INTERVAL '1 month' - INTERVAL '1 millisecond')
    )
),
lost_events AS (
  SELECT DATE_TRUNC('month', last_end)::date AS event_month, category, id
  FROM lifecycle_categorized
  WHERE is_canceled
    AND last_end >= $2 AND last_end <= $3
    AND DATE_TRUNC('month', first_start) != DATE_TRUNC('month', last_end)
)
SELECT event_month, category, 'gain'::text AS event_type, COUNT(DISTINCT id)::int AS count
FROM new_events
GROUP BY 1, 2
UNION ALL
SELECT event_month, category, 'loss'::text AS event_type, COUNT(DISTINCT id)::int AS count
FROM lost_events
GROUP BY 1, 2
`

module.exports = { LIFECYCLE_EVENTS_QUERY }
