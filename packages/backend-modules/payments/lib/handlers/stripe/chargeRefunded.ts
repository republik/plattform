import Stripe from 'stripe'
import { Company, PaymentWorkflow } from '../../types'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'
import { PaymentService } from '../../services/PaymentService'
import { InvoiceService } from '../../services/InvoiceService'

type ChargRefundArgs = {
  paid: boolean
  status: string
  amount: number
  amountCaptured: number
  amountRefunded: number
  fullyRefunded: boolean
}

export class ChargeRefundedWorkflow
  implements PaymentWorkflow<Stripe.ChargeRefundedEvent>
{
  constructor(
    protected readonly paymentService: PaymentService,
    protected readonly invoiceService: InvoiceService,
  ) {}

  async run(company: Company, event: Stripe.ChargeRefundedEvent): Promise<any> {
    const chargeId = event.data.object.id

    const charge = await this.paymentService.getCharge(company, chargeId)

    if (!charge) {
      console.error('charge not found')
      return
    }

    const args = mapChargeUpdateArgs(charge)
    await this.invoiceService.updateCharge({ externalId: charge.id }, args)

    return
  }
}

export async function processChargeRefunded(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.ChargeRefundedEvent,
) {
  return new ChargeRefundedWorkflow(
    new PaymentService(),
    new InvoiceService(ctx.pgdb),
  ).run(company, event)
}

export function mapChargeUpdateArgs(charge: Stripe.Charge): ChargRefundArgs {
  return {
    paid: charge.paid,
    status: charge.status,
    amount: charge.amount,
    amountCaptured: charge.amount_captured,
    amountRefunded: charge.amount_refunded,
    fullyRefunded: charge.refunded,
  }
}
