const debug = require('debug')('republik:lib:MembershipStats:evolution')
const moment = require('moment')

const { cache: { create } } = require('@orbiting/backend-modules-utils')

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 // A day

const query = `
WITH "minMaxDates" AS (
  SELECT m.id, m.active, m.renew, m."autoPay", mt.name "membershipTypeName", MIN(mp."beginDate") "minBeginDate", MAX(mp."endDate") "maxEndDate"
  FROM "memberships" m
  JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
  JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
  WHERE m."userId" != 'f0512927-7e03-4ecc-b14f-601386a2a249' -- Jefferson
  GROUP BY m.id, mt.id
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
    unit at time zone :TZ "first",
    (unit + '1 month'::interval - '1 second'::interval) at time zone :TZ "last"

  FROM generate_series(
    :min::timestamp,
    :max::timestamp,
    '1 month'
  ) unit
)

SELECT
  to_char("first" at time zone :TZ, 'YYYY-MM') "key",

  COUNT(*) FILTER (
    WHERE "maxEndDate" >= "first"
    AND "minBeginDate" < "first"
  ) "activeBeginningOfMonth",

  COUNT(*) FILTER (
    WHERE "minBeginDate" >= "first"
    AND "minBeginDate" <= "last"
  ) "gaining",

  COUNT(*) FILTER (
    WHERE "minBeginDate" >= "first"
    AND "minBeginDate" <= "last"
    AND "membershipDonation"."membershipId" IS NOT NULL
  ) "gainingWithDonation",

  COUNT(*) FILTER (
    WHERE "minBeginDate" >= "first"
    AND "minBeginDate" <= "last"
    AND "membershipDonation"."membershipId" IS NULL
  ) "gainingWithoutDonation",

  COUNT(*) FILTER (
    WHERE "maxEndDate" >= "first"
    AND "maxEndDate" <= "last"

  ) "ending",

  -- Data up until now

  COUNT(*) FILTER (
    WHERE "maxEndDate" >= "first"
    AND "maxEndDate" <= LEAST(NOW(), "last")
    AND active = FALSE
  ) "ended",

  COUNT(*) FILTER (
    WHERE "maxEndDate" >= "first"
    AND "maxEndDate" <= LEAST(NOW(), "last")
    AND active = FALSE
    AND renew = TRUE
  ) "expired",

  COUNT(*) FILTER (
    WHERE "maxEndDate" >= "first"
    AND "maxEndDate" <= LEAST(NOW(), "last")
    AND active = FALSE
    AND renew = FALSE
  ) "cancelled",

  COUNT(*) FILTER (
    WHERE "maxEndDate" >= LEAST(NOW(), "last")
    AND "minBeginDate" < LEAST(NOW(), "last")
  ) "active",

  COUNT(*) FILTER (
    WHERE "maxEndDate" >= :min::timestamp
    AND "maxEndDate" <= LEAST(NOW(), "last")
    AND active = TRUE
    AND renew = TRUE
  ) "overdue",

  -- Data to end of month

  COUNT(*) FILTER (
    WHERE "maxEndDate" >= "first"
    AND "maxEndDate" <= "last"
  ) "endedEndOfMonth",

  COUNT(*) FILTER (
    WHERE "maxEndDate" >= "first"
    AND "maxEndDate" <= "last"
    AND renew = TRUE
  ) "expiredEndOfMonth",

  COUNT(*) FILTER (
    WHERE "maxEndDate" >= "first"
    AND "maxEndDate" <= "last"
    AND renew = FALSE
  ) "cancelledEndOfMonth",

  COUNT(*) FILTER (
    WHERE "maxEndDate" >= "last"
    AND "minBeginDate" < "last"
  ) "activeEndOfMonth",

  COUNT(*) FILTER (
    WHERE "maxEndDate" >= "last"
    AND "minBeginDate" < "last"
    AND "membershipDonation"."membershipId" IS NOT NULL
  ) "activeEndOfMonthWithDonation",

  COUNT(*) FILTER (
    WHERE "maxEndDate" >= "last"
    AND "minBeginDate" < "last"
    AND "membershipDonation"."membershipId" IS NULL
  ) "activeEndOfMonthWithoutDonation",

  -- Data based on membership active state

  COUNT(*) FILTER (
    WHERE "maxEndDate" >= "first"
    AND "maxEndDate" <= "last"
    AND active = TRUE
    AND renew = TRUE
  ) "prolongable",

  COUNT(*) FILTER (
    WHERE "maxEndDate" >= :min::timestamp
    AND "maxEndDate" <= "last"
    AND active = TRUE
    AND renew = TRUE
  ) "pending",

  COUNT(*) FILTER (
    WHERE "maxEndDate" >= :min::timestamp
    AND "maxEndDate" <= "last"
    AND active = TRUE
    AND renew = TRUE
    AND "membershipTypeName" IN ('MONTHLY_ABO')
  ) "pendingSubscriptionsOnly"

FROM range, "minMaxDates"

LEFT JOIN "membershipDonation"
  ON "membershipDonation"."membershipId" = "minMaxDates".id

GROUP BY 1
ORDER BY 1
`

const createCache = (context) => create(
  {
    namespace: 'republik',
    prefix: 'MembershipStats:evolution',
    key: 'any',
    ttl: QUERY_CACHE_TTL_SECONDS
  },
  context
)

const populate = async (context, resultFn) => {
  debug('populate')

  const { pgdb } = context

  // Determine range we've to generate data for
  const [{ minBeginDate, maxEndDate }] = await pgdb.query(`
    SELECT
      MIN("beginDate") "minBeginDate",
      MAX("endDate") "maxEndDate"

    FROM "membershipPeriods"
  `)

  const min = moment(minBeginDate).startOf('month').format('YYYY-MM-DD')
  const max = moment(maxEndDate).startOf('month').format('YYYY-MM-DD')

  // Generate date for range
  const result = await pgdb.query(query, { min, max, TZ: process.env.TZ || 'Europe/Zurich' })

  if (resultFn) {
    return resultFn(result)
  }

  // Cache said data.
  await createCache(context).set({ result, updatedAt: new Date() })
}

module.exports = {
  createCache,
  populate
}
