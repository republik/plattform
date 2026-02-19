const { BaseWorker } = require('@orbiting/backend-modules-job-queue')
const { inform: informUpgrade } = require('../upgrade')

class UpgradeWorker extends BaseWorker {
  constructor(pgBoss, logger, context) {
    super(pgBoss, logger, context)
    this.queue = 'scheduler:upgrade'
    this.queueOptions = {
      policy: 'stately',
      expireInMinutes: 30,
    }
    this.options = { retryLimit: 0 }
  }

  async perform() {
    await informUpgrade({}, this.context)
  }
}

module.exports = { UpgradeWorker }
