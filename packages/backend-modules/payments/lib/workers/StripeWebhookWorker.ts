/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import { Company, SubscriptionType, Webhook } from '../types'
import Stripe from 'stripe'
import { Payments, PaymentService } from '../payments'

type WorkerArgsV1 = {
  $version: 'v1'
  // TODO! Use webhook event id stead of entire webhook body
  event: Webhook<Stripe.Event>
  company: Company
}

export class StripeWebhookWorker extends BaseWorker<WorkerArgsV1> {
  readonly queue = 'payment:stripe:webhook'
  readonly options: SendOptions = {
    retryLimit: 3,
    retryDelay: 120, // retry every 2 minutes
  }

  async perform([job]: Job<WorkerArgsV1>[]): Promise<void> {
    console.log('event.id %s', job.data.event.id)
    const event = job.data.event.payload

    const PaymentService = Payments.getInstance()

    switch (event.type) {
      case 'checkout.session.completed':
        return processCheckout(PaymentService, job.data.company, event)
      case 'customer.subscription.created':
        return processSubscriptionCreated(
          PaymentService,
          job.data.company,
          event,
        )
      case 'customer.subscription.updated':
        return processSubscriptionUpdate(
          PaymentService,
          job.data.company,
          event,
        )
      case 'customer.subscription.deleted':
        return processSubscriptionDeleted(
          PaymentService,
          job.data.company,
          event,
        )
      case 'invoice.created':
        return processInvoiceCreated(PaymentService, job.data.company, event)
      case 'invoice.finalized':
      case 'invoice.updated':
      case 'invoice.voided':
      case 'invoice.paid':
        return processInvoiceUpdated(PaymentService, job.data.company, event)
      // case 'invoice.payment_failed':
      //   console.log(event)
      //   return new Promise((v) => v)
      case 'invoice.payment_action_required':
        // 3d Secure or failed paypal payment
        console.log(event.object)
        return new Promise((v) => v)
      default:
        console.log('skipping %s no handler for this event', event.type)
    }
  }
}

export async function processCheckout(
  paymentService: PaymentService,
  company: Company,
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
    company: company,
    externalId: event.data.object.id,
    items: event.data.object.line_items || [],
    invocieExternalId: event.data.object.invoice as string | undefined,
    subscriptionExternalId: event.data.object.subscription as
      | string
      | undefined,
    paymentStatus: paymentStatus as 'paid' | 'unpaid',
  })
  return
}

export async function processSubscriptionCreated(
  paymentService: PaymentService,
  company: Company,
  event: Stripe.CustomerSubscriptionCreatedEvent,
) {
  await paymentService.setupSubscription({
    company: company,
    type: getSubscriptionType(company),
    externalId: event.data.object.id,
    customerId: event.data.object.customer as string,
    currentPeriodStart: new Date(event.data.object.current_period_start * 1000),
    currentPeriodEnd: new Date(event.data.object.current_period_end * 1000),
    status: event.data.object.status,
    metadata: event.data.object.metadata,
  })

  return
}

function getSubscriptionType(company: Company): SubscriptionType {
  switch (company) {
    case 'REPUBLIK':
      return 'MONTHLY_SUBSCRIPTION'
    case 'PROJECT_R':
      return 'YEARLY_SUBSCRIPTION'
  }
}

export async function processSubscriptionUpdate(
  paymentService: PaymentService,
  company: Company,
  event: Stripe.CustomerSubscriptionUpdatedEvent,
) {
  const cancelAt = event.data.object.cancel_at
  const canceledAt = event.data.object.canceled_at

  await paymentService.updateSubscription({
    company: company,
    externalId: event.data.object.id,
    currentPeriodStart: new Date(event.data.object.current_period_start * 1000),
    currentPeriodEnd: new Date(event.data.object.current_period_end * 1000),
    status: event.data.object.status,
    metadata: event.data.object.metadata,
    cancelAt:
      typeof cancelAt === 'number'
        ? new Date(cancelAt * 1000)
        : (cancelAt as null | undefined),
    canceledAt:
      typeof canceledAt === 'number'
        ? new Date(canceledAt * 1000)
        : (cancelAt as null | undefined),
    cancelAtPeriodEnd: event.data.object.cancel_at_period_end,
  })
}

export async function processSubscriptionDeleted(
  paymentService: PaymentService,
  _company: Company,
  event: Stripe.CustomerSubscriptionDeletedEvent,
) {
  const endTimestamp = (event.data.object.ended_at || 0) * 1000
  const canceledAtTimestamp = (event.data.object.canceled_at || 0) * 1000

  await paymentService.disableSubscription(
    { externalId: event.data.object.id },
    {
      endedAt: new Date(endTimestamp),
      canceledAt: new Date(canceledAtTimestamp),
    },
  )

  return
}

export async function processInvoiceCreated(
  paymentService: PaymentService,
  company: Company,
  event: Stripe.InvoiceCreatedEvent,
) {
  await paymentService.saveInvoice(event.data.object.customer as string, {
    total: event.data.object.total,
    totalBeforeDiscount: event.data.object.subtotal,
    company: company,
    items: event.data.object.lines.data,
    discounts: event.data.object.discounts,
    metadata: event.data.object.metadata,
    externalId: event.data.object.id,
    periodStart: new Date(event.data.object.period_start * 1000),
    periodEnd: new Date(event.data.object.period_end * 1000),
    status: event.data.object.status as any,
    subscriptionId: event.data.object.subscription as string,
  })

  return
}

export async function processInvoiceUpdated(
  paymentService: PaymentService,
  _company: Company,
  event:
    | Stripe.InvoiceUpdatedEvent
    | Stripe.InvoiceFinalizedEvent
    | Stripe.InvoiceVoidedEvent
    | Stripe.InvoicePaidEvent,
) {
  await paymentService.updateInvoice(
    {
      externalId: event.data.object.id,
    },
    {
      total: event.data.object.total,
      totalBeforeDiscount: event.data.object.subtotal,
      items: event.data.object.lines.data,
      discounts: event.data.object.discounts,
      status: event.data.object.status as any,
    },
  )

  return
}