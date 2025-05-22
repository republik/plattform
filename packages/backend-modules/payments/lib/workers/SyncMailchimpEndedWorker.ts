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

export class SyncMailchimpEndedWorker extends BaseWorker<Args> {
  readonly queue = 'payments:mailchimp:sync:ended'
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

    const invoice = await PaymentService.getInvoice({
      externalId: event.data.object.latest_invoice as string,
    })
    const subscription = await PaymentService.getSubscription({
      externalId: event.data.object.id as string,
    })

    if (!invoice || !subscription) {
      console.error(
        'Latest invoice or subscription could not be found in the database',
      )
      return await this.pgBoss.fail(this.queue, job.id)
    }

    await mailService.syncMailchimpUpdateSubscription({
      userId: job.data.userId,
    })

    console.log(`[${this.queue}] done`)
  }
}
