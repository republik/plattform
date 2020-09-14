const moment = require('moment')

const createCache = require('@orbiting/backend-modules-republik-crowdfundings/lib/cache')
const QUERY_CACHE_TTL_SECONDS = 60 * 5 // 5 min

const getCount = (min, max, pgdb) => () =>
  pgdb.queryOneField(
    `
  SELECT
    count(*)
  FROM
    memberships m
  WHERE
    m."createdAt" BETWEEN :min AND :max
`,
    {
      min,
      max,
    },
  )

module.exports = (_, args, context) => {
  const { pgdb } = context

  const min = moment(args.min)
  const max = moment(args.max)

  const dateFormat = 'YYYY-MM-DD'
  const queryId = `${min.format(dateFormat)}-${max.format(dateFormat)}`

  return createCache(
    {
      prefix: 'MembershipStats:countRange',
      key: queryId,
      ttl: QUERY_CACHE_TTL_SECONDS,
      forceRecache: args.forceRecache,
    },
    context,
  ).cache(getCount(min, max, pgdb))
}
