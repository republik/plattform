import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import Stripe from 'stripe'
import { WebhookService } from '../services/WebhookService'
import { MailNotificationService } from '../services/MailNotificationService'
import { PaymentService } from '../services/PaymentService'
import { Company } from '../types'
import { parseStripeDate } from '../handlers/stripe/utils'

type Args = {
  $version: 'v1'
  userId: string
  company: Company
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

    this.logger.debug({ queue: this.queue, jobId: job.id }, 'start')

    const webhookService = new WebhookService(this.context.pgdb)
    const mailService = new MailNotificationService(this.context.pgdb)
    const paymentService = new PaymentService()

    const wh = await webhookService.getEvent<Stripe.InvoicePaymentFailedEvent>(
      job.data.eventSourceId,
    )

    if (!wh) {
      this.logger.error(
        { queue: this.queue, jobId: job.id },
        'Webhook does not exist',
      )
      return await this.pgBoss.fail(this.queue, job.id)
    }

    if (wh.payload.type !== 'invoice.payment_failed') {
      this.logger.error(
        { queue: this.queue, jobId: job.id },
        'Webhook is not of type invoice.payment_failed',
      )
      return await this.pgBoss.fail(this.queue, job.id)
    }

    const event = wh.payload

    const paymentMethod = await paymentService.getPaymentMethodForSubscription(
      job.data.company,
      event.data.object.subscription as string,
    )

    try {
      // send transactional
      await mailService.sendNoticePaymentFailedTransactionalMail({
        subscriptionExternalId: event.data.object.subscription as string,
        userId: job.data.userId,
        invoiceExternalId: job.data.invoiceExternalId,
        paymentAttemptDate: parseStripeDate(event.data.object.next_payment_attempt),
        paymentMethod: paymentMethod || undefined
      })
    } catch (e) {
      this.logger.error(
        { queue: this.queue, jobId: job.id, error: e },
        'Error sending notice payment failed transactional mail',
      )
      throw e
    }

    this.logger.debug({ queue: this.queue, jobId: job.id }, 'done')
  }
}
