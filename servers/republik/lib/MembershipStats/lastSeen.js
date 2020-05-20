const debug = require('debug')('republik:lib:MembershipStats:lastSeen')

const { cache: { create } } = require('@orbiting/backend-modules-utils')

const LAST_SEEN_AGO = '30 days'
const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 // A day

const query = `
WITH "sessionsLastSeen" AS (
  SELECT
    ("sess"->'passport'->>'user')::uuid "userId",
    
    GREATEST(
      -- Default max-age on a session (7 days)
      CASE
        WHEN "expire" - '365 days'::interval <= now()::timestamp(0) + '10 seconds'::interval
        THEN "expire" - '365 days'::interval
        ELSE NULL
      END,
      
      -- Short max-age on a session (7 days)
      CASE
        WHEN "expire" - '7 days'::interval <= now()::timestamp(0) + '10 seconds'::interval
        THEN "expire" - '7 days'::interval
        ELSE NULL
      END
    ) "lastSeenAt"  

  FROM "sessions"
  
  INNER JOIN "memberships"
    ON "memberships"."userId" = ("sess"->'passport'->>'user')::uuid
    AND "memberships"."active" = TRUE
)

SELECT to_char(now(), 'YYYY-MM') "key", COUNT(DISTINCT "userId") "users"
FROM "sessionsLastSeen"
WHERE "lastSeenAt" >= now()::timestamp(0) - :ago::interval
`

const createCache = (context) => create(
  {
    namespace: 'republik',
    prefix: 'MembershipStats:lastSeen',
    key: 'any',
    ttl: QUERY_CACHE_TTL_SECONDS
  },
  context
)

const populate = async (context, resultFn) => {
  debug('populate')

  const { pgdb } = context
  const ago = LAST_SEEN_AGO

  // Generate date for range
  const result = await pgdb.query(query, { ago })

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
