import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import { Payments } from '../payments'
import Stripe from 'stripe'

type Args = {
  $version: 'v1'
  eventSourceId: string
  userId: string
}

export class SyncMailchimpCancelWorker extends BaseWorker<Args> {
  readonly queue = 'payments:mailchimp:sync:cancel'
  readonly options: SendOptions = {
    retryLimit: 3,
    retryDelay: 120, // retry every 2 minutes
  }

  async perform([job]: Job<Args>[]): Promise<void> {
    if (job.data.$version !== 'v1') {
      throw Error('unable to perform this job version. Expected v1')
    }

    console.log(`[${this.queue}] start with ${JSON.stringify(job.data)}`)

    const PaymentService = Payments.getInstance()

    const wh =
      await PaymentService.findWebhookEventBySourceId<Stripe.CustomerSubscriptionUpdatedEvent>(
        job.data.eventSourceId,
      )

    if (!wh) {
      console.error('Webhook does not exist')
      return await this.pgBoss.fail(this.queue, job.id)
    }

    if (wh.payload.type !== 'customer.subscription.updated') {
      console.error('Webhook is not of type customer.subscription.updated')
      return await this.pgBoss.fail(this.queue, job.id)
    }

    await PaymentService.syncMailchimpCancelSubscription({ userId: job.data.userId })

    console.log(`[${this.queue}] done`)
  }
}
