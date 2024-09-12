import Stripe from 'stripe'
import { PaymentService } from '../../payments'
import { Company } from '../../types'

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
