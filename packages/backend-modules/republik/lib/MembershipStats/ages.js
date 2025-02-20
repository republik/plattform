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

  const result = await pgdb.query(`
    SELECT
      extract(year from now()) - u.birthyear "key",
      COUNT(DISTINCT u.id) "count"
    FROM users u
    JOIN
      memberships m
      ON m."userId" = u.id
    WHERE m.active = true
    GROUP BY 1
    ORDER BY 1
  `)

  const ageDeclarations = result.filter((row) => row.key !== null)
  const totalAgesSum = ageDeclarations.reduce((acc, age) => {
    return acc + age.key * age.count
  }, 0)
  const numberAgeDeclarations = ageDeclarations.reduce((acc, cur) => {
    return acc + cur.count
  }, 0)

  if (resultFn) {
    return resultFn({
      averageAge: totalAgesSum / numberAgeDeclarations,
      result,
    })
  }

  // Cache said data.
  await createCache(context).set({
    averageAge: totalAgesSum / numberAgeDeclarations,
    result,
    updatedAt: new Date(),
  })
}

module.exports = {
  createCache,
  populate,
}
