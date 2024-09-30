import Stripe from 'stripe'
import { PaymentService } from '../../payments'
import { Company } from '../../types'
import { PaymentProvider } from '../../providers/provider'

export async function processInvociePaymentSucceded(
  paymentService: PaymentService,
  company: Company,
  event: Stripe.InvoicePaymentSucceededEvent,
) {
  const i = await PaymentProvider.forCompany(company).getInvoice(
    event.data.object.id,
  )

  if (!i) {
    console.error('not processing event: stripe invoice not found')
    return
  }

  const invoice = await paymentService.getInvoice({ externalId: i.id })
  if (!invoice) {
    console.log('invoice not saved localy')
    throw Error('invoice not saved localy')
  }

  const incoiceCharge = i.charge as Stripe.Charge

  if (!incoiceCharge) {
    console.error('no charge assoicated with with the invoice not found')
    return
  }
  const args = mapChargeArgs(company, invoice.id, incoiceCharge)

  const ch = await paymentService.getCharge({ externalId: incoiceCharge.id })
  if (ch) {
    paymentService.updateCharge({ id: ch.id }, args)
  } else {
    paymentService.saveCharge(args)
  }
}

export function mapChargeArgs(
  company: Company,
  invoiceId: string,
  charge: Stripe.Charge,
) {
  let paymentMethodType: string | null = null
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
    createdAt: new Date(charge.created * 1000),
  }
}
