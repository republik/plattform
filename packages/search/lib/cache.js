const crypto = require('crypto')
const debug = require('debug')('search:cache')
const {
  getFilterObj
} = require('./filters')

const keyPrefix = 'search:cache:'

const getRedisKey = (query) =>
  `${keyPrefix}${hashQuery(query)}`

const hashQuery = (query) =>
  crypto
    .createHash('sha1')
    .update(JSON.stringify(query))
    .digest('hex')

const createGet = (redis) => async (query) => {
  const payload = await redis.getAsync(getRedisKey(query))
  debug(`${payload ? 'HIT' : 'MISS'} %O`, query)
  return payload
    ? JSON.parse(payload)
    : payload
}

const isElegitable = (options, filter) => {
  const filterObj = getFilterObj(filter)
  if (!options.search && (filterObj.path || filterObj.repoId)) {
    return true
  }
}

const createSet = (redis) => async (options, filter, query, payload) => {
  if (isElegitable(options, filter)) {
    let payloadString
    try {
      payloadString = JSON.stringify(payload)
    } catch (e) {
      console.info(e, query)
    }
    if (payloadString) {
      debug('PUT')// %o', query)
      return redis.setAsync(getRedisKey(query), payloadString)
    }
  }
  debug('SKIP')// %o', query)
}

const createInvalidate = (redis) => async () => {
  debug('INVALIDATE')
  await redis.evalAsync(`return redis.call('del', unpack(redis.call('keys', ARGV[1])))`, 0, `${keyPrefix}*`)
    .catch(() => {})// fails if no keys are matched
}

module.exports = (redis) => ({
  get: createGet(redis),
  set: createSet(redis),
  invalidate: createInvalidate(redis)
})
