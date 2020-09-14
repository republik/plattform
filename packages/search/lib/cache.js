const crypto = require('crypto')
const debug = require('debug')
const { getIndexAlias } = require('./utils')
const snappy = require('snappy')

const {
  SEARCH_CACHE_QUERY = false,
  SEARCH_CACHE_DISABLE = false,
  SEARCH_CACHE_COMPRESSION = false,
} = process.env

const keyPrefix = `search:cache:${
  SEARCH_CACHE_COMPRESSION ? 'compressed:' : 'uncompressed'
}`

const getRedisKey = (query) => `${keyPrefix}${hashQuery(query)}`

const hashQuery = (query) =>
  crypto.createHash('sha1').update(JSON.stringify(query)).digest('hex')

const createGet = (redis) => async (query) => {
  if (SEARCH_CACHE_DISABLE) {
    return
  }

  const redisKey = getRedisKey(query)
  let payload = await redis.getAsync(
    SEARCH_CACHE_COMPRESSION ? Buffer.from(redisKey) : redisKey,
  )

  debug('search:cache:get')(`${payload ? 'HIT' : 'MISS'} %O`, query)

  if (payload) {
    try {
      if (SEARCH_CACHE_COMPRESSION) {
        payload = snappy.uncompressSync(payload)
      }
      return JSON.parse(payload).data
    } catch (e) {
      console.warn('Error while loading from search cache, removing key!', e, {
        redisKey,
        query,
      })
      await redis.delAsync(redisKey)
    }
  }
}

const createSet = (redis) => async (query, data, options = {}) => {
  if (SEARCH_CACHE_DISABLE) {
    return
  }
  if (isEligible(query, options)) {
    let payload
    try {
      payload = JSON.stringify({
        data,
        ...(SEARCH_CACHE_QUERY ? { query } : {}),
      })
      if (SEARCH_CACHE_COMPRESSION) {
        payload = snappy.compressSync(payload)
      }
    } catch (e) {
      console.warn(e, query)
    }
    if (payload) {
      debug('search:cache:set')('PUT %O', query)
      return redis.setAsync(
        // we don't expire the key because:
        // - we flush the cache on publish which happens often (daily)
        // - we run eviction policy: volatile-lru, let it take care of overspill
        // - the data doesn't expire, old is valid, no need for redis to check
        // - we don't need to keep the cache small and want to cache aggressively
        getRedisKey(query),
        payload,
      )
    }
  }
  debug('search:cache:set')('SKIP %O', query)
}

const createInvalidate = (redis) => async () => {
  debug('search:cache')('INVALIDATE')
  await redis
    .scanMap({
      pattern: `${keyPrefix}*`,
      mapFn: (key, client) => client.delAsync(key),
    })
    .catch(() => {}) // fails if no keys are matched
}

const isEligible = (query, options) => {
  if (
    !options.scheduledAt &&
    query?.index?.length === 1 &&
    query.index[0] === getIndexAlias('document', 'read')
  ) {
    return true
  }
  return false
}

module.exports = (redis) => ({
  get: createGet(redis),
  set: createSet(redis),
  invalidate: createInvalidate(redis),
})
