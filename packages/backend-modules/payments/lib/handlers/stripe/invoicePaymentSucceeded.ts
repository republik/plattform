import Stripe from 'stripe'
import { Company, PaymentWorkflow, Subscription } from '../../types'
import { parseStripeDate } from './utils'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'
import { PaymentService } from '../../services/PaymentService'
import { InvoiceService } from '../../services/InvoiceService'
import { SubscriptionService } from '../../services/SubscriptionService'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { NoticeRenewalPaymentSuccessfulTransactionalWorker } from '../../workers/NoticeRenewalPaymentSuccessfulTransactionalWorker'

class InvoicePaymentSucceededWorkflow
  implements PaymentWorkflow<Stripe.InvoicePaymentSucceededEvent>
{
  constructor(
    protected readonly paymentService: PaymentService,
    protected readonly invoiceService: InvoiceService,
    protected readonly subscriptionService: SubscriptionService,
  ) {}

  async run(
    company: Company,
    event: Stripe.InvoicePaymentSucceededEvent,
  ): Promise<any> {
    const stripeInvoiceId = event.data.object.id

    const i = await this.paymentService.getInvoice(company, stripeInvoiceId)

    if (!i) {
      console.log('not processing event: stripe invoice not found')
      return
    }

    const invoice = await this.invoiceService.getInvoice({ externalId: i.id })
    if (!invoice) {
      throw Error('invoice not saved locally')
    }

    const incoiceCharge = i.charge as Stripe.Charge

    if (!incoiceCharge) {
      console.error('no charge associated with the invoice not found')
      return
    }
    const args = mapChargeArgs(company, invoice.id, incoiceCharge)

    const ch = await this.invoiceService.getCharge({
      externalId: incoiceCharge.id,
    })
    if (ch) {
      await this.invoiceService.updateCharge({ id: ch.id }, args)
    } else {
      await this.invoiceService.saveCharge(args)
    }

    if (i.subscription) {
      const subscription = await this.subscriptionService.getSubscription({
        externalId: i.subscription as string,
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

function shouldSendAutoRenewalNotice(
  invoice: Stripe.Invoice,
): boolean {
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
  ).run(company, event)
}

export function mapChargeArgs(
  company: Company,
  invoiceId: string,
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
  }
}
