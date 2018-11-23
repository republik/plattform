const debug = require('debug')('base:lib:redis')
const redis = require('redis')
const bluebird = require('bluebird')
const { REDIS_URL } = process.env

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

debug('creating client', { REDIS_URL })
const client = redis.createClient(REDIS_URL)

client.__defaultExpireSeconds = 3 * 7 * 24 * 60 * 60 // 3 weeks
client.__shortExpireSeconds = 3 * 24 * 60 * 60 // 3 days

module.exports = client
