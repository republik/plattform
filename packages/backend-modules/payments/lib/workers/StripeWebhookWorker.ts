/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job } from 'pg-boss'
import { Webhook } from '../types'
import Stripe from 'stripe'
import { Payments, PaymentService } from '../payments'

type WorkerArgsV1 = {
  $version: 'v1'
  // TODO! Use webhook event id stead of entire webhook body
  event: Webhook<Stripe.Event>
}

export class StripeWebhookWorker extends BaseWorker<WorkerArgsV1> {
  readonly queue = 'payment:stripe:webhook'

  async perform(job: Job<WorkerArgsV1>): Promise<void> {
    console.log('event.data %v', job.data.$version)
    const event = job.data.event.payload

    const PaymentService = Payments.getInstance()

    switch (event.type) {
      case 'checkout.session.completed':
        return processCheckout(PaymentService, event)
      case 'customer.subscription.created':
        return processSubscriptionCreated(PaymentService, event)
      case 'customer.subscription.updated':
        return processSubscriptionUpdate(PaymentService, event)
      case 'customer.subscription.deleted':
        // TODO scubription canceld
        console.log(event.data)
        throw new Error('Method not implemented.')
      default:
        console.log('skipping %s no handler for this event', event.type)
    }
  }
}

export async function processCheckout(
  paymentService: PaymentService,
  event: Stripe.CheckoutSessionCompletedEvent,
) {
  let paymentStatus = event.data.object.payment_status
  if (paymentStatus === 'no_payment_required') {
    // no payments required are treated as paid
    paymentStatus = 'paid'
  }

  const customerId = event.data.object.customer as string
  const total = event.data.object.amount_total || 0
  const totalBeforeDiscount = event.data.object.amount_subtotal || 0

  await paymentService.saveOrder({
    customerId: customerId,
    total: total,
    totalBeforeDiscount: totalBeforeDiscount,
    company: 'REPUBLIK_AG',
    gatewayId: event.data.object.id,
    items: event.data.object.line_items,
    invocieId: event.data.object.invoice as string | undefined,
    paymentStatus: paymentStatus as 'paid' | 'unpaid',
  })
}

export async function processSubscriptionCreated(
  paymentService: PaymentService,
  event: Stripe.CustomerSubscriptionCreatedEvent,
) {
  paymentService.setupSubscription(event)
}

export async function processSubscriptionUpdate(
  _paymentService: PaymentService,
  _event: Stripe.CustomerSubscriptionUpdatedEvent,
) {
  throw new Error('Method not implemented.')
}
