import Stripe from 'stripe'
import { Company } from '../../types'
import { PaymentService } from '../../payments'

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
