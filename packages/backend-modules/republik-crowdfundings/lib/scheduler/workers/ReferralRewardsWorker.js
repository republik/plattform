const { BaseWorker } = require('@orbiting/backend-modules-job-queue')
const {
  rewardReferrers,
} = require('@orbiting/backend-modules-referral-campaigns')

class ReferralRewardsWorker extends BaseWorker {
  constructor(pgBoss, logger, context) {
    super(pgBoss, logger, context)
    this.queue = 'scheduler:referral-rewards'
    this.queueOptions = {
      policy: 'stately',
      expireInMinutes: 60,
    }
    this.options = { retryLimit: 0 }
  }

  async perform() {
    const { pgdb } = this.context
    await rewardReferrers({ dryRun: false }, pgdb)
  }
}

module.exports = { ReferralRewardsWorker }
