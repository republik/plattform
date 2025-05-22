import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import Stripe from 'stripe'
import { MailNotificationService } from '../services/MailNotificationService'
import { WebhookService } from '../services/WebhookService'

type Args = {
  $version: 'v1'
  userId: string
  eventSourceId: string
}

export class ConfirmGiftAppliedTransactionalWorker extends BaseWorker<Args> {
  readonly queue = 'payments:transactional:confirm:gift:applied'
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
      await webhookService.getEvent<Stripe.CustomerSubscriptionUpdatedEvent>(
        job.data.eventSourceId,
      )

    if (!wh) {
      console.error('Webhook dose not exist')
      return await this.pgBoss.fail(this.queue, job.id)
    }

    if (wh.payload.type !== 'customer.subscription.updated') {
      console.error('Webhook is not of type customer.subscription.updated')
      return await this.pgBoss.fail(this.queue, job.id)
    }

    const event = wh.payload

    try {
      // send transactional
      await mailService.sendGiftVoucherAppliedToExistingSubscriptionMail({
        subscriptionExternalId: event.data.object.id,
        userId: job.data.userId,
      })
    } catch (e) {
      console.error(`[${this.queue}] error`)
      console.error(e)
      throw e
    }

    console.log(`[${this.queue}] done`)
  }
}
