import Stripe from 'stripe'
import { PaymentService } from '../../payments'
import { Company, SubscriptionArgs } from '../../types'
import { getSubscriptionType } from './utils'
import { PaymentProvider } from '../../providers/provider'

export async function processSubscriptionCreated(
  paymentService: PaymentService,
  company: Company,
  event: Stripe.CustomerSubscriptionCreatedEvent,
) {
  const customerId = event.data.object.customer as string
  const externalSubscriptionId = event.data.object.id as string

  const userId = await paymentService.getUserIdForCompanyCustomer(
    company,
    customerId,
  )

  if (!userId) {
    throw new Error(`Unknown customer ${customerId}`)
  }

  if (
    await paymentService.getSubscription({ externalId: externalSubscriptionId })
  ) {
    console.log(
      `subscription has already saved; skipping [${externalSubscriptionId}]`,
    )
    return
  }

  const subscription = await PaymentProvider.forCompany(
    company,
  ).getSubscription(externalSubscriptionId)

  if (!subscription) {
    throw Error('subscription does not exist')
  }

  const args = mapSubscriptionArgs(company, subscription)
  await paymentService.setupSubscription(userId, args)

  return
}

export function mapSubscriptionArgs(
  company: Company,
  sub: Stripe.Subscription,
): SubscriptionArgs {
  return {
    company: company,
    type: getSubscriptionType(sub?.items.data[0].price.product as string),
    externalId: sub.id,
    currentPeriodStart: new Date(sub.current_period_start * 1000),
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    status: sub.status,
    metadata: sub.metadata,
  }
}
