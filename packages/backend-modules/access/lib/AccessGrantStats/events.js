const debug = require('debug')('access:lib:stats:events')
const moment = require('moment')

const {
  cache: { create },
} = require('@orbiting/backend-modules-utils')

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 * 8 // A week and a day

const query = `
WITH "withRange" AS (
  SELECT
    ac.id "accessCampaignId",
    generate_series(
      :min::timestamp,
      :max::timestamp,
      '1 day'
    ) :: date AT TIME ZONE :TZ "date"
  FROM "accessCampaigns" ac
), "withEvents" AS (
  SELECT
    'invite' "event",
    ag."accessCampaignId",
    to_char(ag."createdAt" AT TIME ZONE :TZ, 'YYYY-MM-DD') "key",
    COUNT(ag.id) "value"
    
  FROM "accessGrants" ag
  WHERE ag."createdAt" BETWEEN :min::timestamp AND :max::timestamp

  GROUP BY 1, 2, 3

  UNION

  SELECT
    'claim' "event",
    ag."accessCampaignId",
    to_char(ag."beginAt" AT TIME ZONE :TZ, 'YYYY-MM-DD') "key",

    COUNT(ag.id) "value"
    
  FROM "accessGrants" ag
  WHERE ag."beginAt" BETWEEN :min::timestamp AND :max::timestamp

  GROUP BY 1, 2, 3

  UNION

  SELECT
    'pledge' "event",
    ag."accessCampaignId",
    to_char(p."createdAt" AT TIME ZONE :TZ, 'YYYY-MM-DD') "key",
    COUNT(p.id) "value"
    
  FROM "accessGrants" ag
  JOIN pledges p
    ON p."userId" = ag."recipientUserId"
  AND p.status != 'DRAFT'
  AND p."createdAt" BETWEEN :min::timestamp AND :max::timestamp
  AND p."createdAt" BETWEEN ag."beginAt" AND ag."endAt" + '30 days' :: interval

  GROUP BY 1, 2, 3

  UNION

  SELECT
    'revenue' "event",
    ag."accessCampaignId",
    to_char(p."createdAt" AT TIME ZONE :TZ, 'YYYY-MM-DD') "key",
    SUM(p.total) "value"
    
  FROM "accessGrants" ag
  JOIN pledges p
    ON p."userId" = ag."recipientUserId"
  AND p.status != 'DRAFT'
  AND p."createdAt" BETWEEN :min::timestamp AND :max::timestamp
  AND p."createdAt" BETWEEN ag."beginAt" AND ag."endAt" + '30 days' :: interval

  GROUP BY 1, 2, 3
)

SELECT
  wr."accessCampaignId",
  to_char(wr.date, 'YYYY-MM-DD') "key",
  wr.date "date",
  COALESCE(SUM(we.value) FILTER (WHERE we.event = 'invite'), 0) :: int "invites",
  COALESCE(SUM(we.value) FILTER (WHERE we.event = 'claim'), 0) :: int "claims",
  COALESCE(SUM(we.value) FILTER (WHERE we.event = 'pledge'), 0) :: int "pledges",
  COALESCE(SUM(we.value) FILTER (WHERE we.event = 'revenue'), 0) :: int "revenue"
  
FROM "withRange" wr
LEFT JOIN "withEvents" we
  ON we.key = to_char(wr.date, 'YYYY-MM-DD')
GROUP BY 1, 2, 3

ORDER BY 1, 2, 3
`

const createCache = (context) =>
  create(
    {
      namespace: 'access',
      prefix: 'AccessGrant:events',
      key: 'any',
      ttl: QUERY_CACHE_TTL_SECONDS,
    },
    context,
  )

const populate = async (context, resultFn) => {
  debug('populate')

  const { pgdb } = context

  // Generate date for range
  const result = await pgdb.query(query, {
    min: moment().subtract(60, 'days'),
    max: moment().add(1, 'day'),
    TZ: process.env.TZ || 'Europe/Zurich',
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
