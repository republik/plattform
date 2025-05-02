import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import { Company } from '../types'
import Stripe from 'stripe'
import { processInvoiceUpdated } from '../handlers/stripe/invoiceUpdate'
import { processInvoiceCreated } from '../handlers/stripe/invoiceCreated'
import { processSubscriptionDeleted } from '../handlers/stripe/subscriptionDeleted'
import { processSubscriptionUpdate } from '../handlers/stripe/subscriptionUpdate'
import { processSubscriptionCreated } from '../handlers/stripe/subscriptionCreated'
import { processCheckoutCompleted } from '../handlers/stripe/checkoutCompleted'
import { processPaymentFailed } from '../handlers/stripe/paymentFailed'
import { isPledgeBased } from '../handlers/stripe/utils'
import { processChargeRefunded } from '../handlers/stripe/chargeRefunded'
import { processInvoicePaymentSucceeded } from '../handlers/stripe/invoicePaymentSucceeded'
import { WebhookService } from '../services/WebhookService'
import { ConnectionContext } from '@orbiting/backend-modules-types'

type WorkerArgsV1 = {
  $version: 'v1'
  eventSourceId: string
  company: Company
}

export type PaymentWebhookContext = ConnectionContext

export class StripeWebhookWorker extends BaseWorker<WorkerArgsV1> {
  readonly queue = 'payments:stripe:webhook'
  readonly options: SendOptions = {
    retryLimit: 3,
    retryDelay: 120, // retry every 2 minutes
  }

  async perform([job]: Job<WorkerArgsV1>[]): Promise<void> {
    if (typeof this.context === 'undefined')
      throw Error('This jobs needs the connection context to run')

    const webhookService = new WebhookService(this.context.pgdb)

    const wh = await webhookService.getEvent<Stripe.Event>(
      job.data.eventSourceId,
    )

    if (!wh) {
      console.error('Webhook dose not exist')
      return await this.pgBoss.fail(this.queue, job.id)
    }

    const event = wh.payload
    try {
      console.log('processing stripe event %s [%s]', event.id, event.type)

      const ctx = this.context

      switch (event.type) {
        case 'checkout.session.completed':
          await processCheckoutCompleted(ctx, job.data.company, event)
          break
        case 'customer.subscription.created':
          if (isPledgeBased(event.data.object.metadata)) {
            console.log('pledge based event [%s]; skipping', event.id)
            break
          }
          await processSubscriptionCreated(ctx, job.data.company, event)
          break
        case 'customer.subscription.updated':
          if (isPledgeBased(event.data.object.metadata)) {
            console.log('pledge based event [%s]; skipping', event.id)
            break
          }
          await processSubscriptionUpdate(ctx, job.data.company, event)
          break
        case 'customer.subscription.deleted':
          if (isPledgeBased(event.data.object.metadata)) {
            console.log('pledge based event [%s]; skipping', event.id)
            break
          }
          await processSubscriptionDeleted(ctx, job.data.company, event)
          break
        case 'invoice.created':
          await processInvoiceCreated(ctx, job.data.company, event)
          break
        case 'invoice.updated':
        case 'invoice.finalized':
        case 'invoice.paid':
        case 'invoice.voided':
          await processInvoiceUpdated(ctx, job.data.company, event)
          break
        case 'invoice.payment_failed':
          await processPaymentFailed(ctx, job.data.company, event)
          break
        case 'invoice.payment_succeeded':
          await processInvoicePaymentSucceeded(ctx, job.data.company, event)
          break
        case 'charge.refunded':
          await processChargeRefunded(ctx, job.data.company, event)
          break
        default:
          console.log('skipping %s no handler for this event', event.type)
      }
    } catch (e) {
      console.error(
        'processing stripe event %s [%s] failed',
        event.id,
        event.type,
      )
      console.error(e)
      throw e
    }

    console.log(
      'successfully processed stripe event %s [%s]',
      event.id,
      event.type,
    )
    await webhookService.markEventAsProcessed(event.id)
  }
}
