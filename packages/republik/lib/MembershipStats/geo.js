const debug = require('debug')('republik:lib:MembershipStats:geo')
const moment = require('moment')

const {
  cache: { create },
} = require('@orbiting/backend-modules-utils')

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 * 8 // A week and a day

const createCache = (context) =>
  create(
    {
      namespace: 'republik',
      prefix: 'MembershipStats:geo',
      key: 'any',
      ttl: QUERY_CACHE_TTL_SECONDS,
    },
    context,
  )

const populate = async (context, resultFn) => {
  debug('populate')

  const { pgdb } = context

  const memberships = await pgdb.query(`
    SELECT
      m.id,
      MIN(mp."beginDate") "minBeginDate",
      MAX(mp."endDate") "maxEndDate",
      a."country",
      a."postalCode"
    FROM "memberships" m
    JOIN "membershipPeriods" mp
      ON mp."membershipId" = m.id
    JOIN "users" u
      ON u.id = m."userId"
    LEFT JOIN "addresses" a
      ON a.id = u."addressId"
    WHERE m."userId" != 'f0512927-7e03-4ecc-b14f-601386a2a249' -- Jefferson
    GROUP BY m.id, a.id
  `)

  const geo = {}

  /* TODO: normalize countries and postalCodes, add lat/lon */

  memberships.forEach((membership) => {
    const key = `${membership.country}${membership.postalCode}`

    if (!geo[key]) {
      const buckets = {
        2018: { count: 0 },
        2019: { count: 0 },
        2020: { count: 0 },
        2021: { count: 0 },
      }

      Object.assign(geo, {
        [key]: {
          country: membership.country,
          postalCode: membership.postalCode,
          buckets,
        },
      })
    }

    ;['2018', '2019', '2020', '2021'].forEach((year) => {
      const yearBegin = moment(year)
      const yearEnd = yearBegin.clone().add(1, 'year')

      if (
        membership.minBeginDate < yearEnd &&
        membership.maxEndDate > yearBegin
      ) {
        geo[key].buckets[year].count++
      }
    })
  })

  const result = Object.keys(geo).map((key) => {
    const { buckets, ...restGeo } = geo[key]

    return {
      ...restGeo,
      buckets: Object.keys(buckets).map((bucketKey) => {
        const bucket = buckets[bucketKey]

        return { ...bucket, key: bucketKey }
      }),
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
