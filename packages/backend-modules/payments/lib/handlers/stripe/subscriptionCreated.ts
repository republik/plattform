import Stripe from 'stripe'
import { PaymentService } from '../../payments'
import { Company } from '../../types'
import { getSubscriptionType } from './utils'

export async function processSubscriptionCreated(
  paymentService: PaymentService,
  company: Company,
  event: Stripe.CustomerSubscriptionCreatedEvent,
) {
  const customerId = event.data.object.customer as string

  const userId = await paymentService.getUserIdForCompanyCustomer(
    company,
    customerId,
  )

  if (!userId) {
    throw new Error(`Unknown customer ${customerId}`)
  }

  await paymentService.setupSubscription(userId, {
    company: company,
    type: getSubscriptionType(company),
    externalId: event.data.object.id,
    currentPeriodStart: new Date(event.data.object.current_period_start * 1000),
    currentPeriodEnd: new Date(event.data.object.current_period_end * 1000),
    status: event.data.object.status,
    metadata: event.data.object.metadata,
  })

  return
}
