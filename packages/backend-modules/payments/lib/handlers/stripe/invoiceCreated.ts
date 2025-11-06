import Stripe from 'stripe'
import { Company, InvoiceArgs, PaymentWorkflow } from '../../types'
import { isPledgeBased, parseStripeDate } from './utils'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'
import { InvoiceService } from '../../services/InvoiceService'
import { PaymentService } from '../../services/PaymentService'
import { CustomerInfoService } from '../../services/CustomerInfoService'
import { getAboPriceItem } from '../../shop/utils'

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

    if (!invoice.parent?.subscription_details?.subscription) {
      console.log(
        `Only subscription invoices currently not supported [${event.id}]`,
      )
      return
    }

    const sub = await this.paymentService.getSubscription(
      company,
      invoice.parent?.subscription_details?.subscription as string,
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
  const subItem = invoice.lines.data.find(getAboPriceItem)

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
    totalTaxAmounts: invoice.total_taxes,
    totalTaxAmount:
      invoice.total_taxes?.reduce((acc, value) => acc + value.amount, 0) || 0,
    company: company,
    items: invoice.lines.data,
    discounts: invoice.discounts,
    metadata: invoice.metadata,
    externalId: invoice.id!,
    periodStart: subItem?.period.start
      ? parseStripeDate(subItem?.period.start)
      : undefined,
    periodEnd: subItem?.period.end
      ? parseStripeDate(subItem?.period.end)
      : undefined,
    status: invoice.status as any,
    externalSubscriptionId: invoice.parent?.subscription_details
      ?.subscription as string,
  }
}
