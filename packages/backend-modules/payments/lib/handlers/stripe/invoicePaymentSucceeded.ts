import Stripe from 'stripe'
import { Company, PaymentWorkflow } from '../../types'
import { parseStripeDate } from './utils'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'
import { PaymentService } from '../../services/PaymentService'
import { InvoiceService } from '../../services/InvoiceService'

class InvoicePaymentSucceededWorkflow
  implements PaymentWorkflow<Stripe.InvoicePaymentSucceededEvent>
{
  constructor(
    protected readonly paymentService: PaymentService,
    protected readonly invoiceService: InvoiceService,
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
  }
}

export async function processInvoicePaymentSucceeded(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.InvoicePaymentSucceededEvent,
) {
  return new InvoicePaymentSucceededWorkflow(
    new PaymentService(),
    new InvoiceService(ctx.pgdb),
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
