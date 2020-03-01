const moment = require('moment')
const debug = require('debug')('republik:resolvers:RevenueStats:surplus')
const Promise = require('bluebird')

const createCache = require('../../../modules/crowdfundings/lib/cache')
const QUERY_CACHE_TTL_SECONDS = 60 * 5 // 5 min

const query = `
WITH "totals" AS (
  WITH "resolvedData" AS (
    WITH "packageOptionsWithRewardType" AS (
      SELECT pkgo.id, r.type
      FROM "packageOptions" pkgo
      JOIN "rewards" r ON r.id = pkgo."rewardId"
    )
    SELECT
      pay.id "paymentId",
      pay.total "paymentTotal",
      pay."createdAt" "paymentCreatedAt",
      p.id "pledgeId",
      pkg.name "packageName",

      -- Memberships
      pom.id,
      pom.amount * COALESCE(pom.periods, 1) "membershipAmount",
      LEAST(pom.price, 24000) "membershipPrice",
      pom.amount * COALESCE(pom.periods, 1) * LEAST(pom.price, 24000) "membershipTotal",

      -- Goodies
      pog.id,
      pog.amount "goodieAmount",
      pog.amount * pog.price "goodieTotal"

    FROM payments pay
    JOIN "pledgePayments" ppay ON ppay."paymentId" = pay.id
    JOIN "pledges" p ON p.id = ppay."pledgeId"

    JOIN "packages" pkg ON p."packageId" = pkg.id

    JOIN "pledgeOptions" po ON po."pledgeId" = p.id

    LEFT JOIN "pledgeOptions" pom
      ON pom.id = po.id AND
      pom."templateId" IN (SELECT id FROM "packageOptionsWithRewardType" WHERE type = 'MembershipType')

    LEFT JOIN "pledgeOptions" pog
      ON pog.id = po.id AND
      pog."templateId" IN (SELECT id FROM "packageOptionsWithRewardType" WHERE type != 'MembershipType')

    WHERE
      pay.status = 'PAID' AND
      pay."createdAt" BETWEEN :min AND :max AND
      pkg.name != 'MONTHLY_ABO'
    GROUP BY pay.id, p.id, pkg.name, po.id, pom.id, pog.id
    --ORDER BY pay."createdAt" DESC
  ),
  "membershipActivationStats" AS (
    SELECT
      p.id "pledgeId",
      COUNT(*) FILTER (
        WHERE m."active" = true
      ) "numActive"
    FROM
      pledges p
    JOIN
      memberships m
      ON m."pledgeId" = p.id
    GROUP BY
      p.id
  )

  SELECT
    --rd."paymentId",
    --rd."paymentCreatedAt",
    --rd."paymentTotal",
    --SUM(rd."membershipTotal") "membershipTotal",
    --SUM(rd."goodieTotal") "goodieTotal",
    --mas."numActive",
    --SUM(rd."membershipAmount") "membershipAmount",
    --SUM(rd."membershipPrice") "membershipPrice",
    --(mas."numActive" * COALESCE(SUM(rd."membershipTotal"), 0)/SUM("membershipAmount")) "subtract",
    CASE
      WHEN rd."packageName" = 'ABO_GIVE' THEN
        rd."paymentTotal" - (mas."numActive" * COALESCE(SUM(rd."membershipTotal"), 0)/SUM("membershipAmount")) - COALESCE(SUM(rd."goodieTotal"), 0)
      ELSE
        rd."paymentTotal" - COALESCE(SUM(rd."membershipTotal"), 0) - COALESCE(SUM(rd."goodieTotal"), 0)
    END AS "surplusTotal"

  FROM "resolvedData" rd

  LEFT JOIN "membershipActivationStats" mas
  ON rd."pledgeId" = mas."pledgeId"

  GROUP BY rd."paymentId", rd."paymentCreatedAt", rd."paymentTotal", rd."packageName", mas."pledgeId", mas."numActive"
  --ORDER BY rd."paymentCreatedAt" DESC
)
SELECT COALESCE(SUM("surplusTotal"), 0)::int "total"
FROM "totals"
WHERE "surplusTotal" > 0
`

const normalPaymentsQuery = `
SELECT
  SUM(pay.total) "total"
FROM
  payments pay
WHERE
  pay.status = 'PAID' AND
  pay."createdAt" > :min AND
  pay."createdAt" <= :max
`

const getTotalFn = (min, max, pgdb) => async () => {
  debug(
    'query for: %o',
    { min: min.toISOString(), max: max.toISOString() }
  )

  const switchDate = await pgdb.public.gsheets.findOneFieldOnly({
    name: 'RevenueStatsSwitchDate'
  }, 'data')
    .then(obj => obj && moment(obj))

  const maxSurplus = switchDate || max

  const { records, additionals, normalPayments } = await Promise.props({
    records: await pgdb.query(query, {
      min,
      max: maxSurplus
    }),
    additionals: await pgdb.public.gsheets.findOneFieldOnly({
      name: 'revenueStatsSurplusAdditionals'
    }, 'data'),
    normalPayments: switchDate && await pgdb.queryOne(normalPaymentsQuery, {
      min: maxSurplus,
      max
    })
  })

  const result = { total: 0, ...records[0] }

  debug('query result: %o', result)

  additionals.forEach(({ dateTime, amount }) => {
    if (moment(dateTime).isBefore(max)) {
      result.total += parseInt(amount)
    }
  })

  debug('query result including addtionals: %o', result)

  if (normalPayments && normalPayments.total) {
    result.total += normalPayments.total
    debug('query result including normal payments: %o', result)
  }

  return { ...result, updatedAt: new Date() }
}

module.exports = async (_, args, context) => {
  const { pgdb } = context

  const min = moment(args.min)
  const max = moment(args.max)

  const dateFormat = 'YYYY-MM-DD'
  const queryId = `${min.format(dateFormat)}-${max.format(dateFormat)}`

  return createCache({
    prefix: 'RevenueStats:surplus',
    key: queryId,
    ttl: QUERY_CACHE_TTL_SECONDS,
    forceRecache: args.forceRecache
  }, context)
    .cache(getTotalFn(min, max, pgdb))
}
