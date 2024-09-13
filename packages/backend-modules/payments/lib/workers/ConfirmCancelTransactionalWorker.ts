import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import { Payments } from '../payments'
import Stripe from 'stripe'

type Args = {
  $version: 'v1'
  userId: string
  eventSourceId: string
}

export class ConfirmCancelTransactionalWorker extends BaseWorker<Args> {
  readonly queue = 'payments:transactional:confirm:cancel'
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

    const event = wh.payload

    try {
      // send transactional
      await PaymentService.sendCancelConfirmationTransactionalMail({
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
