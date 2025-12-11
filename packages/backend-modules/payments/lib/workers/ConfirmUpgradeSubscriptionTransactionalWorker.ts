import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import Stripe from 'stripe'
import { WebhookService } from '../services/WebhookService'
import { UpgradeActivatedEmail } from '../email-notifiers/UpgradeActivatedEmail'
import { PaymentService } from '../services/PaymentService'
import { Company } from '../types'
import { SubscriptionUpgradeRepo } from '../database/SubscriptionUpgradeRepo'
import { UserDataRepo } from '../database/UserRepo'

type Args = {
  $version: 'v1'
  userId: string
  company: Company
  subscriptionId: string
  upgradeId: string
  eventSourceId: string
}

export class ConfirmUpgradeSubscriptionTransactionalWorker extends BaseWorker<Args> {
  readonly queue = 'payments:transactional:confirm:upgrade:subscription'
  readonly options: SendOptions = {
    retryLimit: 3,
    retryDelay: 120, // retry every 2 minutes
  }

  async perform([job]: Job<Args>[]): Promise<void> {
    if (job.data.$version !== 'v1') {
      throw Error('unable to perform this job version. Expected v1')
    }

    this.logger.debug({ queue: this.queue, jobiId: job.id }, 'start')

    const webhookService = new WebhookService(this.context.pgdb)
    const upgrade = (await new SubscriptionUpgradeRepo(
      this.context.pgdb,
    ).getSubscriptionUpgrade(job.data.upgradeId))!

    const mail = new UpgradeActivatedEmail(
      this.context.pgdb,
      new PaymentService(),
    )
    const user = await new UserDataRepo(this.context.pgdb).findUserById(
      job.data.userId,
    )
    if (!user) {
      this.logger.error(
        { queue: this.queue, jobId: job.id, userId: job.data.userId },
        'user does not exist',
      )
      return await this.pgBoss.fail(this.queue, job.id)
    }

    const wh =
      await webhookService.getEvent<Stripe.CustomerSubscriptionCreatedEvent>(
        job.data.eventSourceId,
      )

    if (!wh) {
      this.logger.error(
        { queue: this.queue, jobId: job.id },
        'Webhook does not exist',
      )
      return await this.pgBoss.fail(this.queue, job.id)
    }

    if (wh.payload.type !== 'customer.subscription.created') {
      this.logger.error(
        { queue: this.queue, jobId: job.id },
        'Webhook is not of type customer.subscription.created',
      )
      return await this.pgBoss.fail(this.queue, job.id)
    }

    try {
      // send transactional
      await mail.sendEmail(user.email, {
        company: job.data.company,
        subscriptionId: job.data.subscriptionId,
        upgrade,
      })
    } catch (e) {
      this.logger.error(
        { queue: this.queue, jobId: job.id, error: e },
        'processing error',
      )
      throw e
    }

    this.logger.debug({ queue: this.queue, jobiId: job.id }, 'done')
  }
}
