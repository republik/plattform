/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job } from 'pg-boss'
import { Webhook } from '../types'
import Stripe from 'stripe'
import { Payments, PaymentService } from '../payments'

type WorkerArgsV1 = {
  // TODO! Use webhook event id stead of entire webhook body
  $version: 'v1'
  event: Webhook<Stripe.Event>
}

export class StripeWebhookWorker extends BaseWorker<WorkerArgsV1> {
  readonly queue = 'payment:stripe:webhook'

  async perform(job: Job<WorkerArgsV1>): Promise<void> {
    console.log('event.data')
    const event = job.data.event.payload

    switch (event.type) {
      case 'checkout.session.completed':
        return processCheckout(Payments, event)
      case 'customer.subscription.created':
        return processSubscriptionCreated(Payments, event)
      case 'customer.subscription.updated':
        return processSubscriptionUpdate(Payments, event)
      case 'customer.subscription.deleted':
        // TODO scubription canceld
        console.log(event.data)
        throw new Error('Method not implemented.')
      default:
        throw new Error('Method not implemented.')
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

  await paymentService.saveOrder(customerId, {
    total: total,
    payementStatus: paymentStatus as 'paid' | 'unpaid',
  })
}

export async function processSubscriptionCreated(
  _paymentService: PaymentService,
  _event: Stripe.CustomerSubscriptionCreatedEvent,
) {
  throw new Error('Method not implemented.')
}

export async function processSubscriptionUpdate(
  _paymentService: PaymentService,
  _event: Stripe.CustomerSubscriptionUpdatedEvent,
) {
  throw new Error('Method not implemented.')
}
