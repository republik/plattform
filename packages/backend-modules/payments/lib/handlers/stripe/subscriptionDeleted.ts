import Stripe from 'stripe'
import { PaymentService } from '../../payments'
import { Company } from '../../types'

export async function processSubscriptionDeleted(
  paymentService: PaymentService,
  _company: Company,
  event: Stripe.CustomerSubscriptionDeletedEvent,
) {
  const endTimestamp = (event.data.object.ended_at || 0) * 1000
  const canceledAtTimestamp = (event.data.object.canceled_at || 0) * 1000

  await paymentService.disableSubscription(
    { externalId: event.data.object.id },
    {
      endedAt: new Date(endTimestamp),
      canceledAt: new Date(canceledAtTimestamp),
    },
  )

  return
}
