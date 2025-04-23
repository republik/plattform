import Stripe from 'stripe'
import { Company } from '../../types'
import { PaymentProvider } from '../../providers/provider'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'

export async function processChargeRefunded(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.ChargeRefundedEvent,
) {
  const charge = await PaymentProvider.forCompany(company).getCharge(
    event.data.object.id,
  )

  if (!charge) {
    console.error('charge not found')
    return
  }

  const args = mapChargeUpdateArgs(charge)
  await ctx.payments.updateCharge({ externalId: charge.id }, args)
}

type ChargRefundArgs = {
  paid: boolean
  status: string
  amount: number
  amountCaptured: number
  amountRefunded: number
  fullyRefunded: boolean
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
