const { BaseWorker } = require('@orbiting/backend-modules-job-queue')
const { changeover } = require('../changeover')
const { deactivate } = require('../deactivate')

class ChangeoverDeactivateWorker extends BaseWorker {
  constructor(pgBoss, logger, context) {
    super(pgBoss, logger, context)
    this.queue = 'scheduler:changeover-deactivate'
    this.queueOptions = {
      policy: 'stately',
      expireInMinutes: 30,
    }
    this.options = { retryLimit: 0 }
  }

  async perform() {
    await changeover({ dryRun: false }, this.context)
    await deactivate({ dryRun: false }, this.context)
  }
}

module.exports = { ChangeoverDeactivateWorker }
