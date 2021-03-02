const debug = require('debug')('republik:lib:MembershipStats:geoCities')
const moment = require('moment')
const { getYears } = require('../trendYears')

const {
  cache: { create },
} = require('@orbiting/backend-modules-utils')

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 * 8 // A week and a day

const createCache = (context) =>
  create(
    {
      namespace: 'republik',
      prefix: 'MembershipStats:geoCities',
      key: 'any',
      ttl: QUERY_CACHE_TTL_SECONDS,
    },
    context,
  )

const populate = async (context, resultFn) => {
  debug('populate')

  const { pgdb } = context
  const years = await getYears(pgdb)

  const memberships = await pgdb.query(`
    SELECT
      m.id,
      MIN(mp."beginDate") "minBeginDate",
      MAX(mp."endDate") "maxEndDate",
      a.city,
      a.country
    FROM "memberships" m
    JOIN "membershipPeriods" mp
      ON mp."membershipId" = m.id
    JOIN "users" u
      ON u.id = m."userId"
    LEFT JOIN "addresses" a
      ON a.id = u."addressId"
    WHERE m."userId" != 'f0512927-7e03-4ecc-b14f-601386a2a249' -- Jefferson
    AND a.city IS NOT NULL AND a.city != ' ' AND a.city != '.' AND a.city != '-'
    GROUP BY m.id, a.id
  `)

  const countries = await pgdb.public.statisticsGeoCountry.findAll()

  const cities = {}

  for (const membership of memberships) {
    const country = countries.find((country) => {
      return (
        country.name === membership.country ||
        country.searchNames.indexOf(membership.country?.toLowerCase()) > -1
      )
    })

    let key = membership.city?.toLowerCase().trim()
    if (!['zürich', 'bern', 'basel', 'winterthur', 'luzern'].includes(key)) {
      key =
        country && country.name === 'Schweiz'
          ? 'otherCHAddress'
          : 'otherAddress'
    }
    if (!cities[key]) {
      const buckets = {}

      years.forEach((year) => {
        buckets[year] = { count: 0 }
      })

      Object.assign(cities, {
        [key]: {
          buckets,
        },
      })
    }
    years.forEach((year) => {
      const yearBegin = moment(year)
      const yearEnd = yearBegin.clone().add(1, 'year')

      if (
        membership.minBeginDate < yearEnd &&
        membership.maxEndDate > yearBegin
      ) {
        cities[key].buckets[year].count++
      }
    })
  }

  const result = Object.keys(cities).map((key) => {
    const { buckets } = cities[key]

    return {
      city: key,
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
