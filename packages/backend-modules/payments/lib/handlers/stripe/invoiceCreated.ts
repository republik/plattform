import Stripe from 'stripe'
import { PaymentService } from '../../payments'
import { Company, InvoiceArgs } from '../../types'
import { PaymentProvider } from '../../providers/provider'

export async function processInvoiceCreated(
  paymentService: PaymentService,
  company: Company,
  event: Stripe.InvoiceCreatedEvent,
) {
  const customerId = event.data.object.customer as string
  const externalInvocieId = event.data.object.id as string

  const userId = await paymentService.getUserIdForCompanyCustomer(
    company,
    customerId,
  )

  if (!userId) {
    throw new Error(`Unknown customer ${customerId}`)
  }

  if (await paymentService.getInvoice({ externalId: externalInvocieId })) {
    console.log('invoice has already saved; skipping [%s]', externalInvocieId)
    return
  }

  const invoice = await PaymentProvider.forCompany(company).getInvoice(
    externalInvocieId,
  )
  if (!invoice) {
    throw new Error(`Unknown invoice ${event.data.object.id}`)
  }

  const args = mapInvoiceArgs(company, invoice)
  await paymentService.saveInvoice(userId, args)

  return
}

export function mapInvoiceArgs(
  company: Company,
  invoice: Stripe.Invoice,
): InvoiceArgs {
  return {
    total: invoice.total,
    totalBeforeDiscount: invoice.subtotal,
    company: company,
    items: invoice.lines.data,
    discounts: invoice.discounts,
    metadata: invoice.metadata,
    externalId: invoice.id,
    periodStart: new Date(invoice.period_start * 1000),
    periodEnd: new Date(invoice.period_end * 1000),
    status: invoice.status as any,
    externalSubscriptionId: invoice.subscription as string,
  }
}
