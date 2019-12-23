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

  // Paginate through keys and apply async mapFn(key, client)
  client.scanMap = async ({ pattern, mapFn }) => {
    if (!pattern) {
      throw new Error('argument pattern missing')
    }

    if (!mapFn) {
      throw new Error('argument mapFn missing')
    }

    let nextCursor = '0'

    do {
      debug('scanMap iteration: %o', { cursor: nextCursor, pattern })
      const [cursor = '0', keys] = await client.scanAsync([nextCursor, 'MATCH', pattern])
      nextCursor = cursor
      await Promise.map(keys, key => mapFn(key, client))
    } while (nextCursor !== '0') // nextCursor is "0" if scan is completed.

    debug('scanMap reached full iteration')
    return true
  }

  return client
}

const disconnect = client =>
  client.quit()

module.exports = {
  connect,
  disconnect
}
