const Elasticsearch = require('./Elasticsearch')
const PgDb = require('./PgDb')
const Redis = require('./Redis')
const RedisPubSub = require('./RedisPubSub')

const Promise = require('bluebird')

const create = async (applicationName) => ({
  pgdb: await PgDb.connect({ applicationName }),
  redis: Redis.connect(),
  pubsub: RedisPubSub.connect(),
  elastic: Elasticsearch.connect()
})

const close = ({ pgdb, redis, pubsub, elastic }) => Promise.all([
  PgDb.disconnect(pgdb),
  Redis.disconnect(redis),
  RedisPubSub.disconnect(pubsub),
  Elasticsearch.disconnect(elastic)
])
  .catch(e => console.warn('error in connection close:', e))

module.exports = {
  create,
  close
}
