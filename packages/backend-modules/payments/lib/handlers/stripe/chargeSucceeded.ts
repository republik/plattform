import Stripe from 'stripe'
import { Company, PaymentWorkflow } from '../../types'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'
import { PaymentService } from '../../services/PaymentService'
import { InvoiceService } from '../../services/InvoiceService'
import { mapChargeArgs } from './invoicePaymentSucceeded'

type ChargeArgs = {
  paid: boolean
  status: string
  amount: number
  amountCaptured: number
  amountRefunded: number
  fullyRefunded: boolean
}

export class ChargeSucceededWorkflow
  implements PaymentWorkflow<Stripe.ChargeSucceededEvent>
{
  constructor(
    protected readonly paymentService: PaymentService,
    protected readonly invoiceService: InvoiceService,
  ) {}

  async run(
    company: Company,
    event: Stripe.ChargeSucceededEvent,
  ): Promise<any> {
    const chargeId = event.data.object.id

    const charge = await this.paymentService.getCharge(company, chargeId)

    if (!charge) {
      console.error('charge not found')
      return
    }

    // check if charge already exists (from payment etc)
    // if not save new charge
    const existingCharge = await this.invoiceService.getCharge({ externalId: chargeId })
    if (existingCharge) {
      // do nothing
      return
    }

    const chargeArgs = mapChargeArgs(company, null, charge)
    await this.invoiceService.saveCharge(chargeArgs)

    return
  }
}

export async function processChargeSucceeded(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.ChargeSucceededEvent,
) {
  return new ChargeSucceededWorkflow(
    new PaymentService(),
    new InvoiceService(ctx.pgdb),
  ).run(company, event)
}
