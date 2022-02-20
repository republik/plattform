const debug = require('debug')('access:lib:stats:evolution')
const moment = require('moment')

const {
  cache: { create },
} = require('@orbiting/backend-modules-utils')

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 * 8 // A week and a day

const query = `
SELECT
  ag."accessCampaignId",
  to_char(range.date, 'YYYY-MM-DD') "key",
  range.date "date",
  COUNT(DISTINCT ag.id) "active",
  COUNT(DISTINCT ag.id) - COUNT(DISTINCT p.id) "activeUnconverted",
  COUNT(DISTINCT p.id) "converted"
FROM (
      SELECT
        generate_series(
          :min::timestamp,
          :max::timestamp,
          '1 day'
        ) :: date AT TIME ZONE :TZ "date"
    ) "range"
LEFT JOIN "accessGrants" ag
  ON ag."beginAt" <= range.date
 AND ag."endAt" >= range.date
LEFT JOIN "pledges" p
  ON p."userId" = ag."recipientUserId"
 AND p."createdAt" BETWEEN ag."beginAt" AND ag."endAt" + '30 days' :: interval
 AND p.status != 'DRAFT'
GROUP BY 1, 2, 3
ORDER BY 2
`

const createCache = (context) =>
  create(
    {
      namespace: 'access',
      prefix: 'AccessGrant:evolution',
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
