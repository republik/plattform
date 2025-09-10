import Stripe from 'stripe'
import { Company, PaymentWorkflow } from '../../types'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'
import { PaymentService } from '../../services/PaymentService'
import { InvoiceService } from '../../services/InvoiceService'
import { mapChargeArgs } from './invoicePaymentSucceeded'

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
    const existingCharge = await this.invoiceService.getCharge({
      externalId: chargeId,
    })
    if (existingCharge) {
      // do nothing
      return
    }

    // check if there's an order with this payment intent
    // avoids saving charges for books, card games, etc
    const paymentIntent = charge.payment_intent as string
    const existingOrder = await this.invoiceService.getOrderByPaymentIntent(
      paymentIntent,
    )
    if (existingOrder) {
      const chargeArgs = mapChargeArgs(company, null, charge)
      await this.invoiceService.saveCharge(chargeArgs)
    } else {
      // try again
      throw new Error(`order with payment intent ${paymentIntent} could not be found, try again`)
    }

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
