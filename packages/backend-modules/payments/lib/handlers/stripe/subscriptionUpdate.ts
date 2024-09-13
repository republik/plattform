import Stripe from 'stripe'
import { PaymentService } from '../../payments'
import { Company } from '../../types'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { ConfirmCancelTransactionalWorker } from '../../workers/ConfirmCancelTransactionalWorker'
import { SyncMailchimpCancelWorker } from '../../workers/SyncMailchimpCancelWorker'


export async function processSubscriptionUpdate(
  paymentService: PaymentService,
  company: Company,
  event: Stripe.CustomerSubscriptionUpdatedEvent,
) {
  const cancelAt = event.data.object.cancel_at
  const canceledAt = event.data.object.canceled_at

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
    cancelAtPeriodEnd: event.data.object.cancel_at_period_end,
  })

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
      queue.send<SyncMailchimpCancelWorker>('payments:mailchimp:sync:cancel', {
        $version: 'v1',
        eventSourceId: event.id,
        userId: userId,
      }),
    ])
  }
}
