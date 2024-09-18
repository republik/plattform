import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import { Company } from '../types'
import Stripe from 'stripe'
import { Payments } from '../payments'
import { processInvoiceUpdated } from '../handlers/stripe/invoiceUpdate'
import { processInvoiceCreated } from '../handlers/stripe/invoiceCreated'
import { processSubscriptionDeleted } from '../handlers/stripe/subscriptionDeleted'
import { processSubscriptionUpdate } from '../handlers/stripe/subscriptionUpdate'
import { processSubscriptionCreated } from '../handlers/stripe/subscriptionCreated'
import { processCheckoutCompleted } from '../handlers/stripe/checkoutCompleted'
import { processPaymentFailed } from '../handlers/stripe/paymentFailed'

type WorkerArgsV1 = {
  $version: 'v1'
  // TODO! Use webhook event id stead of entire webhook body
  eventSourceId: string
  company: Company
}

export class StripeWebhookWorker extends BaseWorker<WorkerArgsV1> {
  readonly queue = 'payment:stripe:webhook'
  readonly options: SendOptions = {
    retryLimit: 3,
    retryDelay: 120, // retry every 2 minutes
  }

  async perform([job]: Job<WorkerArgsV1>[]): Promise<void> {
    const PaymentService = Payments.getInstance()

    const wh = await PaymentService.findWebhookEventBySourceId<Stripe.Event>(
      job.data.eventSourceId,
    )

    if (!wh) {
      console.error('Webhook dose not exist')
      return await this.pgBoss.fail(this.queue, job.id)
    }

    const event = wh.payload
    try {
      console.log('processing stripe event %s [%s]', event.id, event.type)

      switch (event.type) {
        case 'checkout.session.completed':
          await processCheckoutCompleted(
            PaymentService,
            job.data.company,
            event,
          )
          break
        case 'customer.subscription.created':
          if (isPledgeBased(event.data.object.metadata)) {
            console.log('pledge based event [%s]; skipping', event.id)
            break
          }
          await processSubscriptionCreated(
            PaymentService,
            job.data.company,
            event,
          )
          break
        case 'customer.subscription.updated':
          if (isPledgeBased(event.data.object.metadata)) {
            console.log('pledge based event [%s]; skipping', event.id)
            break
          }
          await processSubscriptionUpdate(
            PaymentService,
            job.data.company,
            event,
          )
          break
        case 'customer.subscription.deleted':
          if (isPledgeBased(event.data.object.metadata)) {
            console.log('pledge based event [%s]; skipping', event.id)
            break
          }
          await processSubscriptionDeleted(
            PaymentService,
            job.data.company,
            event,
          )
          break
        case 'invoice.created':
          await processInvoiceCreated(PaymentService, job.data.company, event)
          break
        case 'invoice.updated':
        case 'invoice.finalized':
        case 'invoice.paid':
        case 'invoice.voided':
          await processInvoiceUpdated(PaymentService, job.data.company, event)
          break
        case 'invoice.payment_failed':
          await processPaymentFailed(PaymentService, job.data.company, event)
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
    await PaymentService.markWebhookAsProcessed(event.id)
  }
}

function isPledgeBased(metadata: any) {
  return 'pledgeId' in metadata
}
