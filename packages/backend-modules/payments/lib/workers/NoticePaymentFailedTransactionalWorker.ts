import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import Stripe from 'stripe'
import { WebhookService } from '../services/WebhookService'
import { MailNotificationService } from '../services/MailNotificationService'

type Args = {
  $version: 'v1'
  userId: string
  eventSourceId: string
  invoiceExternalId: string
}

export class NoticePaymentFailedTransactionalWorker extends BaseWorker<Args> {
  readonly queue = 'payments:transactional:notice:payment_failed'
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

    const wh = await webhookService.getEvent<Stripe.InvoicePaymentFailedEvent>(
      job.data.eventSourceId,
    )

    if (!wh) {
      console.error('Webhook does not exist')
      return await this.pgBoss.fail(this.queue, job.id)
    }

    if (wh.payload.type !== 'invoice.payment_failed') {
      console.error('Webhook is not of type invoice.payment_failed')
      return await this.pgBoss.fail(this.queue, job.id)
    }

    const event = wh.payload

    try {
      // send transactional
      await mailService.sendNoticePaymentFailedTransactionalMail({
        subscriptionExternalId: event.data.object.subscription as string,
        userId: job.data.userId,
        invoiceExternalId: job.data.invoiceExternalId,
      })
    } catch (e) {
      console.error(`[${this.queue}] error`)
      console.error(e)
      throw e
    }

    console.log(`[${this.queue}] done`)
  }
}
