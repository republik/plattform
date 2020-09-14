const debug = require('debug')('discussions:lib:stats:last')
const Promise = require('bluebird')

const {
  cache: { create },
} = require('@orbiting/backend-modules-utils')

const interval = '30 days'

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 // A day

const buildQuery = (last) => `
WITH "commentsVotes" AS (
  SELECT
    ${last ? '' : 'to_char(c."createdAt", \'YYYY-MM\') "key",'}
    c.id "commentId",
    c."discussionId",
    c."userId",
    'comment' "engagement"

  FROM "comments" c
  WHERE c."userId" IS NOT NULL ${
    last ? 'AND c."createdAt" >= now() - :interval::interval' : ''
  }

  UNION

  SELECT
    ${last ? '' : 'to_char(c."createdAt", \'YYYY-MM\') "key",'}
    c.id "commentId",
    c."discussionId",
    v."userId",
    'vote' "engagement"

  FROM "comments" c, jsonb_to_recordset(c.votes) AS v("userId" uuid)
  WHERE v."userId" IS NOT NULL ${
    last ? 'AND c."createdAt" >= now() - :interval::interval' : ''
  }
)

SELECT
  ${last ? '' : 'cv.key,'}
  COUNT(DISTINCT cv."commentId") "comments",
  COUNT(DISTINCT cv."discussionId") "discussions",
  COUNT(DISTINCT cv."userId") "users",
  COUNT(DISTINCT cv."userId") FILTER (WHERE cv.engagement = 'comment') "usersPosted",
  COUNT(DISTINCT cv."userId") FILTER (WHERE cv.engagement = 'vote') "usersVoted"

FROM "commentsVotes" cv

${last ? '' : 'GROUP BY 1'}
`

const createCache = (context) =>
  create(
    {
      namespace: 'discussions',
      prefix: 'stats:last',
      key: 'any',
      ttl: QUERY_CACHE_TTL_SECONDS,
    },
    context,
  )

const populate = async (context, dry) => {
  debug('populate')

  const { pgdb } = context

  const result = await pgdb.query(buildQuery(true), { interval })

  if (!dry) {
    await createCache(context).set({
      result: result[0],
      updatedAt: new Date(),
      key: 'discussions:stats:last',
    })
  }

  return result
}

module.exports = {
  buildQuery,
  createCache,
  populate,
}
