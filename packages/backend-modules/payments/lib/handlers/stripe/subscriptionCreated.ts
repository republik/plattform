import Stripe from 'stripe'
import { PaymentService } from '../../payments'
import { Company, SubscriptionArgs } from '../../types'
import { getSubscriptionType, secondsToMilliseconds } from './utils'
import { PaymentProvider } from '../../providers/provider'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { ConfirmGiftSubscriptionTransactionalWorker } from '../../workers/ConfirmGiftSubscriptionTransactionalWorker'
import { REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN } from '../../shop/gifts'
import { SyncMailchimpSetupWorker } from '../../workers/SyncMailchimpSetupWorker'

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

  const isGiftSubscription = subscription.metadata[REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN] === 'GIFT'

  if (!isGiftSubscription) {
    // only start mail and mailchimp sync jobs if subscription is created from gift and not checkout
    return
  }

  const queue = Queue.getInstance()

  await Promise.all([
    queue.send<ConfirmGiftSubscriptionTransactionalWorker>(
          'payments:transactional:confirm:gift:subscription',
          {
            $version: 'v1',
            eventSourceId: event.id,
            userId: userId,
          },
        ),
    queue.send<SyncMailchimpSetupWorker>('payments:mailchimp:sync:setup', {
          $version: 'v1',
          eventSourceId: event.id,
          userId: userId,
        }),
  ])

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
    currentPeriodStart: new Date(
      secondsToMilliseconds(sub.current_period_start),
    ),
    currentPeriodEnd: new Date(secondsToMilliseconds(sub.current_period_end)),
    status: sub.status,
    metadata: sub.metadata,
  }
}
