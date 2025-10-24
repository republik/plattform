import Stripe from 'stripe'
import { Company, PaymentWorkflow } from '../../types'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { ConfirmCancelTransactionalWorker } from '../../workers/ConfirmCancelTransactionalWorker'
import { SyncMailchimpUpdateWorker } from '../../workers/SyncMailchimpUpdateWorker'
import { ConfirmRevokeCancellationTransactionalWorker } from '../../workers/ConfirmRevokeCancellationTransactionalWorker'
import { ConfirmGiftAppliedTransactionalWorker } from '../../workers/ConfirmGiftAppliedTransactionalWorker'
import { getConfig } from '../../config'
import { parseStripeDate } from './utils'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'
import { CancellationService } from '../../services/CancellationService'
import { PaymentService } from '../../services/PaymentService'
import { SubscriptionService } from '../../services/SubscriptionService'
import { CustomerInfoService } from '../../services/CustomerInfoService'
import { getAboPriceItem } from '../../shop/utils'

class SubscriptionUpdatedWorkflow
  implements PaymentWorkflow<Stripe.CustomerSubscriptionUpdatedEvent>
{
  constructor(
    protected readonly queue: Queue,
    protected readonly subscriptionService: SubscriptionService,
    protected readonly customerInfoService: CustomerInfoService,
    protected readonly paymentService: PaymentService,
    protected readonly cancellationService: CancellationService,
  ) {}

  async run(
    company: Company,
    event: Stripe.CustomerSubscriptionUpdatedEvent,
  ): Promise<any> {
    const cancelAt = event.data.object.cancel_at
    const canceledAt = event.data.object.canceled_at

    const appliedVouchers = event.data.object.discounts
    const previousVouchers = event.data.previous_attributes?.discounts
    const discountCode = event.data.object.discounts[0] as string

    const sub = await this.subscriptionService.getSubscription({
      externalId: event.data.object.id,
    })
    if (!sub) {
      throw new Error('Unknown subscription')
    }

    const cancellationReason =
      await this.cancellationService.getCancellationDetails(sub)

    const subItem = event.data.object.items.data.find(getAboPriceItem)

    if (!subItem) {
      throw new Error('Subscription does not contain an ABO item')
    }

    await this.subscriptionService.updateSubscription({
      company: company,
      externalId: event.data.object.id,
      currentPeriodStart: parseStripeDate(subItem.current_period_start),
      currentPeriodEnd: parseStripeDate(subItem.current_period_end),
      status: event.data.object.status,
      metadata: event.data.object.metadata,
      cancelAt: parseStripeDate(cancelAt),
      canceledAt: parseStripeDate(canceledAt),
      cancelAtPeriodEnd: event.data.object.cancel_at_period_end,
    })

    const hasPeriodChanged =
      !!event.data.previous_attributes?.items?.data.find(getAboPriceItem)

    const previousCanceledAt = event.data.previous_attributes?.canceled_at
    const revokedCancellationDate = parseStripeDate(previousCanceledAt)
    const isCancellationRevoked = !cancelAt && !!revokedCancellationDate

    if (hasPeriodChanged) {
      const customerId = event.data.object.customer as string

      const userId = await this.customerInfoService.getUserIdForCompanyCustomer(
        company,
        customerId,
      )
      if (!userId) {
        throw Error(`User for ${customerId} does not exists`)
      }
      const queue = this.queue
      await Promise.all([
        queue.send<SyncMailchimpUpdateWorker>(
          'payments:mailchimp:sync:update',
          {
            $version: 'v1',
            eventSourceId: event.id,
            userId: userId,
          },
        ),
      ])
    }

    if (
      isCancellationRevoked &&
      cancellationReason.suppressConfirmation === false
    ) {
      const customerId = event.data.object.customer as string

      const userId = await this.customerInfoService.getUserIdForCompanyCustomer(
        company,
        customerId,
      )
      if (!userId) {
        throw Error(`User for ${customerId} does not exists`)
      }
      const queue = this.queue
      await Promise.all([
        queue.send<ConfirmRevokeCancellationTransactionalWorker>(
          'payments:transactional:confirm:revoke_cancellation',
          {
            $version: 'v1',
            eventSourceId: event.id,
            userId: userId,
            revokedCancellationDate: revokedCancellationDate,
          },
        ),
        queue.send<SyncMailchimpUpdateWorker>(
          'payments:mailchimp:sync:update',
          {
            $version: 'v1',
            eventSourceId: event.id,
            userId: userId,
          },
        ),
      ])
    }

    if (cancelAt && cancellationReason.suppressConfirmation === false) {
      const customerId = event.data.object.customer as string

      const userId = await this.customerInfoService.getUserIdForCompanyCustomer(
        company,
        customerId,
      )
      if (!userId) {
        throw Error(`User for ${customerId} does not exists`)
      }

      await Promise.all([
        this.queue.send<ConfirmCancelTransactionalWorker>(
          'payments:transactional:confirm:cancel',
          {
            $version: 'v1',
            eventSourceId: event.id,
            userId: userId,
          },
        ),
        this.queue.send<SyncMailchimpUpdateWorker>(
          'payments:mailchimp:sync:update',
          {
            $version: 'v1',
            eventSourceId: event.id,
            userId: userId,
          },
        ),
      ])
    }

    const isGiftUpdate = hasGiftVoucherBeenApplied(
      previousVouchers,
      appliedVouchers,
      discountCode,
    )
    if (isGiftUpdate) {
      const customerId = event.data.object.customer as string
      const userId = await this.customerInfoService.getUserIdForCompanyCustomer(
        company,
        customerId,
      )
      if (!userId) {
        throw Error(`User for ${customerId} does not exists`)
      }

      const queue = this.queue
      await Promise.all([
        queue.send<ConfirmGiftAppliedTransactionalWorker>(
          'payments:transactional:confirm:gift:applied',
          {
            $version: 'v1',
            eventSourceId: event.id,
            userId: userId,
          },
        ),
        queue.send<SyncMailchimpUpdateWorker>(
          'payments:mailchimp:sync:update',
          {
            $version: 'v1',
            eventSourceId: event.id,
            userId: userId,
          },
        ),
      ])
    }
  }
}

export async function processSubscriptionUpdate(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.CustomerSubscriptionUpdatedEvent,
) {
  const paymentService = new PaymentService()

  return new SubscriptionUpdatedWorkflow(
    Queue.getInstance(),
    new SubscriptionService(ctx.pgdb),
    new CustomerInfoService(ctx.pgdb),
    paymentService,
    new CancellationService(paymentService, ctx.pgdb),
  ).run(company, event)
}

function hasGiftVoucherBeenApplied(
  previousDiscounts: (string | Stripe.Discount)[] | undefined,
  currentDiscounts: (string | Stripe.Discount)[],
  discountCode: string | undefined,
): boolean {
  const hasNewVoucher =
    !!previousDiscounts &&
    !!currentDiscounts &&
    previousDiscounts.length < currentDiscounts.length
  const isGiftVoucher =
    !!discountCode &&
    [
      getConfig().REPUBLIK_3_MONTH_GIFT_COUPON,
      getConfig().PROJECT_R_YEARLY_GIFT_COUPON,
    ].includes(discountCode)
  return hasNewVoucher && isGiftVoucher
}
