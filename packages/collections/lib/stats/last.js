const debug = require('debug')('collections:lib:stats:last')
const Promise = require('bluebird')

const {
  cache: { create },
} = require('@orbiting/backend-modules-utils')

const interval = '30 days'

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 // A day

const buildQuery = (last) => `
WITH "documentsMedias" AS (
  SELECT
    ${last ? '' : 'to_char(cdi."createdAt", \'YYYY-MM\') "key",'}
    cdi."collectionId",
    cdi."repoId" "id",
    cdi."userId",
    'document' "type"

  FROM "collectionDocumentItems" cdi
  ${last ? 'WHERE cdi."createdAt" >= now() - :interval::interval' : ''}

  /* UNION

  SELECT
    to_char(cmi."createdAt", 'YYYY-MM') "key",
    cmi."collectionId",
    cmi."mediaId" "id",
    cmi."userId",
    'media' "type"

  FROM "collectionMediaItems" cmi
  WHERE cdi."createdAt" >= now() - xxx */
)

SELECT
  ${last ? '' : 'dm.key,'}
  dm."collectionId",
  COUNT(*) "records",
  COUNT(DISTINCT dm.id) FILTER (WHERE dm.type = 'document') "documents",
  COUNT(DISTINCT dm.id) FILTER (WHERE dm.type = 'media') "medias",
  COUNT(DISTINCT dm."userId") "users"

FROM "documentsMedias" dm
${last ? 'GROUP BY 1' : 'GROUP BY 1, 2'}
`

const createCache = (context) =>
  create(
    {
      namespace: 'collections',
      prefix: 'stats:last',
      key: 'any',
      ttl: QUERY_CACHE_TTL_SECONDS,
    },
    context,
  )

const populate = async (context, dry) => {
  debug('populate')

  const { pgdb } = context

  const result = await pgdb.query(buildQuery(true), { interval })

  if (!dry) {
    await createCache(context).set({
      result,
      updatedAt: new Date(),
      key: 'collections:stats:last',
    })
  }

  return result
}

module.exports = {
  buildQuery,
  createCache,
  populate,
}
