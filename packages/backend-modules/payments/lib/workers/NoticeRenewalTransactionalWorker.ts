import Stripe from 'stripe'
import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import { WebhookService } from '../services/WebhookService'
import { MailNotificationService } from '../services/MailNotificationService'
import { parseStripeDate } from '../handlers/stripe/utils'
import { PaymentService } from '../services/PaymentService'
import { Company } from '../types'

type Args = {
  $version: 'v1'
  userId: string
  eventSourceId: string
  subscriptionId: string
  company: Company
}

export class NoticeRenewalTransactionalWorker extends BaseWorker<Args> {
  readonly queue = 'payments:transactional:notice:subscription_renewal'
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

    const wh = await webhookService.getEvent<Stripe.InvoiceUpcomingEvent>(
      job.data.eventSourceId,
    )

    if (!wh) {
      this.logger.error(
        { queue: this.queue, jobId: job.id },
        'Webhook does not exist',
      )
      return await this.pgBoss.fail(this.queue, job.id)
    }

    if (wh.payload.type !== 'invoice.upcoming') {
      this.logger.error(
        { queue: this.queue, jobId: job.id },
        'Webhook is not of type invoice.upcoming',
      )
      return await this.pgBoss.fail(this.queue, job.id)
    }

    const event = wh.payload

    const paymentMethod = await paymentService.getPaymentMethodForSubscription(
      job.data.company,
      event.data.object.parent?.subscription_details?.subscription as string,
    )

    try {
      // send transactional
      await mailService.sendNoticeSubscriptionRenewalTransactionalMail({
        userId: job.data.userId,
        subscriptionId: job.data.subscriptionId,
        isDiscounted: !!event.data.object.total_discount_amounts?.length,
        withDonation: !!event.data.object.lines.data.filter((line) =>
          line.description?.includes('Spende'),
        ).length,
        amount: event.data.object.amount_due,
        paymentAttemptDate: parseStripeDate(
          event.data.object.next_payment_attempt,
        ),
        paymentMethod: paymentMethod,
      })
    } catch (e) {
      this.logger.error(
        { queue: this.queue, jobId: job.id, error: e },
        'Error sending subscription renewal reminder notice transactional mail',
      )
      throw e
    }

    this.logger.debug({ queue: this.queue, jobiId: job.id }, 'done')
  }
}
