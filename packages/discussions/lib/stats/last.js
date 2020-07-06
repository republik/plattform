const debug = require('debug')('discussions:lib:stats:last')
const Promise = require('bluebird')

const { cache: { create } } = require('@orbiting/backend-modules-utils')

const TREND_INTERVALS = [
  {
    key: 'last30days',
    interval: '30 days'
  },
  {
    key: 'last7days',
    interval: '7 days'
  },
  {
    key: 'last24hours',
    interval: '24 hours'
  }
]

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 // A day

const query = `
WITH "commentsVotes" AS (
  SELECT
    c.id "commentId",
    c."discussionId",
    c."userId",
    'comment' "engagement"

  FROM "comments" c
  WHERE c."userId" IS NOT NULL AND c."createdAt" >= now() - :interval::interval

  UNION

  SELECT 
    c.id "commentId",
    c."discussionId",
    v."userId",
    'vote' "engagement"

  FROM "comments" c, jsonb_to_recordset(c.votes) AS v("userId" uuid)
  WHERE v."userId" IS NOT NULL AND c."createdAt" >= now() - :interval::interval
)

SELECT
  COUNT(DISTINCT cv."commentId") "comments",
  COUNT(DISTINCT cv."discussionId") "discussions",
  COUNT(DISTINCT cv."userId") "users",
  COUNT(DISTINCT cv."userId") FILTER (WHERE cv.engagement = 'comment') "usersPosted",
  COUNT(DISTINCT cv."userId") FILTER (WHERE cv.engagement = 'vote') "usersVoted"

FROM "commentsVotes" cv
`

const createCache = (options, context) => create(
  {
    namespace: 'discussions',
    prefix: 'stats:last',
    key: 'any',
    ttl: QUERY_CACHE_TTL_SECONDS,
    ...options
  },
  context
)

const populate = async (context, resultFn) => {
  debug('populate')

  const { pgdb } = context

  const results = await Promise.map(
    TREND_INTERVALS,
    async ({ key, interval }) => {
      const rows = await pgdb.query(query, { interval })

      return {
        key,
        result: rows[0]
      }
    }
  )

  if (resultFn) {
    return resultFn(results)
  }

  await Promise.each(
    results,
    ({ key, result }) => createCache({ key }, context).set({ result, updatedAt: new Date() })
  )
}

module.exports = {
  TREND_INTERVALS,
  createCache,
  populate
}
