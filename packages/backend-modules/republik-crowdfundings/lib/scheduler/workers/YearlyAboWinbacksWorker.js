const { BaseWorker } = require('@orbiting/backend-modules-job-queue')
const { run: yearlyAboWinbacksHandler } = require('../yearlyAboWinbacks')

class YearlyAboWinbacksWorker extends BaseWorker {
  constructor(pgBoss, logger, context) {
    super(pgBoss, logger, context)
    this.queue = 'scheduler:yearly-abo-winbacks'
    this.queueOptions = {
      policy: 'stately',
      expireInMinutes: 30,
    }
    this.options = { retryLimit: 0 }
  }

  async perform() {
    await yearlyAboWinbacksHandler({ now: new Date() }, this.context)
  }
}

module.exports = { YearlyAboWinbacksWorker }
