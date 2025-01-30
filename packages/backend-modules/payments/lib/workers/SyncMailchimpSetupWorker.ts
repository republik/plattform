import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import { Payments } from '../payments'
import Stripe from 'stripe'
import { WebhookService } from '../services/WebhookService'
import { MailNotificationService } from '../services/MailNotificationService'

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

    const webhookService = new WebhookService(this.context.pgdb)
    const mailService = new MailNotificationService(this.context.pgdb)
    const PaymentService = Payments.getInstance()

    const wh =
      await webhookService.getEvent<Stripe.CheckoutSessionCompletedEvent>(
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

    const subscription = await PaymentService.getSubscription({
      externalId: event.data.object.subscription as string,
    })

    if (!subscription) {
      console.error(
        'Subscription could not be found in the database',
      )
      return await this.pgBoss.fail(this.queue, job.id)
    }

    await mailService.syncMailchimpSetupSubscription({
      userId: job.data.userId,
      subscriptionExternalId: event.data.object.subscription as string,
    })

    console.log(`[${this.queue}] done`)
  }
}
