// https://jestjs.io/docs/en/configuration#globalsetup-string
// Note: Any global variables that are defined through globalSetup can only be read in globalTeardown. You cannot retrieve globals defined here in your test suites.

const { init } = require('../Sandbox/pool')

module.exports = () => {
  global.originalEnv = { ...process.env }
  return init(global.originalEnv.REDIS_URL)
}
