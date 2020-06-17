const debug = require('debug')('base:lib:redis')
const redis = require('redis')
const Promise = require('bluebird')

Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

const getConnectionOptions = () => {
  const {
    REDIS_URL = 'redis://127.0.0.1:6379'
  } = process.env


  const url = new URL(REDIS_URL)
  const isHerokuRedis = url.hostname.indexOf('amazonaws.com') > -1

  const incrementPort = url.password && isHerokuRedis
  if (incrementPort) {
    console.info("REDIS_URL looks like it's from heroku, automatically incrementing the port by 1")
  }

  const connectionOptions = {
    // heroku provides TLS on port + 1
    // https://devcenter.heroku.com/articles/securing-heroku-redis
    port: incrementPort ? Number(url.port)+1 : Number(url.port),
    host: url.hostname,
    db: url.path?.split('/')[1] || 0,
    ...url.password ? {
      username: url.username,
      password: url.password,
      tls: {
        rejectUnauthorized: false,
        requestCert: true,
      },
    } : {},
    detect_buffers: true
  }
  debug('redis connectionOptions', connectionOptions, { REDIS_URL, isHerokuRedis })
  return connectionOptions
}

const connect = () => {
  const client = redis.createClient(getConnectionOptions())

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
  getConnectionOptions,
  connect,
  disconnect,
}
