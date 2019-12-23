const crypto = require('crypto')
const debug = require('debug')
const { getIndexAlias } = require('./utils')

const keyPrefix = 'search:cache:'

const getRedisKey = (query) =>
  `${keyPrefix}${hashQuery(query)}`

const hashQuery = (query) =>
  crypto
    .createHash('sha1')
    .update(JSON.stringify(query))
    .digest('hex')

const createGet = (redis) => async (query) => {
  const redisKey = getRedisKey(query)
  const payload = await redis.getAsync(redisKey)
  redis.expireAsync(redisKey, redis.__shortExpireSeconds)
  debug('search:cache:get')(`${payload ? 'HIT' : 'MISS'} %O`, query)
  return payload
    ? JSON.parse(payload)
    : payload
}

const isEligible = (query, options) => {
  if (
    !options.scheduledAt &&
    query.index &&
    query.index.length === 1 &&
    query.index[0] === getIndexAlias('document', 'read')
  ) {
    return true
  }
  return false
}

const createSet = (redis) => async (query, payload, options = {}) => {
  if (isEligible(query, options)) {
    let payloadString
    try {
      payloadString = JSON.stringify(payload)
    } catch (e) {
      console.info(e, query)
    }
    if (payloadString) {
      debug('search:cache:set')('PUT %O', query)
      return redis.setAsync(
        getRedisKey(query),
        payloadString,
        'EX', redis.__shortExpireSeconds
      )
    }
  }
  debug('search:cache:set')('SKIP %O', query)
}

const createInvalidate = (redis) => async () => {
  debug('search:cache')('INVALIDATE')
  await redis.scanMap({
    pattern: `${keyPrefix}*`,
    mapFn: (key, client) => client.delAsync(key)
  })
    .catch(() => {})// fails if no keys are matched
}

module.exports = (redis) => ({
  get: createGet(redis),
  set: createSet(redis),
  invalidate: createInvalidate(redis)
})
