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
    mapFn = () => {}
  }) => {
    let nextCursor = 0

    do {
      debug('scanMap iteration: %o', { cursor: nextCursor, pattern })

      await client.scanAsync([nextCursor, 'MATCH', pattern])
        .then(async ([cursor, keys]) => {
          nextCursor = cursor

          return Promise.map(keys, mapFn.bind(null, client))
        })
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
