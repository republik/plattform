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

    console.log(`[${this.queue}] start`)

    const webhookService = new WebhookService(this.context.pgdb)
    const mailService = new MailNotificationService(this.context.pgdb)

    const wh =
      await webhookService.getEvent<Stripe.CustomerSubscriptionDeletedEvent>(
        job.data.eventSourceId,
      )

    if (!wh) {
      console.error('Webhook does not exist')
      return await this.pgBoss.fail(this.queue, job.id)
    }

    if (wh.payload.type !== 'customer.subscription.deleted') {
      console.error('Webhook is not of type customer.subscription.deleted')
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
      console.error(`[${this.queue}] error`)
      console.error(e)
      throw e
    }

    console.log(`[${this.queue}] done`)
  }
}
