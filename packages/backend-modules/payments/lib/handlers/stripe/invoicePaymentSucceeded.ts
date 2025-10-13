import Stripe from 'stripe'
import { Company, PaymentWorkflow } from '../../types'
import { InvoicePaymentStatusToChargeStatus, parseStripeDate } from './utils'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'
import { PaymentService } from '../../services/PaymentService'
import { InvoiceService } from '../../services/InvoiceService'
import { SubscriptionService } from '../../services/SubscriptionService'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { NoticeRenewalPaymentSuccessfulTransactionalWorker } from '../../workers/NoticeRenewalPaymentSuccessfulTransactionalWorker'
import { Logger } from '@orbiting/backend-modules-types'

class InvoicePaymentSucceededWorkflow
  implements PaymentWorkflow<Stripe.InvoicePaymentSucceededEvent>
{
  constructor(
    protected readonly paymentService: PaymentService,
    protected readonly invoiceService: InvoiceService,
    protected readonly subscriptionService: SubscriptionService,
    protected readonly logger: Logger,
  ) {}

  async run(
    company: Company,
    event: Stripe.InvoicePaymentSucceededEvent,
  ): Promise<any> {
    const stripeInvoiceId = event.data.object.id as string

    const i = await this.paymentService.getInvoice(company, stripeInvoiceId)

    if (!i) {
      console.log('not processing event: stripe invoice not found')
      return
    }

    const invoice = await this.invoiceService.getInvoice({
      externalId: i.id as string,
    })
    if (!invoice) {
      throw Error('invoice not saved locally')
    }

    Promise.all(
      i.payments!.data.map(async (payment) => {
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
            InvoicePaymentStatusToChargeStatus[
              payment.status as keyof typeof InvoicePaymentStatusToChargeStatus
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

        const ch = await this.invoiceService.getCharge({
          externalId: charge.id!,
        })
        if (ch) {
          await this.invoiceService.updateCharge({ id: ch.id }, data)
        } else {
          await this.invoiceService.saveCharge(data)
        }
      }),
    )

    if (i.parent?.subscription_details?.subscription) {
      const subscription = await this.subscriptionService.getSubscription({
        externalId: i.parent.subscription_details?.subscription as string,
      })
      if (subscription && shouldSendAutoRenewalNotice(i)) {
        const queue = Queue.getInstance()

        await queue.send<NoticeRenewalPaymentSuccessfulTransactionalWorker>(
          'payments:transactional:notice:renewal_payment_successful',
          {
            $version: 'v1',
            eventSourceId: event.id,
            userId: subscription.userId,
            subscriptionId: subscription.id,
            company: company,
          },
        )
      }
    }
  }
}

function shouldSendAutoRenewalNotice(invoice: Stripe.Invoice): boolean {
  // do only send if it's not the initial invoice after checkout
  if (
    invoice.billing_reason === 'subscription_cycle' &&
    invoice.collection_method === 'charge_automatically'
  ) {
    return true
  }
  return false
}

export async function processInvoicePaymentSucceeded(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.InvoicePaymentSucceededEvent,
) {
  return new InvoicePaymentSucceededWorkflow(
    new PaymentService(),
    new InvoiceService(ctx.pgdb),
    new SubscriptionService(ctx.pgdb),
    ctx.logger.child(
      { eventId: event.id },
      { msgPrefix: '[Invoice Payment Succeeded]' },
    ),
  ).run(company, event)
}

export function mapChargeArgs(
  company: Company,
  invoiceId: string | null,
  charge: Stripe.Charge,
) {
  let paymentMethodType: 'CARD' | 'TWINT' | 'PAYPAL' | null = null
  if (charge?.payment_method_details?.card) {
    paymentMethodType = 'CARD'
  }
  if (charge?.payment_method_details?.twint) {
    paymentMethodType = 'TWINT'
  }
  if (charge?.payment_method_details?.paypal) {
    paymentMethodType = 'PAYPAL'
  }

  return {
    company: company,
    externalId: charge.id,
    invoiceId: invoiceId,
    paid: charge.paid,
    status: charge.status,
    amount: charge.amount,
    amountCaptured: charge.amount_captured,
    amountRefunded: charge.amount_refunded,
    paymentMethodType: paymentMethodType,
    fullyRefunded: charge.refunded,
    createdAt: parseStripeDate(charge.created),
    paymentIntentId: charge.payment_intent as string,
    customerId: charge.customer as string,
    description: charge.description,
    failureCode: charge.failure_code,
    failureMessage: charge.failure_message,
  }
}
