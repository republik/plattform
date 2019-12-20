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

      -- Memberships
      pom.id,
      pom.amount "memberhipAmount",
      pom.amount * 24000 "membershipTotal",

      -- Goodies
      pog.id,
      pog.amount "goodieAmount",
      pog.amount * pog.price "goodieTotal"

    FROM payments pay
    JOIN "pledgePayments" ppay ON ppay."paymentId" = pay.id
    JOIN "pledges" p ON p.id = ppay."pledgeId"

    JOIN "pledgeOptions" po ON po."pledgeId" = p.id

    LEFT JOIN "pledgeOptions" pom
      ON pom.id = po.id AND
      pom."templateId" IN (SELECT id FROM "packageOptionsWithRewardType" WHERE type = 'MembershipType')

    LEFT JOIN "pledgeOptions" pog
      ON pog.id = po.id AND
      pog."templateId" IN (SELECT id FROM "packageOptionsWithRewardType" WHERE type != 'MembershipType')

    WHERE
      (pay.total >= 24000 OR p.donation > 0) AND
      pay.status = 'PAID' AND
      pay."createdAt" BETWEEN :min AND :max
    GROUP BY pay.id, p.id, po.id, pom.id, pog.id
  )

  SELECT
    rd."paymentId",
    rd."paymentCreatedAt",
    rd."paymentTotal",
    SUM(rd."membershipTotal") "membershipTotal",
    SUM(rd."goodieTotal") "goodieTotal",
    rd."paymentTotal" - COALESCE(SUM(rd."membershipTotal"), 0) - COALESCE(SUM(rd."goodieTotal"), 0) "surplusTotal"

  FROM "resolvedData" rd

  GROUP BY rd."paymentId", rd."paymentCreatedAt", rd."paymentTotal"
)

SELECT COALESCE(SUM("surplusTotal"), 0)::int "total"
FROM "totals"
LIMIT 1
`

const getTotalFn = (min, max, pgdb) => async () => {
  debug(
    'query for: %o',
    { min: min.toISOString(), max: max.toISOString() }
  )

  const { records, additionals } = await Promise.props({
    records: await pgdb.query(query, { min, max }),
    additionals: await pgdb.public.gsheets.findOneFieldOnly({ name: 'revenueStatsSurplusAdditionals' }, 'data')
  })

  const result = { total: 0, ...records[0] }

  debug('query result: %o', result)

  additionals.forEach(({ dateTime, amount }) => {
    if (moment(dateTime).isBefore(max)) {
      result.total += parseInt(amount)
    }
  })

  debug('query result including addtionals: %o', result)

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
