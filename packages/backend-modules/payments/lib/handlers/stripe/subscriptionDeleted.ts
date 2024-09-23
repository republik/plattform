import Stripe from 'stripe'
import { PaymentService } from '../../payments'
import { Company } from '../../types'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { NoticeEndedTransactionalWorker } from '../../workers/NoticeEndedTransactionalWorker'
import { SyncMailchimpEndedWorker } from '../../workers/SyncMailchimpEndedWorker'

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

  const customerId = event.data.object.customer as string

  const userId = await paymentService.getUserIdForCompanyCustomer(
    _company,
    customerId,
  )
  if (!userId) {
    throw Error(`User for ${customerId} does not exists`)
  }

  const queue = Queue.getInstance()

  await Promise.all([
    queue.send<NoticeEndedTransactionalWorker>(
      'payments:transactional:notice:ended',
      {
        $version: 'v1',
        eventSourceId: event.id,
        userId: userId,
      },
    ),
    queue.send<SyncMailchimpEndedWorker>('payments:mailchimp:sync:ended', {
      $version: 'v1',
      eventSourceId: event.id,
      userId: userId,
    }),
  ])

  return
}
