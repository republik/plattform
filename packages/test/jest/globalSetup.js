const { cleanup } = require('../Sandbox/pool')

module.exports = async () => {
  console.log('globalTeardown')
  return cleanup(global.originalEnv.REDIS_URL)
}
