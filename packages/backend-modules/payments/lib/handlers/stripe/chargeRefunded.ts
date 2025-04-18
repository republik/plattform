import Stripe from 'stripe'
import { PaymentInterface } from '../../payments'
import { Company } from '../../types'
import { PaymentProvider } from '../../providers/provider'

export async function processChargeRefunded(
  payments: PaymentInterface,
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
  await payments.updateCharge({ externalId: charge.id }, args)
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
