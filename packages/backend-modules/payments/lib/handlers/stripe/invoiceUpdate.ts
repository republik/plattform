import Stripe from 'stripe'
import { Company, PaymentWorkflow } from '../../types'
import { isPledgeBased } from './utils'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'
import { InvoiceService } from '../../services/InvoiceService'
import { PaymentService } from '../../services/PaymentService'

type InvoiceUpdatedEvent =
  | Stripe.InvoiceUpdatedEvent
  | Stripe.InvoiceFinalizedEvent
  | Stripe.InvoiceVoidedEvent
  | Stripe.InvoicePaidEvent

export class InvoiceUpdatedWorkflow
  implements PaymentWorkflow<InvoiceUpdatedEvent>
{
  constructor(
    protected readonly paymentService: PaymentService,
    protected readonly invoiceService: InvoiceService,
  ) {}

  async run(company: Company, event: InvoiceUpdatedEvent): Promise<any> {
    const stripeInvoiceId = event.data.object.id

    const invoice = await this.paymentService.getInvoice(
      company,
      stripeInvoiceId,
    )

    if (!invoice) {
      console.error(`unknown invoice ${stripeInvoiceId}`)
      return
    }

    if (!invoice.subscription) {
      console.error(
        'Only subscription invoices are supported invoice %s',
        stripeInvoiceId,
      )
      return
    }

    const sub = await this.paymentService.getSubscription(
      company,
      invoice.subscription as string,
    )
    if (isPledgeBased(sub?.metadata)) {
      console.log(`pledge invoice event [${event.id}]; skipping`)
    }

    await this.invoiceService.updateInvoice(
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
}

export async function processInvoiceUpdated(
  ctx: PaymentWebhookContext,
  company: Company,
  event:
    | Stripe.InvoiceUpdatedEvent
    | Stripe.InvoiceFinalizedEvent
    | Stripe.InvoiceVoidedEvent
    | Stripe.InvoicePaidEvent,
) {
  return new InvoiceUpdatedWorkflow(
    new PaymentService(),
    new InvoiceService(ctx.pgdb),
  ).run(company, event)
}
