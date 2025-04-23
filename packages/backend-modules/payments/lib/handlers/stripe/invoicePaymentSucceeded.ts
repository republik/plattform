import Stripe from 'stripe'
import { Company } from '../../types'
import { PaymentProvider } from '../../providers/provider'
import { parseStripeDate } from './utils'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'

export async function processInvoicePaymentSucceeded(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.InvoicePaymentSucceededEvent,
) {
  const i = await PaymentProvider.forCompany(company).getInvoice(
    event.data.object.id,
  )

  if (!i) {
    console.log('not processing event: stripe invoice not found')
    return
  }

  const invoice = await ctx.payments.getInvoice({ externalId: i.id })
  if (!invoice) {
    throw Error('invoice not saved locally')
  }

  const incoiceCharge = i.charge as Stripe.Charge

  if (!incoiceCharge) {
    console.error('no charge associated with the invoice not found')
    return
  }
  const args = mapChargeArgs(company, invoice.id, incoiceCharge)

  const ch = await ctx.payments.getCharge({ externalId: incoiceCharge.id })
  if (ch) {
    ctx.payments.updateCharge({ id: ch.id }, args)
  } else {
    ctx.payments.saveCharge(args)
  }
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
