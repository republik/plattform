const debug = require('debug')('base:lib:redis')
const redis = require('redis')
const Promise = require('bluebird')

Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

const connect = () => {
  const url = process.env.REDIS_URL

  debug('connecting client', { url })
  const client = redis.createClient(url)

  client.__defaultExpireSeconds = 3 * 7 * 24 * 60 * 60 // 3 weeks
  client.__shortExpireSeconds = 3 * 24 * 60 * 60 // 3 days

  // Paginate through keys and apply async mapFn(client, key)
  client.scanMap = async ({
    pattern = '*',
    mapFn = () => {},
    cursor = 0,
    results = []
  }) => {
    debug('scanMap iteration: %o', { cursor, pattern })
    const [nextCursor, keys] = await client.scanAsync([cursor, 'MATCH', pattern])

    debug('scanMap, scanned page: %o', { cursor, pattern, nextCursor: nextCursor !== '0', keys: keys.length })

    const pageResults = await Promise.map(keys, mapFn.bind(this, client))

    results = [...results, ...pageResults]

    // nextCursor is "0" if scan is completed.
    if (!!nextCursor && nextCursor !== '0') {
      return client.scanMap({ pattern, mapFn, cursor: nextCursor, results })
    }

    debug('scanMap reached full iteration: %o', { results: results && results.length })
    return results
  }

  return client
}

const disconnect = client =>
  client.quit()

module.exports = {
  connect,
  disconnect
}
