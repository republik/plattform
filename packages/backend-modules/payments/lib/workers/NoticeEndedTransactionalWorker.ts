import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import Stripe from 'stripe'
import { WebhookService } from '../services/WebhookService'
import { MailNotificationService } from '../services/MailNotificationService'

type Args = {
  $version: 'v1'
  userId: string
  eventSourceId: string
}

export class NoticeEndedTransactionalWorker extends BaseWorker<Args> {
  readonly queue = 'payments:transactional:notice:ended'
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
    const mailService = new MailNotificationService(this.context.pgdb)

    const wh =
      await webhookService.getEvent<Stripe.CustomerSubscriptionDeletedEvent>(
        job.data.eventSourceId,
      )

    if (!wh) {
      this.logger.error(
        { queue: this.queue, jobId: job.id },
        'Webhook does not exist',
      )
      return await this.pgBoss.fail(this.queue, job.id)
    }

    if (wh.payload.type !== 'customer.subscription.deleted') {
      this.logger.error(
        { queue: this.queue, jobId: job.id },
        'Webhook is not of type customer.subscription.deleted',
      )
      return await this.pgBoss.fail(this.queue, job.id)
    }

    const event = wh.payload

    try {
      // send transactional
      await mailService.sendSubscriptionEndedNoticeTransactionalMail({
        subscriptionExternalId: event.data.object.id,
        userId: job.data.userId,
        cancellationReason: event.data.object.cancellation_details?.reason as
          | string
          | undefined,
      })
    } catch (e) {
      this.logger.error(
        { queue: this.queue, jobId: job.id, error: e },
        'Error sending notice subscription ended transactional mail',
      )
      throw e
    }

    this.logger.debug({ queue: this.queue, jobiId: job.id }, 'done')
  }
}
