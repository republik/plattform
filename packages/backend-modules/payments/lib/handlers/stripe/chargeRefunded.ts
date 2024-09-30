import Stripe from 'stripe'
import { PaymentService } from '../../payments'
import { Company } from '../../types'
import { PaymentProvider } from '../../providers/provider'

export async function processChargeRefunded(
  paymentService: PaymentService,
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
  await paymentService.updateCharge({ externalId: charge.id }, args)
}

export function mapChargeUpdateArgs(charge: Stripe.Charge) {
  return {
    paid: charge.paid,
    status: charge.status,
    amount: charge.amount,
    amountCaptured: charge.amount_captured,
    amountRefunded: charge.amount_refunded,
    fullyRefunded: charge.refunded,
  }
}
