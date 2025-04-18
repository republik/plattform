import Stripe from 'stripe'
import { PaymentInterface } from '../../payments'
import { Company } from '../../types'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { ConfirmCancelTransactionalWorker } from '../../workers/ConfirmCancelTransactionalWorker'
import { SyncMailchimpUpdateWorker } from '../../workers/SyncMailchimpUpdateWorker'
import { ConfirmRevokeCancellationTransactionalWorker } from '../../workers/ConfirmRevokeCancellationTransactionalWorker'
import {
  getMailSettings,
  REPUBLIK_PAYMENTS_MAIL_SETTINGS_KEY,
} from '../../mail-settings'
import { ConfirmGiftAppliedTransactionalWorker } from '../../workers/ConfirmGiftAppliedTransactionalWorker'
import { getConfig } from '../../config'
import { parseStripeDate } from './utils'

export async function processSubscriptionUpdate(
  payments: PaymentInterface,
  company: Company,
  event: Stripe.CustomerSubscriptionUpdatedEvent,
) {
  const mailSettings = getMailSettings(
    event.data.object.metadata[REPUBLIK_PAYMENTS_MAIL_SETTINGS_KEY],
  )
  const cancelAt = event.data.object.cancel_at
  const canceledAt = event.data.object.canceled_at

  const appliedVouchers = event.data.object.discounts
  const previousVouchers = event.data.previous_attributes?.discounts
  const discountCode = event.data.object.discount?.coupon?.id

  await payments.updateSubscription({
    company: company,
    externalId: event.data.object.id,
    currentPeriodStart: parseStripeDate(event.data.object.current_period_start),
    currentPeriodEnd: parseStripeDate(event.data.object.current_period_end),
    status: event.data.object.status,
    metadata: event.data.object.metadata,
    cancelAt: parseStripeDate(cancelAt),
    canceledAt: parseStripeDate(canceledAt),
    cancelAtPeriodEnd: event.data.object.cancel_at_period_end,
  })

  const hasPeriodChanged = !!event.data.previous_attributes?.current_period_end

  const previousCanceledAt = event.data.previous_attributes?.canceled_at
  const revokedCancellationDate = parseStripeDate(previousCanceledAt)
  const isCancellationRevoked = !cancelAt && !!revokedCancellationDate

  if (hasPeriodChanged) {
    const customerId = event.data.object.customer as string

    const userId = await payments.getUserIdForCompanyCustomer(
      company,
      customerId,
    )
    if (!userId) {
      throw Error(`User for ${customerId} does not exists`)
    }
    const queue = Queue.getInstance()
    await Promise.all([
      queue.send<SyncMailchimpUpdateWorker>('payments:mailchimp:sync:update', {
        $version: 'v1',
        eventSourceId: event.id,
        userId: userId,
      }),
    ])
  }

  if (isCancellationRevoked && mailSettings['confirm:revoke_cancellation']) {
    const customerId = event.data.object.customer as string

    const userId = await payments.getUserIdForCompanyCustomer(
      company,
      customerId,
    )
    if (!userId) {
      throw Error(`User for ${customerId} does not exists`)
    }
    const queue = Queue.getInstance()
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
      queue.send<SyncMailchimpUpdateWorker>('payments:mailchimp:sync:update', {
        $version: 'v1',
        eventSourceId: event.id,
        userId: userId,
      }),
    ])
  }

  if (cancelAt && mailSettings['confirm:cancel']) {
    const customerId = event.data.object.customer as string

    const userId = await payments.getUserIdForCompanyCustomer(
      company,
      customerId,
    )
    if (!userId) {
      throw Error(`User for ${customerId} does not exists`)
    }
    const queue = Queue.getInstance()

    await Promise.all([
      queue.send<ConfirmCancelTransactionalWorker>(
        'payments:transactional:confirm:cancel',
        {
          $version: 'v1',
          eventSourceId: event.id,
          userId: userId,
        },
      ),
      queue.send<SyncMailchimpUpdateWorker>('payments:mailchimp:sync:update', {
        $version: 'v1',
        eventSourceId: event.id,
        userId: userId,
      }),
    ])
  }

  const isGiftUpdate = hasGiftVoucherBeenApplied(
    previousVouchers,
    appliedVouchers,
    discountCode,
  )
  if (isGiftUpdate) {
    const customerId = event.data.object.customer as string
    const userId = await payments.getUserIdForCompanyCustomer(
      company,
      customerId,
    )
    if (!userId) {
      throw Error(`User for ${customerId} does not exists`)
    }

    const queue = Queue.getInstance()
    await Promise.all([
      queue.send<ConfirmGiftAppliedTransactionalWorker>(
        'payments:transactional:confirm:gift:applied',
        {
          $version: 'v1',
          eventSourceId: event.id,
          userId: userId,
        },
      ),
      queue.send<SyncMailchimpUpdateWorker>('payments:mailchimp:sync:update', {
        $version: 'v1',
        eventSourceId: event.id,
        userId: userId,
      }),
    ])
  }
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
