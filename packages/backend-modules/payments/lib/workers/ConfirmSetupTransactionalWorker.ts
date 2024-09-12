import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import { Payments } from '../payments'
import Stripe from 'stripe'

type Args = {
  $version: 'v1'
  userId: string
  orderId: string
  eventSourceId: string
}

export class ConfirmSetupTransactionalWorker extends BaseWorker<Args> {
  readonly queue = 'payments:transactional:confirm:setup'
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
      console.error('Webhook dose not exist')
      return await this.pgBoss.fail(this.queue, job.id)
    }

    if (wh.payload.type !== 'checkout.session.completed') {
      console.error('Webhook is not of type checkout.session.completed')
      return await this.pgBoss.fail(this.queue, job.id)
    }

    const event = wh.payload

    try {
      // send transactional
      await PaymentService.sendSetupSubscriptionTransactionalMail({
        subscriptionExternalId: event.data.object.subscription as string,
        userId: job.data.userId,
        orderId: job.data.orderId,
      })
    } catch (e) {
      console.error(`[${this.queue}] error`)
      console.error(e)
      throw e
    }

    console.log(`[${this.queue}] done`)
  }
}
