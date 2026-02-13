const { BaseWorker } = require('@orbiting/backend-modules-job-queue')
const { notifyPublish } = require('../Notifications')

class PublicationNotificationWorker extends BaseWorker {
  constructor(pgBoss, logger, context) {
    super(pgBoss, logger, context)
    this.queue = 'scheduler:publication:notify'
    this.options = { retryLimit: 0 }
  }

  async perform([job]) {
    const { repoId, notifyFilters } = job.data
    await notifyPublish(repoId, notifyFilters, this.context)
  }
}

module.exports = {
  PublicationNotificationWorker,
}
