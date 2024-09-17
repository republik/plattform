import Stripe from 'stripe'
import { Company } from '../../types'
import { PaymentService } from '../../payments'
import { PaymentProvider } from '../../providers/provider'

export async function processInvoiceUpdated(
  paymentService: PaymentService,
  company: Company,
  event:
    | Stripe.InvoiceUpdatedEvent
    | Stripe.InvoiceFinalizedEvent
    | Stripe.InvoiceVoidedEvent
    | Stripe.InvoicePaidEvent,
) {
  const invoice = await PaymentProvider.forCompany(company).getInvoice(
    event.data.object.id,
  )

  if (!invoice) {
    console.error('unknown invoice %s', event.data.object.id)
    return
  }

  await paymentService.updateInvoice(
    {
      externalId: invoice.id,
    },
    {
      total: invoice.total,
      totalBeforeDiscount: invoice.subtotal,
      items: invoice.lines.data,
      discounts: invoice.discounts,
      status: invoice.status as any,
    },
  )

  return
}
