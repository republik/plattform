const debug = require('debug')('republik:lib:MembershipStats:evolution')
const moment = require('moment')

const {
  cache: { create },
} = require('@orbiting/backend-modules-utils')

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 * 8 // A week and a day

const CROWDFUNDER_THRESHOLD_DATE = '2017-05-01 00:00:00+02'
const LOYALIST_THRESHOLD_DATE = '2018-01-16 00:00:00+02'

const query = `
WITH "minMaxDates" AS (
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
		m."createdAt"
	FROM
		"memberships" m
		JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
		JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
		-- all memberships belonging to user with periods
		JOIN "memberships" um ON um."userId" = m."userId"
		JOIN "membershipPeriods" ump ON ump."membershipId" = um.id
	WHERE
		m."userId" != 'f0512927-7e03-4ecc-b14f-601386a2a249'
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
		s."userId" != 'f0512927-7e03-4ecc-b14f-601386a2a249'
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
    AND "minCreatedAt" < :crowdfunderThresholdDate::timestamp
  ) "activeCrowdfunders",

  COUNT(DISTINCT "userId") FILTER (
    WHERE "maxEndDate" >= LEAST(NOW(), "last")
    AND "minBeginDate" < LEAST(NOW(), "last")
    AND "minCreatedAt" < :loyalistThresholdDate::timestamp
  ) "activeLoyalists",

  COUNT(id) FILTER (
    WHERE "maxEndDate" >= :min::timestamp
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
    AND "minCreatedAt" < :crowdfunderThresholdDate::timestamp
  ) "activeCrowdfundersEndOfMonth",

  COUNT(DISTINCT "userId") FILTER (
    WHERE "maxEndDate" >= "last"
    AND "minBeginDate" < "last"
    AND "minCreatedAt" < :loyalistThresholdDate::timestamp
  ) "activeLoyalistsEndOfMonth",

  -- Data based on membership active state

  COUNT(id) FILTER (
    WHERE "maxEndDate" >= "first"
    AND "maxEndDate" <= "last"
    AND active = TRUE
    AND renew = TRUE
  ) "prolongable",

  COUNT(id) FILTER (
    WHERE "maxEndDate" >= :min::timestamp
    AND "maxEndDate" <= "last"
    AND active = TRUE
    AND renew = TRUE
  ) "pending",

  COUNT(id) FILTER (
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

const createCache = (context) =>
  create(
    {
      namespace: 'republik',
      prefix: 'MembershipStats:evolution',
      key: 'any',
      ttl: QUERY_CACHE_TTL_SECONDS,
    },
    context,
  )

const populate = async (context, resultFn) => {
  debug('populate')

  const { pgdb } = context

  // Determine range we've to generate data for
  const [{ minBeginDate, maxEndDate }] = await pgdb.query(`
    SELECT
      LEAST(MIN("beginDate"), now()) "minBeginDate",
      LEAST(MAX("endDate"), now() + '2 years'::interval) "maxEndDate"

    FROM "membershipPeriods"
  `)

  const min = moment(minBeginDate).startOf('month').format('YYYY-MM-DD')
  const max = moment(maxEndDate).startOf('month').format('YYYY-MM-DD')

  // Generate date for range
  const result = await pgdb.query(query, {
    min,
    max,
    TZ: process.env.TZ || 'Europe/Zurich',
    crowdfunderThresholdDate: CROWDFUNDER_THRESHOLD_DATE,
    loyalistThresholdDate: LOYALIST_THRESHOLD_DATE,
  })

  if (resultFn) {
    return resultFn(result)
  }

  // Cache said data.
  await createCache(context).set({ result, updatedAt: new Date() })
}

/** Reducer, to sum up properties in a bucket */
const reducerBucketProps = (bucket) => (sum, prop) => {
  const value = bucket[prop]

  if (!Number.isFinite(value)) {
    throw new Error(
      `Missing prop "${prop}" on bucket "${bucket.key}" when summing up props`,
    )
  }

  return sum + value
}

/**
 * @typedef {Object} AddSubtractProps
 * @property {string[]} [add] Props to add to sum
 * @property {string[]} [subtract] Props to subtract from sum
 */

/**
 * Sum bucket properties from cached data
 *
 * @param {string} [key] Bucket key e.g. "2020-07"
 * @param {AddSubtractProps} [props] Add or subtract passed properties
 *
 * @returns {(number|null)}
 */
const sumBucketProps = async (
  context,
  key = moment().format('YYYY-MM'),
  props,
) => {
  // Fetch pre-populated data
  const data = await createCache(context).get()

  if (!data) {
    throw new Error(
      'Unable to sum bucket: Pre-populated data is not available. Did you run `yarn populate`?',
    )
  }

  // Retrieve pre-populated result from data.
  const { result = [] } = data

  // Find desired bucket
  const bucket = result.find((bucket) => bucket.key === key)

  if (!bucket) {
    throw new Error(
      `Unable to sum bucket: Bucket "${key}" not in pre-populated data available`,
    )
  }

  const { add = ['active', 'overdue'], subtract = [] } = props

  const sumAdd = add.reduce(reducerBucketProps(bucket), 0)
  const sumSubtract = subtract.reduce(reducerBucketProps(bucket), 0)

  return sumAdd - sumSubtract
}

const getCount = (context) =>
  sumBucketProps(context, moment().format('YYYY-MM'), {
    add: ['active', 'overdue'],
  })

module.exports = {
  createCache,
  populate,
  getCount,
}
