import Stripe from 'stripe'
import { Company } from '../../types'
import { PaymentService } from '../../payments'
import { PaymentProvider } from '../../providers/provider'
import { isPledgeBased } from './utils'

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
    console.error(`unknown invoice ${event.data.object.id}`)
    return
  }

  if (!invoice.subscription) {
    console.error(
      'Only subscription invoices are supported invoice %s',
      event.data.object.id,
    )
    return
  }

  const sub = await PaymentProvider.forCompany(company).getSubscription(
    invoice.subscription as string,
  )
  if (isPledgeBased(sub?.metadata)) {
    console.log(`pledge invoice event [${event.id}]; skipping`)
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
