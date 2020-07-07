const debug = require('debug')('collections:lib:stats:last')
const Promise = require('bluebird')

const { cache: { create } } = require('@orbiting/backend-modules-utils')

const LAST_INTERVALS = [
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
WITH "documentsMedias" AS (
  SELECT
    cdi."collectionId",
    cdi."repoId" "id",
    cdi."userId",
    'document' "type"

  FROM "collectionDocumentItems" cdi
  WHERE cdi."createdAt" >= now() - :interval::interval

  /* UNION

  SELECT 
    cmi."collectionId",
    cmi."mediaId" "id",
    cmi."userId",
    'media' "type"

  FROM "collectionMediaItems" cmi
  WHERE cdi."createdAt" >= now() - xxx */
)

SELECT
  dm."collectionId",
  COUNT(*) "records",
  COUNT(DISTINCT dm.id) FILTER (WHERE dm.type = 'document') "documents",
  COUNT(DISTINCT dm.id) FILTER (WHERE dm.type = 'media') "medias",
  COUNT(DISTINCT dm."userId") "users"

FROM "documentsMedias" dm
GROUP BY 1
`

const createCache = (options, context) => create(
  {
    namespace: 'collections',
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
    LAST_INTERVALS,
    async ({ key, interval }) => ({
      key,
      result: await pgdb.query(query, { interval })
    })
  )

  if (resultFn) {
    resultFn(results)
    return
  }

  await Promise.each(
    results,
    ({ key, result }) => createCache({ key }, context).set({ result, updatedAt: new Date() })
  )
}

module.exports = {
  LAST_INTERVALS,
  createCache,
  populate
}
