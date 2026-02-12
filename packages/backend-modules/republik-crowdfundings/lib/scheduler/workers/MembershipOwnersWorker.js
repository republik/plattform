const { BaseWorker } = require('@orbiting/backend-modules-job-queue')
const { run: membershipsOwnersHandler } = require('../owners')

class MembershipOwnersWorker extends BaseWorker {
  constructor(pgBoss, logger, context) {
    super(pgBoss, logger, context)
    this.queue = 'scheduler:memberships-owners'
    this.queueOptions = {
      policy: 'stately',
      expireInMinutes: 30,
    }
    this.options = { retryLimit: 0 }
  }

  async perform() {
    await membershipsOwnersHandler({ dryRun: false }, this.context)
  }
}

module.exports = { MembershipOwnersWorker }
