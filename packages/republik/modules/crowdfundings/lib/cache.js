const debug = require('debug')

const namespace = 'crowdfundings:cache'

const getRedisKey = ({ prefix, key }) =>
  `${namespace}:${prefix}:${key}`

const createGet = ({ options, redis }) => async function () {
  const key = getRedisKey(options)
  const payload = await redis.getAsync(key)
  debug('crowdfundings:cache:get')(
    `${payload ? 'HIT' : 'MISS'} %s`,
    key
  )

  return payload
    ? JSON.parse(payload)
    : payload
}

const createSet = ({ options, redis }) => async function (payload) {
  let payloadString

  try {
    payloadString = JSON.stringify(payload)
  } catch (e) {
    console.info(e, options.key)
  }

  if (payloadString) {
    const key = getRedisKey(options)
    debug('crowdfundings:cache:set')('PUT %s', key)
    return redis.setAsync(
      key,
      payloadString,
      'EX', options.ttl || 60
    )
  }
}

const createCache = ({ options }) => async function (payloadFunction) {
  debug('crowdfundings:cache')('cache')

  if (typeof payloadFunction !== 'function') {
    throw Error('cache expects function to evaluate payload')
  }

  if (options.disabled) {
    return payloadFunction()
  }

  let data
  if (!options.forceRecache) {
    data = await this.get()

    if (data) {
      return data.payload
    }
  }

  data = { payload: await payloadFunction() }

  await this.set(data)

  return data.payload
}

const createInvalidate = ({ options, redis }) => async function () {
  debug('crowdfundings:cache')('INVALIDATE')
  await redis.scanMap({
    pattern: `${namespace}:${options.prefix}*`,
    mapFn: (key, client) => client.delAsync(key)
  })
    .catch(() => {})// fails if no keys are matched
}

module.exports = (options, { redis }) => {
  if (options.disabled) {
    console.warn(`WARNING: Cache DISABLED for "${namespace}:${options.prefix}"`)
  }

  return {
    get: createGet({ options, redis }),
    set: createSet({ options, redis }),
    cache: createCache({ options, redis }),
    invalidate: createInvalidate({ options, redis })
  }
}
