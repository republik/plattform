import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import { Payments } from '../payments'
import Stripe from 'stripe'

type Args = {
  $version: 'v1'
  eventSourceId: string
  userId: string
}

export class SyncMailchimpSetupWorker extends BaseWorker<Args> {
  readonly queue = 'payments:mailchimp:sync:setup'
  readonly options: SendOptions = {
    retryLimit: 3,
    retryDelay: 120, // retry every 2 minutes
  }

  async perform([job]: Job<Args>[]): Promise<void> {
    if (job.data.$version !== 'v1') {
      throw Error('unable to perform this job version. Expected v1')
    }

    console.log(`[${this.queue}] start`)

    const PaymentService = Payments.getInstance()

    const wh =
      await PaymentService.findWebhookEventBySourceId<Stripe.CheckoutSessionCompletedEvent>(
        job.data.eventSourceId,
      )

    if (!wh) {
      console.error('Webhook does not exist')
      return await this.pgBoss.fail(this.queue, job.id)
    }

    if (wh.payload.type !== 'checkout.session.completed') {
      console.error('Webhook is not of type checkout.session.completed')
      return await this.pgBoss.fail(this.queue, job.id)
    }

    const event = wh.payload

    const invoice = await PaymentService.getInvoice({ externalId: event.data.object.invoice as string })
    const subscription = await PaymentService.getSubscription({ externalId: event.data.object.subscription as string })

    if (!invoice || !subscription) {
      console.error('Invoice or subscription could not be found in the database')
      return await this.pgBoss.fail(this.queue, job.id)
    }

    await PaymentService.syncMailchimpSetupSubscription({ userId: job.data.userId, subscriptionExternalId: event.data.object.subscription as string })

    console.log(`[${this.queue}] done`)
  }
}
