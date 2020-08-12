const debug = require('debug')('collections:lib:stats:last')
const Promise = require('bluebird')

const { cache: { create } } = require('@orbiting/backend-modules-utils')

const interval = '30 days'

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

const createCache = (context) => create(
  {
    namespace: 'collections',
    prefix: 'stats:last',
    key: 'any',
    ttl: QUERY_CACHE_TTL_SECONDS,
  },
  context
)

const populate = async (context, dry) => {
  debug('populate')

  const { pgdb } = context

  const result = await pgdb.query(query, { interval })

  if (!dry) {
    await createCache(context).set({
      result,
      updatedAt: new Date(),
      key: 'collections:stats:last'
    })
  }

  return result
}

module.exports = {
  createCache,
  populate
}
