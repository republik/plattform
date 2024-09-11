/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseWorker, Queue } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import { Company, SubscriptionType } from '../types'
import Stripe from 'stripe'
import { Payments, PaymentService } from '../payments'
import { PaymentSetupTransactionalWorker } from './PaymentSetupTransactionalWorker'

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
        // case 'customer.updated':
        //   // await processCustomerUpdated(PaymentService, job.data.company, event)
        //   break
        case 'checkout.session.completed':
          await processCheckout(PaymentService, job.data.company, event)
          break
        case 'customer.subscription.created':
          await processSubscriptionCreated(
            PaymentService,
            job.data.company,
            event,
          )
          break
        case 'customer.subscription.updated':
          await processSubscriptionUpdate(
            PaymentService,
            job.data.company,
            event,
          )
          break
        case 'customer.subscription.deleted':
          await processSubscriptionDeleted(
            PaymentService,
            job.data.company,
            event,
          )
          break
        case 'invoice.created':
          await processInvoiceCreated(PaymentService, job.data.company, event)
          break
        case 'invoice.finalized':
        case 'invoice.updated':
        case 'invoice.voided':
        case 'invoice.paid':
          await processInvoiceUpdated(PaymentService, job.data.company, event)
          break
          // case 'invoice.payment_failed':
          //   console.log(event)
          //   await new Promise((v) => v)
          // case 'invoice.payment_action_required':
          // 3d Secure or failed paypal payment
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

export async function processCheckout(
  paymentService: PaymentService,
  company: Company,
  event: Stripe.CheckoutSessionCompletedEvent,
) {
  const customerId = event.data.object.customer as string

  const userId = await paymentService.getUserIdForCompanyCustomer(
    company,
    customerId,
  )
  if (!userId) {
    throw Error(`User for ${customerId} does not exists`)
  }

  const customFields = event.data.object.custom_fields
  if (customFields.length > 0) {
    console.log(customFields)
    const firstNameField = customFields.find(
      (field) => field.key === 'firstName',
    )
    const lastNameField = customFields.find((field) => field.key === 'lastName')

    const firstName = firstNameField?.text?.value
    const lastName = lastNameField?.text?.value

    if (firstName && lastName) {
      await paymentService.updateUserName(userId, firstName, lastName)
    }
  }

  let paymentStatus = event.data.object.payment_status
  if (paymentStatus === 'no_payment_required') {
    // no payments required are treated as paid
    paymentStatus = 'paid'
  }

  const total = event.data.object.amount_total || 0
  const totalBeforeDiscount = event.data.object.amount_subtotal || 0

  const order = await paymentService.saveOrder(userId, {
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

  console.log(order)

  const queue = Queue.getInstance()

  await Promise.all([
    queue.send<PaymentSetupTransactionalWorker>(
      'payments:transactional:mail:setup',
      {
        $version: 'v1',
        eventSourceId: event.id,
        orderId: order.id,
        userId: userId,
      },
    ),
  ])

  return
}

export async function processSubscriptionCreated(
  paymentService: PaymentService,
  company: Company,
  event: Stripe.CustomerSubscriptionCreatedEvent,
) {
  const customerId = event.data.object.customer as string

  const userId = await paymentService.getUserIdForCompanyCustomer(
    company,
    customerId,
  )

  if (!userId) {
    throw new Error(`Unknown customer ${customerId}`)
  }

  await paymentService.setupSubscription(userId, {
    company: company,
    type: getSubscriptionType(company),
    externalId: event.data.object.id,
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
  const customerId = event.data.object.customer as string

  const userId = await paymentService.getUserIdForCompanyCustomer(
    company,
    customerId,
  )

  if (!userId) {
    throw new Error(`Unknown customer ${customerId}`)
  }

  await paymentService.saveInvoice(userId, {
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
