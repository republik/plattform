const Redis = require('@orbiting/backend-modules-base/lib/Redis')

const { maxConcurrency = 5 } = require('../../../jest.config.js')

const KEY = 'tests.instanceId'

// this will overflow at 2^63
const getId = async () => {
  const redis = Redis.connect()
  const id = ((await redis.incrAsync(KEY)) % (maxConcurrency * 2)) + 1
  Redis.disconnect(redis)
  return id
}

module.exports = {
  getId
}

if (process.argv[2] === 'cleanup') {
  Promise.resolve().then(async () => {
    const redis = Redis.connect()
    console.log(await redis.delAsync(KEY))
    Redis.disconnect(redis)
  })
}
