import Stripe from 'stripe'
import { Company, Invoice, Order, PaymentWorkflow } from '../types'
import { PaymentService } from '../services/PaymentService'
import { CustomerInfoService } from '../services/CustomerInfoService'
import { SubscriptionService } from '../services/SubscriptionService'
import { InvoiceService } from '../services/InvoiceService'
import { Queue } from '@orbiting/backend-modules-job-queue'

import {
  CheckoutProcessingError,
  INVOICE_PAYMENT_STATUS_TO_CHARGE_STATUS,
} from '../constants'
import { mapInvoiceArgs } from '../handlers/stripe/invoiceCreated'
import { mapSubscriptionArgs } from '../handlers/stripe/subscriptionCreated'
import { ConfirmSetupTransactionalWorker } from '../workers/ConfirmSetupTransactionalWorker'
import { SyncMailchimpSetupWorker } from '../workers/SyncMailchimpSetupWorker'
import { Logger } from '@orbiting/backend-modules-types'

export class SubscriptionCheckoutCompletedWorkflow
  implements PaymentWorkflow<Stripe.CheckoutSessionCompletedEvent>
{
  constructor(
    protected readonly paymentService: PaymentService,
    protected readonly customerInfoService: CustomerInfoService,
    protected readonly subscriptionService: SubscriptionService,
    protected readonly invoiceService: InvoiceService,
    protected readonly queue: Queue,
    protected readonly logger: Logger,
  ) {}

  async run(
    company: Company,
    event: Stripe.CheckoutSessionCompletedEvent,
  ): Promise<any> {
    const customerId = this.extractCustomerId(event)
    const userId = await this.resolveUserId(company, customerId)
    const paymentStatus = this.normalizePaymentStatus(event)

    const [subId, invoiceId] = await Promise.all([
      await this.processSubscription(event, company, userId),
      await this.processInvoice(event, company, userId),
    ])

    const order = await this.saveOrder(
      userId,
      company,
      event,
      invoiceId,
      subId,
      paymentStatus,
    )

    await this.processLineItems(event, company, order)
    await this.runNotifiers(event, invoiceId, userId)
    return
  }

  private async processLineItems(
    event: Stripe.CheckoutSessionCompletedEvent,
    company: Company,
    order: Order,
  ) {
    const sess = await this.paymentService.getCheckoutSession(
      company,
      event.data.object.id,
    )

    if (!sess) {
      throw new CheckoutProcessingError('checkout session does not exist')
    }

    const lineItems = sess.line_items?.data.map((line) => {
      return {
        lineItemId: line.id,
        externalPriceId: line.price!.id,
        priceLookupKey: line.price!.lookup_key,
        description: line.description,
        quantity: line.quantity,
        price: line.amount_total,
        priceSubtotal: line.amount_subtotal,
        taxAmount: line.amount_tax,
        discountAmount: line.amount_discount,
      }
    })

    const orderLineItems = lineItems?.map((i) => {
      return { orderId: order.id, ...i }
    })

    if (orderLineItems?.length) {
      await this.invoiceService.saveOrderItems(orderLineItems)
    }
  }

  private async saveOrder(
    userId: string,
    company: Company,
    event: Stripe.CheckoutSessionCompletedEvent,
    invoiceId: string | undefined,
    subId: string | undefined,
    paymentStatus: string,
  ) {
    return await this.invoiceService.saveOrder({
      userId: userId,
      company: company,
      externalId: event.data.object.id,
      invoiceId: invoiceId,
      subscriptionId: subId,
      status: paymentStatus as 'paid' | 'unpaid',
    })
  }

  private async processInvoice(
    event: Stripe.CheckoutSessionCompletedEvent,
    company: Company,
    userId: string,
  ) {
    const extInvoiceId = event.data.object.invoice
    if (typeof extInvoiceId === 'string') {
      const existingInvoice = await this.invoiceService.getInvoice({
        externalId: extInvoiceId,
      })
      if (existingInvoice) {
        return existingInvoice.id
      }
    }

    // if checkout contains a invoice that is not in the database try to save it
    const stripeInvoice = await this.paymentService.getInvoice(
      company,
      extInvoiceId as string,
    )
    if (!stripeInvoice) {
      this.logger.warn(`Invoice not found in Stripe`, {
        externalId: extInvoiceId,
      })
      return undefined
    }
    const args = mapInvoiceArgs(company, stripeInvoice)
    const saved = await this.invoiceService.saveInvoice(userId, args)

    await this.trackCharges(company, saved, stripeInvoice)

    return saved.id
  }

  private async trackCharges(
    company: Company,
    invoice: Invoice,
    invoiceData: Stripe.Response<Stripe.Invoice>,
  ) {
    if (!invoiceData.payments) return
    Promise.all(
      invoiceData.payments.data.map(async (payment) => {
        this.logger.debug({ payment, invoice }, 'invoice payment')

        const paymentIntent = payment.payment
          .payment_intent as Stripe.PaymentIntent

        const charge = await this.paymentService.getCharge(
          company,
          paymentIntent.latest_charge! as string,
        )

        if (!charge) {
          this.logger.error(
            { chargeId: paymentIntent.latest_charge, invoiceId: invoice.id },
            'charge not found',
          )
          return null
        }

        let paymentMethodType: 'CARD' | 'TWINT' | 'PAYPAL' | null = null
        if (paymentIntent.payment_method) {
          const pm = await this.paymentService.getPaymentMethod(
            company,
            paymentIntent.payment_method.toString(),
          )
          if (pm?.card) {
            paymentMethodType = 'CARD'
          }
          if (pm?.twint) {
            paymentMethodType = 'TWINT'
          }
          if (pm?.paypal) {
            paymentMethodType = 'PAYPAL'
          }
        }

        const data = {
          company: company,
          externalId: charge.id,
          invoiceId: invoice.id,
          paid: payment.status === 'paid',
          status:
            INVOICE_PAYMENT_STATUS_TO_CHARGE_STATUS[
              payment.status as keyof typeof INVOICE_PAYMENT_STATUS_TO_CHARGE_STATUS
            ],
          amount: payment.amount_requested,
          amountCaptured: charge?.amount_captured || 0,
          amountRefunded: charge?.amount_refunded || 0,
          paymentMethodType: paymentMethodType,
          fullyRefunded: charge?.refunded || false,
          createdAt: new Date(payment.created * 1000),
          paymentIntentId: paymentIntent.id,
          customerId: paymentIntent.customer as string,
          description: paymentIntent.description,
          failureCode: paymentIntent.last_payment_error?.code,
          failureMessage: paymentIntent.last_payment_error?.message,
        }

        try {
          await this.invoiceService.saveCharge(data)
        } catch (e) {
          if (
            e instanceof Error &&
            e.message.includes('charge_external_id_idx')
          ) {
            this.logger.info(
              { externalId: charge.id, invoiceId: invoice.id },
              'charge already recorded',
            )
          } else if (e instanceof Error) {
            this.logger.error(
              { error: e, invoice: invoice.id },
              `Error recording charge: ${e.message}`,
            )
          }
        }
      }),
    )
  }

  private async processSubscription(
    event: Stripe.CheckoutSessionCompletedEvent,
    company: Company,
    userId: string,
  ) {
    const externalSubId = event.data.object.subscription
    if (typeof externalSubId !== 'string') {
      return undefined
    }

    const existingSubscription = await this.subscriptionService.getSubscription(
      {
        externalId: externalSubId,
      },
    )
    if (existingSubscription) {
      return existingSubscription.id
    }

    const subscription = await this.paymentService.getSubscription(
      company,
      externalSubId,
    )
    if (!subscription) {
      this.logger.warn(`Subscription not found in Stripe`, {
        externalId: externalSubId,
      })
      return undefined
    }

    const args = mapSubscriptionArgs(company, subscription)
    const created = await this.subscriptionService.setupSubscription(
      userId,
      args,
    )
    return created.id
  }

  private normalizePaymentStatus(event: Stripe.CheckoutSessionCompletedEvent) {
    let paymentStatus = event.data.object.payment_status
    if (paymentStatus === 'no_payment_required') {
      // no payments required are treated as paid
      paymentStatus = 'paid'
    }
    return paymentStatus
  }

  private async resolveUserId(company: Company, customerId: string) {
    const userId = await this.customerInfoService.getUserIdForCompanyCustomer(
      company,
      customerId,
    )
    if (!userId) {
      throw Error(`User for ${customerId} does not exists`)
    }
    return userId
  }

  private extractCustomerId(event: Stripe.CheckoutSessionCompletedEvent) {
    const customerId = event.data.object.customer?.toString()
    if (!customerId) {
      throw new CheckoutProcessingError('No stripe customer')
    }
    return customerId
  }

  private async runNotifiers(
    event: Stripe.CheckoutSessionCompletedEvent,
    invoiceId: string | undefined,
    userId: string,
  ) {
    await Promise.all([
      this.queue.send<ConfirmSetupTransactionalWorker>(
        'payments:transactional:confirm:setup',
        {
          $version: 'v1',
          eventSourceId: event.id,
          invoiceId: invoiceId as string,
          userId: userId,
        },
      ),
      this.queue.send<SyncMailchimpSetupWorker>(
        'payments:mailchimp:sync:setup',
        {
          $version: 'v1',
          eventSourceId: event.id,
          userId: userId,
        },
      ),
    ])
  }
}
