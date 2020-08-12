const debug = require('debug')('collections:lib:stats:evolution')

const { cache: { create } } = require('@orbiting/backend-modules-utils')
const { buildQuery } = require('./last')

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 // A day

const createCache = (context) => create(
  {
    namespace: 'collections',
    prefix: 'stats:evolution',
    key: 'any',
    ttl: QUERY_CACHE_TTL_SECONDS
  },
  context
)

const populate = async (context, dry) => {
  debug('populate')

  const { pgdb } = context

  // Generate date for range
  const result = await pgdb.query(buildQuery(false))

  if (!dry) {
    // Cache said data.
    await createCache(context).set({ result, updatedAt: new Date() })
  }

  return result
}

module.exports = {
  createCache,
  populate
}
