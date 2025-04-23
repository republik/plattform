import Stripe from 'stripe'
import { Company, SubscriptionArgs } from '../../types'
import { getSubscriptionType, parseStripeDate } from './utils'
import { PaymentProvider } from '../../providers/provider'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { ConfirmGiftSubscriptionTransactionalWorker } from '../../workers/ConfirmGiftSubscriptionTransactionalWorker'
import { REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN } from '../../shop/gifts'
import { SyncMailchimpSetupWorker } from '../../workers/SyncMailchimpSetupWorker'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'

export async function processSubscriptionCreated(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.CustomerSubscriptionCreatedEvent,
) {
  const customerId = event.data.object.customer as string
  const externalSubscriptionId = event.data.object.id as string

  const userId = await ctx.payments.getUserIdForCompanyCustomer(
    company,
    customerId,
  )

  if (!userId) {
    throw new Error(`Unknown customer ${customerId}`)
  }

  if (
    await ctx.payments.getSubscription({ externalId: externalSubscriptionId })
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
  await ctx.payments.setupSubscription(userId, args)

  const isGiftSubscription =
    subscription.metadata[REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN] === 'GIFT'

  const queue = Queue.getInstance()

  // only start mail and mailchimp sync jobs if subscription is created from gift and not checkout
  if (isGiftSubscription) {
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
  }

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
    currentPeriodStart: parseStripeDate(sub.current_period_start),
    currentPeriodEnd: parseStripeDate(sub.current_period_end),
    status: sub.status,
    metadata: sub.metadata,
  }
}
