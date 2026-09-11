-- migrate up here: CREATE TABLE...
-- Rewrite of cockpit_membership_evolution avoiding the unconditional
-- `FROM range, "minMaxDates"` cross join (128 months x ~100k memberships),
-- which produced a ~13M row intermediate result and a large disk sort on
-- every refresh. Published alongside the existing view as
-- cockpit_membership_evolution_v2 so results can be diffed before cutover
-- (see migration 20260911092500-cockpit-membership-evolution-v2-swap).
CREATE MATERIALIZED VIEW IF NOT EXISTS cockpit_membership_evolution_v2 AS (
  WITH query_variables AS (
  	select
  	'Europe/Zurich' as tz,
  	'2018-01-01' as min,
  	date_trunc('month', current_date + INTERVAL '2 years', 'Europe/Zurich') as max,
  	'2017-05-01 00:00:00+02' as CROWDFUNDER_THRESHOLD_DATE,
  	'2018-01-16 00:00:00+02' as LOYALIST_THRESHOLD_DATE,
    'f0512927-7e03-4ecc-b14f-601386a2a249'::uuid as tumbstone_user_id,
    now() as updated_at
  ),
  "minMaxDates" AS (
    WITH "periods" AS (
  	SELECT
  		m.id,
  		m.active,
  		m.renew,
  		m."autoPay",
  		mt.name "membershipTypeName",
  		mp."beginDate",
  		mp."endDate",
  		m."userId",
  		um."createdAt"
  	FROM
  		"memberships" m
  		JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
  		JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
  		-- all memberships belonging to user with periods
  		JOIN "memberships" um ON um."userId" = m."userId"
  		JOIN "membershipPeriods" ump ON ump."membershipId" = um.id
  	WHERE
  		m."userId" != (select tumbstone_user_id from query_variables)
  	UNION ALL
  	SELECT
  		s.id,
  		s.status IN ('active', 'past_due', 'unpaid', 'paused') "active",
  		s."canceledAt" IS NULL "renew",
  		TRUE "autoPay",
  		s.type::text "membershipTypeName",
  		i."periodStart" "beginDate",
  		i."periodEnd" "endDate",
  		s."userId",
  		us."createdAt"
  	FROM
  		payments.subscriptions s
  		JOIN payments.invoices i ON i."subscriptionId" = s.id
  		-- all subscriptions belonging to user with periods
  		JOIN payments.subscriptions us ON us."userId" = s."userId"
  		JOIN payments.invoices ui ON ui."subscriptionId" = us.id
  	WHERE
  		s."userId" != (select tumbstone_user_id from query_variables)
  )
  SELECT
  	id,
  	every("active") "active",
  	every("renew") "renew",
  	every("autoPay") "autoPay",
  	"membershipTypeName",
  	min("beginDate") "minBeginDate",
  	max("endDate") "maxEndDate",
  	min("userId"::text) "userId",
  	MIN("createdAt") "minCreatedAt"
  FROM
  	periods
  GROUP BY
  	id,
  	"membershipTypeName"
  ), "membershipDonation" AS (
    WITH "pledgeMembership" AS (
      SELECT p."createdAt", p.donation, COALESCE(pom.id, pm.id) "membershipId"
      FROM "pledges" p
      JOIN "pledgeOptions" po ON po."pledgeId" = p.id AND po.amount > 0
      LEFT JOIN "memberships" pom ON pom.id = po."membershipId" AND pom."userId" = p."userId"
      LEFT JOIN "memberships" pm ON pm."pledgeId" = p.id AND pm."userId" = p."userId"
      WHERE p.donation > 0
        AND (pom.id IS NOT NULL OR pm.id IS NOT NULL)
        AND p.status != 'DRAFT'
    )

    SELECT pm.donation, pm."membershipId"
    FROM (
      SELECT "membershipId", MAX("createdAt") AS "createdAt"
      FROM "pledgeMembership"
      GROUP BY "membershipId"
    ) AS lpm
    JOIN "pledgeMembership" pm
      ON pm."membershipId" = lpm."membershipId"
      AND pm."createdAt" = lpm."createdAt"
    GROUP BY pm."membershipId", pm.donation
  ), range AS (
    SELECT
      unit at time zone (SELECT tz from query_variables) "first",
      (unit + '1 month'::interval - '1 second'::interval) at time zone (SELECT tz from query_variables) "last"

    FROM generate_series(
      (SELECT min from query_variables)::timestamp,
      (SELECT max from query_variables)::timestamp,
      '1 month'
    ) unit
  )

  SELECT
    to_char("first" at time zone (SELECT tz from query_variables), 'YYYY-MM') "key",
    (select updated_at from query_variables) "updatedAt",

    COUNT(id) FILTER (
      WHERE "maxEndDate" >= "first"
      AND "minBeginDate" < "first"
    ) "activeBeginningOfMonth",

    COUNT(id) FILTER (
      WHERE "minBeginDate" >= "first"
      AND "minBeginDate" <= "last"
    ) "gaining",

    COUNT(id) FILTER (
      WHERE "minBeginDate" >= "first"
      AND "minBeginDate" <= "last"
      AND "membershipDonation"."membershipId" IS NOT NULL
    ) "gainingWithDonation",

    COUNT(id) FILTER (
      WHERE "minBeginDate" >= "first"
      AND "minBeginDate" <= "last"
      AND "membershipDonation"."membershipId" IS NULL
    ) "gainingWithoutDonation",

    COUNT(id) FILTER (
      WHERE "maxEndDate" >= "first"
      AND "maxEndDate" <= "last"

    ) "ending",

    -- Data up until now

    COUNT(id) FILTER (
      WHERE "maxEndDate" >= "first"
      AND "maxEndDate" <= LEAST(NOW(), "last")
      AND active = FALSE
    ) "ended",

    COUNT(id) FILTER (
      WHERE "maxEndDate" >= "first"
      AND "maxEndDate" <= LEAST(NOW(), "last")
      AND active = FALSE
      AND renew = TRUE
    ) "expired",

    COUNT(id) FILTER (
      WHERE "maxEndDate" >= "first"
      AND "maxEndDate" <= LEAST(NOW(), "last")
      AND active = FALSE
      AND renew = FALSE
    ) "cancelled",

    COUNT(id) FILTER (
      WHERE "maxEndDate" >= LEAST(NOW(), "last")
      AND "minBeginDate" < LEAST(NOW(), "last")
    ) "active",

    COUNT(DISTINCT "userId") FILTER (
      WHERE "maxEndDate" >= LEAST(NOW(), "last")
      AND "minBeginDate" < LEAST(NOW(), "last")
      AND "minCreatedAt" < (SELECT CROWDFUNDER_THRESHOLD_DATE from query_variables)::timestamp
    ) "activeCrowdfunders",

    COUNT(DISTINCT "userId") FILTER (
      WHERE "maxEndDate" >= LEAST(NOW(), "last")
      AND "minBeginDate" < LEAST(NOW(), "last")
      AND "minCreatedAt" < (SELECT LOYALIST_THRESHOLD_DATE from query_variables)::timestamp
    ) "activeLoyalists",

    COUNT(id) FILTER (
      WHERE "maxEndDate" >= (SELECT min from query_variables)::timestamp
      AND "maxEndDate" <= LEAST(NOW(), "last")
      AND active = TRUE
      AND renew = TRUE
    ) "overdue",

    -- Data to end of month

    COUNT(id) FILTER (
      WHERE "maxEndDate" >= "first"
      AND "maxEndDate" <= "last"
    ) "endedEndOfMonth",

    COUNT(id) FILTER (
      WHERE "maxEndDate" >= "first"
      AND "maxEndDate" <= "last"
      AND renew = TRUE
    ) "expiredEndOfMonth",

    COUNT(id) FILTER (
      WHERE "maxEndDate" >= "first"
      AND "maxEndDate" <= "last"
      AND renew = FALSE
    ) "cancelledEndOfMonth",

    COUNT(id) FILTER (
      WHERE "maxEndDate" >= "last"
      AND "minBeginDate" < "last"
    ) "activeEndOfMonth",

    COUNT(id) FILTER (
      WHERE "maxEndDate" >= "last"
      AND "minBeginDate" < "last"
      AND "membershipDonation"."membershipId" IS NOT NULL
    ) "activeEndOfMonthWithDonation",

    COUNT(id) FILTER (
      WHERE "maxEndDate" >= "last"
      AND "minBeginDate" < "last"
      AND "membershipDonation"."membershipId" IS NULL
    ) "activeEndOfMonthWithoutDonation",

    COUNT(DISTINCT "userId") FILTER (
      WHERE "maxEndDate" >= "last"
      AND "minBeginDate" < "last"
      AND "minCreatedAt" < (SELECT CROWDFUNDER_THRESHOLD_DATE from query_variables)::timestamp
    ) "activeCrowdfundersEndOfMonth",

    COUNT(DISTINCT "userId") FILTER (
      WHERE "maxEndDate" >= "last"
      AND "minBeginDate" < "last"
      AND "minCreatedAt" < (SELECT LOYALIST_THRESHOLD_DATE from query_variables)::timestamp
    ) "activeLoyalistsEndOfMonth",

    -- Data based on membership active state

    COUNT(id) FILTER (
      WHERE "maxEndDate" >= "first"
      AND "maxEndDate" <= "last"
      AND active = TRUE
      AND renew = TRUE
    ) "prolongable",

    COUNT(id) FILTER (
      WHERE "maxEndDate" >= (SELECT min from query_variables)::timestamp
      AND "maxEndDate" <= "last"
      AND active = TRUE
      AND renew = TRUE
    ) "pending",

    COUNT(id) FILTER (
      WHERE "maxEndDate" >= (SELECT min from query_variables)::timestamp
      AND "maxEndDate" <= "last"
      AND active = TRUE
      AND renew = TRUE
      AND "membershipTypeName" IN ('MONTHLY_ABO')
    ) "pendingSubscriptionsOnly"

  FROM "minMaxDates"

  LEFT JOIN "membershipDonation"
    ON "membershipDonation"."membershipId" = "minMaxDates".id

  JOIN LATERAL (
    SELECT r."first", r."last"
    FROM range r
    WHERE
      -- point-in-time fields: membership's active period overlaps this month
      (r."last" >= "minMaxDates"."minBeginDate" AND r."first" <= "minMaxDates"."maxEndDate")
      -- still-owes-a-renewal fields (overdue/pending/pendingSubscriptionsOnly):
      -- an active, auto-renewing membership counts toward every month from
      -- its start onward, not just the month it expires in
      OR ("minMaxDates".active AND "minMaxDates".renew AND r."last" >= "minMaxDates"."minBeginDate")
      -- "frozen at now" fields (active/activeCrowdfunders/activeLoyalists):
      -- a currently active membership is replayed identically into every
      -- future month bucket beyond its own overlap window
      OR (
        "minMaxDates"."maxEndDate" >= now()
        AND "minMaxDates"."minBeginDate" < now()
        AND r."first" > now()
      )
  ) r ON true

  GROUP BY 1
  ORDER BY 1
) WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS "cockpit_membership_evolution_v2_idx" ON "cockpit_membership_evolution_v2" ("key");
