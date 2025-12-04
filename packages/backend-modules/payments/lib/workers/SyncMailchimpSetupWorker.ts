import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import Stripe from 'stripe'
import { WebhookService } from '../services/WebhookService'
import { MailNotificationService } from '../services/MailNotificationService'
import { SubscriptionService } from '../services/SubscriptionService'

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

    this.logger.debug({ queue: this.queue, jobiId: job.id }, 'start')

    const webhookService = new WebhookService(this.context.pgdb)
    const mailService = new MailNotificationService(this.context.pgdb)
    const subscriptionService = new SubscriptionService(this.context.pgdb)

    const wh =
      await webhookService.getEvent<Stripe.CheckoutSessionCompletedEvent>(
        job.data.eventSourceId,
      )

    if (!wh) {
      this.logger.error(
        { queue: this.queue, jobiId: job.id },
        'Webhook does not exist',
      )
      return await this.pgBoss.fail(this.queue, job.id)
    }

    if (wh.payload.type !== 'checkout.session.completed') {
      this.logger.error(
        { queue: this.queue, jobiId: job.id },
        'Webhook is not of type checkout.session.completed',
      )
      return await this.pgBoss.fail(this.queue, job.id)
    }

    const event = wh.payload

    const subscription = await subscriptionService.getSubscription({
      externalId: event.data.object.subscription as string,
    })

    if (!subscription) {
      this.logger.error(
        { queue: this.queue, jobiId: job.id },
        'Subscription could not be found in the database',
      )
      return await this.pgBoss.fail(this.queue, job.id)
    }

    await mailService.syncMailchimpSetupSubscription({
      userId: job.data.userId,
      subscriptionExternalId: event.data.object.subscription as string,
    })

    this.logger.debug({ queue: this.queue, jobiId: job.id }, 'done')
  }
}
