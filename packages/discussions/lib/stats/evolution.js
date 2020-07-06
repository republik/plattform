const debug = require('debug')('discussions:lib:stats:evolution')

const { cache: { create } } = require('@orbiting/backend-modules-utils')

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 // A day

const query = `
WITH "commentsVotes" AS (
  SELECT
    to_char(c."createdAt", 'YYYY-MM') "key",
    c.id "commentId",
    c."discussionId",
    c."userId",
    'comment' "engagement"
    
  FROM "comments" c
  WHERE c."userId" IS NOT NULL
  
  UNION
    
  SELECT 
    to_char(c."createdAt", 'YYYY-MM') "key",
    c.id "commentId",
    c."discussionId",
    v."userId",
    'vote' "engagement"
      
  FROM "comments" c, jsonb_to_recordset(c.votes) AS v("userId" uuid)
  WHERE v."userId" IS NOT NULL
)

SELECT
  cv.key,
  COUNT(DISTINCT cv."commentId") "comments",
  COUNT(DISTINCT cv."discussionId") "discussions",
  COUNT(DISTINCT cv."userId") "users",
  COUNT(DISTINCT cv."userId") FILTER (WHERE cv.engagement = 'comment') "usersPosted",
  COUNT(DISTINCT cv."userId") FILTER (WHERE cv.engagement = 'vote') "usersVoted"
  
FROM "commentsVotes" cv

GROUP BY 1
`

const createCache = (context) => create(
  {
    namespace: 'discussions',
    prefix: 'stats:evolution',
    key: 'any',
    ttl: QUERY_CACHE_TTL_SECONDS
  },
  context
)

const populate = async (context, resultFn) => {
  debug('populate')

  const { pgdb } = context

  // Generate date for range
  const result = await pgdb.query(query)

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
