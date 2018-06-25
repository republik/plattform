const redis = require('redis')
const bluebird = require('bluebird')
const { REDIS_URL } = process.env

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

const client = redis.createClient(REDIS_URL)

client.__defaultExpire = 3 * 7 * 24 * 60 * 60 // 3 weeks
client.__shortExpire = 3 * 24 * 60 * 60 // 3 days

module.exports = client
