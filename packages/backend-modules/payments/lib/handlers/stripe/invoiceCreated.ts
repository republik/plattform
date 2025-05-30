import Stripe from 'stripe'
import { Company, InvoiceArgs, PaymentWorkflow } from '../../types'
import { isPledgeBased, parseStripeDate } from './utils'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'
import { InvoiceService } from '../../services/InvoiceService'
import { PaymentService } from '../../services/PaymentService'
import { CustomerInfoService } from '../../services/CustomerInfoService'

class InvoiceCreatedWorkflow
  implements PaymentWorkflow<Stripe.InvoiceCreatedEvent>
{
  constructor(
    protected readonly paymentService: PaymentService,
    protected readonly invoiceService: InvoiceService,
    protected readonly customerInfoService: CustomerInfoService,
  ) {}

  async run(company: Company, event: Stripe.InvoiceCreatedEvent): Promise<any> {
    const customerId = event.data.object.customer as string
    const externalInvoiceId = event.data.object.id as string

    const userId = await this.customerInfoService.getUserIdForCompanyCustomer(
      company,
      customerId,
    )

    if (!userId) {
      throw new Error(`Unknown customer ${customerId}`)
    }

    if (
      await this.invoiceService.getInvoice({ externalId: externalInvoiceId })
    ) {
      console.log(`invoice has already saved; skipping [${externalInvoiceId}]`)
      return
    }

    const invoice = await this.paymentService.getInvoice(
      company,
      externalInvoiceId,
    )
    if (!invoice) {
      throw new Error(`Unknown invoice ${externalInvoiceId}`)
    }

    if (!invoice.subscription) {
      console.log(
        `Only subscription invoices currently not supported [${event.id}]`,
      )
      return
    }

    const sub = await this.paymentService.getSubscription(
      company,
      invoice.subscription as string,
    )

    if (isPledgeBased(sub?.metadata)) {
      console.log(`pledge invoice event [${event.id}]; skipping`)
      return
    }

    const args = mapInvoiceArgs(company, invoice)
    await this.invoiceService.saveInvoice(userId, args)

    return
  }
}

export async function processInvoiceCreated(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.InvoiceCreatedEvent,
) {
  return new InvoiceCreatedWorkflow(
    new PaymentService(),
    new InvoiceService(ctx.pgdb),
    new CustomerInfoService(ctx.pgdb),
  ).run(company, event)
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
