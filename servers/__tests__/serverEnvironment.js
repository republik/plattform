const NodeEnvironment = require('jest-environment-node')

class ServerEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config)
  }

  async setup() {
    await super.setup()
  }

  async teardown() {
    await super.teardown()
  }

  runScript(script) {
    console.log('runScript', script)
    return super.runScript(script)
  }
}

module.exports = ServerEnvironment
