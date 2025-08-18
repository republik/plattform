import Stripe from 'stripe'
import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import { WebhookService } from '../services/WebhookService'
import { MailNotificationService } from '../services/MailNotificationService'
import { PaymentService } from '../services/PaymentService'
import { Company } from '../types'

type Args = {
  $version: 'v1'
  userId: string
  eventSourceId: string
  subscriptionId: string
  company: Company
}

export class NoticeRenewalPaymentSuccessfulTransactionalWorker extends BaseWorker<Args> {
  readonly queue = 'payments:transactional:notice:renewal_payment_successful'
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
    const paymentService = new PaymentService()

    const wh = await webhookService.getEvent<Stripe.InvoicePaymentSucceededEvent>(
      job.data.eventSourceId,
    )

    if (!wh) {
      this.logger.error(
        { queue: this.queue, jobId: job.id },
        'Webhook does not exist',
      )
      return await this.pgBoss.fail(this.queue, job.id)
    }

    if (wh.payload.type !== 'invoice.payment_succeeded') {
      this.logger.error(
        { queue: this.queue, jobId: job.id },
        'Webhook is not of type invoice.payment_succeeded',
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
      await mailService.sendNoticeRenewalPaymentSucceededTransactional({
        userId: job.data.userId,
        subscriptionId: job.data.subscriptionId,
        amount: event.data.object.amount_due,
        paymentMethod: paymentMethod
      })
    } catch (e) {
       this.logger.error(
        { queue: this.queue, jobId: job.id, error: e },
        'Error sending subscription renewal payment succeeded notice transactional mail',
      )
      throw e
    }

    this.logger.debug({ queue: this.queue, jobiId: job.id }, 'done')
  }
}
