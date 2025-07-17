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

    console.log(`[${this.queue}] start`)

    const webhookService = new WebhookService(this.context.pgdb)
    const mailService = new MailNotificationService(this.context.pgdb)
    const paymentService = new PaymentService()

    const wh = await webhookService.getEvent<Stripe.InvoiceUpcomingEvent>(
      job.data.eventSourceId,
    )

    if (!wh) {
      console.error('Webhook does not exist')
      return await this.pgBoss.fail(this.queue, job.id)
    }

    if (wh.payload.type !== 'invoice.upcoming') {
      console.error('Webhook is not of type invoice.upcoming')
      return await this.pgBoss.fail(this.queue, job.id)
    }

    const event = wh.payload

    const paymentMethod = await paymentService.getPaymentMethodForSubscription(
      job.data.company,
      event.data.object.subscription as string,
    )

    try {
      // send transactional
      await mailService.sendNoticeSubscriptionRenewalTransactionalMail({
        userId: job.data.userId,
        subscriptionId: job.data.subscriptionId,
        amount: event.data.object.amount_due,
        paymentAttemptDate: parseStripeDate(event.data.object.next_payment_attempt),
        paymentMethod: paymentMethod
      })
    } catch (e) {
      console.error(`[${this.queue}] error`)
      console.error(e)
      throw e
    }

    console.log(`[${this.queue}] done`)
  }
}
