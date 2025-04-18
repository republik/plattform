import Stripe from 'stripe'
import { PaymentInterface } from '../../payments'
import { Company, InvoiceArgs } from '../../types'
import { PaymentProvider } from '../../providers/provider'
import { isPledgeBased, parseStripeDate } from './utils'

export async function processInvoiceCreated(
  payments: PaymentInterface,
  company: Company,
  event: Stripe.InvoiceCreatedEvent,
) {
  const customerId = event.data.object.customer as string
  const externalInvoiceId = event.data.object.id as string

  const userId = await payments.getUserIdForCompanyCustomer(company, customerId)

  if (!userId) {
    throw new Error(`Unknown customer ${customerId}`)
  }

  if (await payments.getInvoice({ externalId: externalInvoiceId })) {
    console.log(`invoice has already saved; skipping [${externalInvoiceId}]`)
    return
  }

  const invoice = await PaymentProvider.forCompany(company).getInvoice(
    externalInvoiceId,
  )
  if (!invoice) {
    throw new Error(`Unknown invoice ${event.data.object.id}`)
  }

  if (!invoice.subscription) {
    console.log(
      `Only subscription invoices currently not supported [${event.id}]`,
    )
    return
  }

  const sub = await PaymentProvider.forCompany(company).getSubscription(
    invoice.subscription as string,
  )

  if (isPledgeBased(sub?.metadata)) {
    console.log(`pledge invoice event [${event.id}]; skipping`)
    return
  }

  const args = mapInvoiceArgs(company, invoice)
  await payments.saveInvoice(userId, args)

  return
}

export function mapInvoiceArgs(
  company: Company,
  invoice: Stripe.Invoice,
): InvoiceArgs {
  return {
    total: invoice.total,
    totalBeforeDiscount: invoice.subtotal,
    totalDiscountAmount:
      invoice.total_discount_amounts?.reduce(
        (acc, value) => acc + value.amount,
        0,
      ) || 0,
    totalDiscountAmounts: invoice.total_discount_amounts,
    totalExcludingTax: invoice.total_excluding_tax || 0,
    totalTaxAmounts: invoice.total_tax_amounts,
    totalTaxAmount: invoice.total_tax_amounts.reduce(
      (acc, value) => acc + value.amount,
      0,
    ),
    company: company,
    items: invoice.lines.data,
    discounts: invoice.discounts,
    metadata: invoice.metadata,
    externalId: invoice.id,
    periodStart: parseStripeDate(invoice.lines.data[0].period.start),
    periodEnd: parseStripeDate(invoice.lines.data[0].period.end),
    status: invoice.status as any,
    externalSubscriptionId: invoice.subscription as string,
  }
}
