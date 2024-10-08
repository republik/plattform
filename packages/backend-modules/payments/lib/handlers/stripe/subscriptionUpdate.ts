import Stripe from 'stripe'
import { PaymentService } from '../../payments'
import { Company } from '../../types'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { ConfirmCancelTransactionalWorker } from '../../workers/ConfirmCancelTransactionalWorker'
import { SyncMailchimpUpdateWorker } from '../../workers/SyncMailchimpUpdateWorker'
import { ConfirmRevokeCancellationTransactionalWorker } from '../../workers/ConfirmRevokeCancellationTransactionalWorker'

export async function processSubscriptionUpdate(
  paymentService: PaymentService,
  company: Company,
  event: Stripe.CustomerSubscriptionUpdatedEvent,
) {
  const cancelAt = event.data.object.cancel_at
  const canceledAt = event.data.object.canceled_at
  const cancellationComment = event.data.object.cancellation_details?.comment
  const cancellationFeedback = event.data.object.cancellation_details?.feedback
  const cancellationReason = event.data.object.cancellation_details?.reason

  await paymentService.updateSubscription({
    company: company,
    externalId: event.data.object.id,
    currentPeriodStart: new Date(event.data.object.current_period_start * 1000),
    currentPeriodEnd: new Date(event.data.object.current_period_end * 1000),
    status: event.data.object.status,
    metadata: event.data.object.metadata,
    cancelAt:
      typeof cancelAt === 'number'
        ? new Date(cancelAt * 1000)
        : (cancelAt as null | undefined),
    canceledAt:
      typeof canceledAt === 'number'
        ? new Date(canceledAt * 1000)
        : (cancelAt as null | undefined),
    cancellationComment:
      typeof cancellationComment === 'string' ? cancellationComment : null,
    cancellationFeedback:
      typeof cancellationFeedback === 'string' ? cancellationFeedback : null,
    cancellationReason:
      typeof cancellationReason === 'string' ? cancellationReason : null,
    cancelAtPeriodEnd: event.data.object.cancel_at_period_end,
  })

  const hasPeriodChanged = !!event.data.previous_attributes?.current_period_end

  const previousCanceledAt = event.data.previous_attributes?.canceled_at
  const revokedCancellationDate =
    typeof previousCanceledAt === 'number'
      ? new Date(previousCanceledAt * 1000)
      : (previousCanceledAt as null | undefined)
  const isCancellationRevoked = !cancelAt && !!revokedCancellationDate

  if (hasPeriodChanged) {
    const customerId = event.data.object.customer as string

    const userId = await paymentService.getUserIdForCompanyCustomer(
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

  if (isCancellationRevoked) {
    const customerId = event.data.object.customer as string

    const userId = await paymentService.getUserIdForCompanyCustomer(
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

  if (cancelAt) {
    const customerId = event.data.object.customer as string

    const userId = await paymentService.getUserIdForCompanyCustomer(
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
}
