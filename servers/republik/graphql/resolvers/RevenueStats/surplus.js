const moment = require('moment')
const debug = require('debug')('republik:resolvers:RevenueStats:surplus')

const { resolveCacheFirst } = require('@orbiting/backend-modules-utils')

const getTotalFn = (minDate, maxDate, pgdb) => async () => {
  debug(
    'query for: %o',
    { minDate: minDate.toISOString(), maxDate: maxDate.toISOString() }
  )

  const result = await pgdb.query(`
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
          pay."createdAt" AT TIME ZONE 'Europe/Zurich' BETWEEN :minDate AND :maxDate
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
    
    SELECT COALESCE(SUM("surplusTotal"), 0) "total"
    FROM "totals"
    LIMIT 1
  `, { minDate, maxDate })

  debug('query result: %o', result)

  return { ...result[0] || {}, updatedAt: new Date() }
}

module.exports = async (_, args, context) => {
  const { pgdb } = context

  const minDate = moment(args.minDate)
  const maxDate = moment(args.maxDate).endOf('day')

  return resolveCacheFirst(
    getTotalFn(minDate, maxDate, pgdb),
    { key: `revenue-stats:surplus:${JSON.stringify(args)}` },
    context
  )
}
