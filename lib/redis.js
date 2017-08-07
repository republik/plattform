const redis = require('redis')
const bluebird = require('bluebird')
const {REDIS_URL} = process.env

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

module.exports = redis.createClient(REDIS_URL)
