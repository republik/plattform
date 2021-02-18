const debug = require('debug')('republik:lib:MembershipStats:names')
const {
  cache: { create },
} = require('@orbiting/backend-modules-utils')

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 * 8 // A week and a day

const createCache = (context) =>
  create(
    {
      namespace: 'republik',
      prefix: 'MembershipStats:names',
      key: 'any',
      ttl: QUERY_CACHE_TTL_SECONDS,
    },
    context,
  )

const populate = async (context, resultFn) => {
  debug('populate')

  const { pgdb } = context

  const result = await pgdb.query(`
    SELECT
      u."firstName" AS key,
      g.gender AS gender,
      count(distinct u.id) AS count
    FROM users u
    JOIN
      memberships m
      ON m."userId" = u.id
    JOIN "statisticsNameGender" g
      ON u."firstName" = g."firstName"
    WHERE m.active = true
    GROUP BY 1, 2
    ORDER BY 3 DESC
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
