const debug = require('debug')('republik:lib:MembershipStats:ages')
const {
  cache: { create },
} = require('@orbiting/backend-modules-utils')

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 * 8 // A week and a day

const createCache = (context) =>
  create(
    {
      namespace: 'republik',
      prefix: 'MembershipStats:ages',
      key: 'any',
      ttl: QUERY_CACHE_TTL_SECONDS,
    },
    context,
  )

const populate = async (context, resultFn) => {
  debug('populate')

  const { pgdb } = context

  /* 
    key: Int
    count: Int!
    */
  const result = await pgdb.query(`
    SELECT
      extract(year from age(birthday)) AS key,
      count(distinct u.id) AS count
    FROM users u
    JOIN
      memberships m
      ON m."userId" = u.id
    WHERE m.active = true
    GROUP BY 1
    ORDER BY 1
  `)

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
