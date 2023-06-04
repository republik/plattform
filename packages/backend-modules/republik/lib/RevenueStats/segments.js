const debug = require('debug')('republik:lib:RevenueStats:segments')

const {
  cache: { create },
} = require('@orbiting/backend-modules-utils')

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 * 8 // A week and a day
const BUCKET_DATE_FORMAT = 'YYYY'

const query = `
WITH "totals" AS (
  WITH "resolvedData" AS (
    WITH "packageOptionsWithRewardType" AS (
      SELECT pkgo.id, r.type
      FROM "packageOptions" pkgo
      JOIN "rewards" r ON r.id = pkgo."rewardId"
    )
    SELECT
      pay."createdAt" "paymentCreatedAt",
      pay.id "paymentId",
      pay.total "paymentTotal",

      -- Memberships
      p."createdAt"::date != ppay."createdAt"::date "autoPay",

      LEAST(pom.price, 24000) "membershipPrice",
      CASE
        WHEN pkg.name != 'MONTHLY_ABO' AND p."createdAt"::date != ppay."createdAt"::date
          THEN 24000
        WHEN pkg.name != 'MONTHLY_ABO' AND (m.id IS NULL OR m."userId" = p."userId") AND pkg.group != 'GIVE'
          THEN pom.amount * COALESCE(pom.periods, 1) * LEAST(pom.price, 24000)
        ELSE 0
      END "membershipValue",

      -- Give
      CASE
        WHEN pkg.group = 'GIVE' OR m."userId" != p."userId"
          THEN pom.amount * COALESCE(pom.periods, 1) * LEAST(pom.price, 24000)
        ELSE 0
      END "giveValue",

      -- Abo
      CASE
        WHEN pkg.name = 'MONTHLY_ABO'
          THEN pay.total
        ELSE 0
      END "aboValue",

      -- Jahres-Abo
      CASE
        WHEN pkg.name = 'YEARLY_ABO'
          THEN pay.total
        ELSE 0
      END "yearlyAboValue",

      -- Goodie
      GREATEST(pog.amount * pog.price, 0) "goodieValue"

    FROM payments pay
    JOIN "pledgePayments" ppay ON ppay."paymentId" = pay.id
    JOIN "pledges" p ON p.id = ppay."pledgeId"
    JOIN "packages" pkg ON p."packageId" = pkg.id
    LEFT JOIN "pledgeOptions" po ON po."pledgeId" = p.id AND p."createdAt"::date = ppay."createdAt"::date
    LEFT JOIN "pledgeOptions" pom
      ON pom.id = po.id AND
      pom."templateId" IN (SELECT id FROM "packageOptionsWithRewardType" WHERE type = 'MembershipType')
    LEFT JOIN "pledgeOptions" pog
      ON pog.id = po.id AND
      pog."templateId" IN (SELECT id FROM "packageOptionsWithRewardType" WHERE type != 'MembershipType')
    LEFT JOIN "memberships" m ON m.id = pom."membershipId"
    WHERE pay.status IN ('PAID', 'WAITING')
  )

  SELECT
    TO_CHAR(rd."paymentCreatedAt" AT TIME ZONE :TZ, :BUCKET_DATE_FORMAT) "unit",
    rd."paymentId",
    rd."paymentTotal",
    rd."paymentTotal"
      - COALESCE(SUM(rd."membershipValue"), 0)
      - COALESCE(SUM(rd."aboValue"), 0)
      - COALESCE(SUM(rd."yearlyAboValue"), 0)
      - COALESCE(SUM(rd."giveValue"), 0)
      - COALESCE(SUM(rd."goodieValue"), 0)
        "surplusTotal",
    SUM(rd."membershipValue") "membershipValue",
    SUM(rd."giveValue") "giveValue",
    SUM(rd."aboValue") "aboValue",
    SUM(rd."yearlyAboValue") "yearlyAboValue",
    SUM(rd."goodieValue") "goodieValue"
  FROM "resolvedData" rd
  GROUP BY "unit", rd."paymentId", rd."paymentTotal"
)

SELECT
  "unit",
  SUM("paymentTotal") "total",
  SUM("membershipValue" + LEAST(0, "surplusTotal"))::int "membership",
  SUM("giveValue")::int "give",
  SUM("aboValue")::int "abo",
  SUM("yearlyAboValue")::int "yearlyAbo",
  SUM("goodieValue")::int "goodie",
  SUM(GREATEST(0, "surplusTotal"))::int "donation"

FROM "totals"
GROUP BY "unit"
ORDER BY "unit"
`

const createCache = (context) =>
  create(
    {
      namespace: 'republik',
      prefix: 'RevenueStats:segments',
      key: 'any',
      ttl: QUERY_CACHE_TTL_SECONDS,
    },
    context,
  )

const populate = async (context, resultFn) => {
  debug('populate')

  const { pgdb } = context

  const buckets = await pgdb.query(query, {
    BUCKET_DATE_FORMAT,
    TZ: process.env.TZ || 'Europe/Zurich',
  })

  const result = buckets.map((bucket) => {
    const { unit, total } = bucket

    const segments = Object.keys(bucket)
      .filter((bucketKey) => !['unit', 'total'].includes(bucketKey))
      .map((segmentKey) => ({
        key: segmentKey,
        share: bucket[segmentKey] / total,
      }))

    return {
      key: unit,
      buckets: segments,
    }
  })

  if (resultFn) {
    return resultFn(result)
  }

  // Cache said data.
  await createCache(context).set({ result, updatedAt: new Date() })
}

module.exports = {
  createCache,
  populate,
}
