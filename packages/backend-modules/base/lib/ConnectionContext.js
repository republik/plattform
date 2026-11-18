const PgDb = require('./PgDb')
const Redis = require('./Redis')
const RedisPubSub = require('./RedisPubSub')
const { logger } = require('@orbiting/backend-modules-logger')

const Promise = require('bluebird')

const create = async (applicationName) => ({
  pgdb: await PgDb.connect({ applicationName }),
  redis: Redis.connect(),
  pubsub: RedisPubSub.connect(),
  logger: logger,
})

const close = ({ pgdb, redis, pubsub }) =>
  Promise.all([
    PgDb.disconnect(pgdb),
    Redis.disconnect(redis),
    RedisPubSub.disconnect(pubsub),
  ]).catch((e) => console.warn('error in connection close:', e))

module.exports = {
  create,
  close,
}
