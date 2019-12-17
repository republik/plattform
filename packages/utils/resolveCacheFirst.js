const originDebug = require('debug')('utils:resolveCacheFirst')
const Promise = require('bluebird')

/**
 * This helper executes a function, store its result into cache and
 * returns results [1]. It also check if cached data is available [2]
 * and returns that.
 *
 * Helper returns result from whichever is done first ([1] or [2]) and
 * won't break the execution of the other.
 *
 */
module.exports = async (fn, options, context) => {
  const { redis } = context
  const { namespace = 'cache:', key, ttl = 60 * 60, cacheOnly = false, disabled = false } = options

  const qualifiedKey = `${namespace}:${key}`
  const debug = originDebug.extend(key)

  const cacheFn = async result => {
    if (!disabled) {
      debug('cache fn result')
      const value = JSON.stringify(result)
      await redis.setAsync(qualifiedKey, value, 'EX', ttl)
    }

    debug('return fn result')
    return result
  }

  const getCache = async () => {
    debug('await cache')
    try {
      if (await redis.existsAsync(qualifiedKey)) {
        debug('get cache data')
        const value = await redis.getAsync(qualifiedKey)
        const result = JSON.parse(value)

        debug('return cache data')
        return result
      } else {
        throw new Error(`no cached data on "${qualifiedKey}" found`)
      }
    } catch (e) {
      debug('reject cache, due to %s', e.toString())
      throw e
    }
  }

  if (cacheOnly) {
    const result = await getCache()

    debug('result: %o', result)

    return result
  }

  const result = await Promise.any([
    fn().then(cacheFn),
    getCache()
  ])

  debug('result: %o', result)

  // Return which one is fullfilled faster
  return result
}
