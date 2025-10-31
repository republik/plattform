import Stripe from 'stripe'
import { Company, PaymentWorkflow, SubscriptionArgs } from '../../types'
import { getSubscriptionType, parseStripeDate } from './utils'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { ConfirmGiftSubscriptionTransactionalWorker } from '../../workers/ConfirmGiftSubscriptionTransactionalWorker'
import { SyncMailchimpSetupWorker } from '../../workers/SyncMailchimpSetupWorker'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'
import { SubscriptionService } from '../../services/SubscriptionService'
import { CustomerInfoService } from '../../services/CustomerInfoService'
import { PaymentService } from '../../services/PaymentService'
import { ConfirmUpgradeSubscriptionTransactionalWorker } from '../../workers/ConfirmUpgradeSubscriptionTransactionalWorker'
import {
  REPUBLIK_PAYMENTS_INTERNAL_REF as INTERNAL_REF,
  REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN as SUBSCRIPTION_ORIGIN,
  REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN_TYPE_UPGRADE as ORIGIN_UPGRADE,
  REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN_TYPE_GIFT as ORIGIN_GIFT,
} from '../../constants'
import { UpgradeService } from '../../services/UpgradeService'

class SubscriptionCreatedWorkflow
  implements PaymentWorkflow<Stripe.CustomerSubscriptionCreatedEvent>
{
  constructor(
    protected readonly paymentService: PaymentService,
    protected readonly customerInfoService: CustomerInfoService,
    protected readonly subscriptionService: SubscriptionService,
    protected readonly upgradeService: UpgradeService,
  ) {}

  async run(
    company: Company,
    event: Stripe.CustomerSubscriptionCreatedEvent,
  ): Promise<any> {
    const customerId = event.data.object.customer as string
    const externalSubscriptionId = event.data.object.id as string

    const userId = await this.customerInfoService.getUserIdForCompanyCustomer(
      company,
      customerId,
    )

    if (!userId) {
      throw new Error(`Unknown customer ${customerId}`)
    }

    if (
      await this.subscriptionService.getSubscription({
        externalId: externalSubscriptionId,
      })
    ) {
      console.log(
        `subscription has already saved; skipping [${externalSubscriptionId}]`,
      )
      return
    }

    const subscription = await this.paymentService.getSubscription(
      company,
      externalSubscriptionId,
    )

    if (!subscription) {
      throw Error('subscription does not exist')
    }

    const args = mapSubscriptionArgs(company, subscription)
    await this.subscriptionService.setupSubscription(userId, args)

    const isGiftSubscription =
      subscription.metadata[SUBSCRIPTION_ORIGIN] === ORIGIN_GIFT

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

    const isUpgrade =
      subscription.metadata[SUBSCRIPTION_ORIGIN] === ORIGIN_UPGRADE

    if (isUpgrade) {
      const upgradeId = subscription.metadata[INTERNAL_REF]

      await Promise.all([
        queue.send<ConfirmUpgradeSubscriptionTransactionalWorker>(
          'payments:transactional:confirm:upgrade:subscription',
          {
            $version: 'v1',
            eventSourceId: event.id,
            userId: userId,
            subscriptionId: subscription.id,
            upgradeId: upgradeId,
            company: company,
          },
        ),
        queue.send<SyncMailchimpSetupWorker>('payments:mailchimp:sync:setup', {
          $version: 'v1',
          eventSourceId: event.id,
          userId: userId,
        }),
        async () => {
          return this.upgradeService.markUpgradeAsResolved(upgradeId)
        },
      ])
    }

    return
  }
}

export async function processSubscriptionCreated(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.CustomerSubscriptionCreatedEvent,
) {
  return new SubscriptionCreatedWorkflow(
    new PaymentService(),
    new CustomerInfoService(ctx.pgdb),
    new SubscriptionService(ctx.pgdb),
    new UpgradeService(ctx.pgdb, ctx.logger),
  ).run(company, event)
}

export function mapSubscriptionArgs(
  company: Company,
  sub: Stripe.Subscription,
): SubscriptionArgs {
  const current_period_start = sub.items.data[0].current_period_start
  const current_period_end = sub.items.data[0].current_period_end

  return {
    company: company,
    type: getSubscriptionType(sub?.items.data[0].price.product as string),
    externalId: sub.id,
    currentPeriodStart: parseStripeDate(current_period_start),
    currentPeriodEnd: parseStripeDate(current_period_end),
    status: sub.status,
    metadata: sub.metadata,
  }
}
