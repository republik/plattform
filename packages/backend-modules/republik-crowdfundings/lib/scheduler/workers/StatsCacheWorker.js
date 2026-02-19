const { BaseWorker } = require('@orbiting/backend-modules-job-queue')
const surplus = require('@orbiting/backend-modules-republik/graphql/resolvers/RevenueStats/surplus')

class StatsCacheWorker extends BaseWorker {
  constructor(pgBoss, logger, context) {
    super(pgBoss, logger, context)
    this.queue = 'scheduler:stats-cache'
    this.queueOptions = {
      policy: 'stately',
      expireInMinutes: 30,
    }
    this.options = { retryLimit: 0 }
  }

  async perform() {
    await surplus(null, { min: '2019-12-01', forceRecache: true }, this.context)
  }
}

module.exports = { StatsCacheWorker }
