/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
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
  readonly options: SendOptions = {
    retryLimit: 3,
    retryDelay: 120, // retry every 2 minutes
  }

  async perform(job: Job<WorkerArgsV1>): Promise<void> {
    console.log('event.id %s', job.data.event.id)
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
        return processSubscriptionDeleted(PaymentService, event)
      case 'invoice.created':
        return processInvoiceCreated(PaymentService, event)
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
  return
}

export async function processSubscriptionCreated(
  paymentService: PaymentService,
  event: Stripe.CustomerSubscriptionCreatedEvent,
) {
  await paymentService.setupSubscription({
    company: 'REPUBLIK_AG',
    type: 'MONTHLY_SUBSCRIPTION',
    gatewayId: event.data.object.id,
    customerId: event.data.object.customer as string,
    currentPeriodStart: new Date(event.data.object.current_period_start * 1000),
    currentPeriodEnd: new Date(event.data.object.current_period_end * 1000),
    status: event.data.object.status,
  })

  return
}

export async function processSubscriptionUpdate(
  _paymentService: PaymentService,
  _event: Stripe.CustomerSubscriptionUpdatedEvent,
) {
  throw new Error('Method not implemented.')
}

export async function processSubscriptionDeleted(
  paymentService: PaymentService,
  event: Stripe.CustomerSubscriptionDeletedEvent,
) {
  const endTimestamp = (event.data.object.ended_at || 0) * 1000
  const canceledAtTimestamp = (event.data.object.canceled_at || 0) * 1000

  await paymentService.disableSubscription(
    { gatewayId: event.data.object.id },
    {
      endedAt: new Date(endTimestamp),
      canceledAt: new Date(canceledAtTimestamp),
    },
  )

  return
}

export async function processInvoiceCreated(
  paymentService: PaymentService,
  event: Stripe.InvoiceCreatedEvent,
) {
  await paymentService.saveInvoice(event.data.object.customer as string, {
    total: event.data.object.total,
    totalBeforeDiscount: event.data.object.subtotal,
    company: 'REPUBLIK_AG',
    hrId: event.data.object.number as string,
    items: event.data.object.lines,
    gatewayId: event.data.object.id,
    status: event.data.object.status as any,
    subscriptionId: event.data.object.subscription as string,
  })

  return
}
