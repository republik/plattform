import Stripe from 'stripe'
import { Company } from '../../types'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { NoticeEndedTransactionalWorker } from '../../workers/NoticeEndedTransactionalWorker'
import { SyncMailchimpEndedWorker } from '../../workers/SyncMailchimpEndedWorker'
import { parseStripeDate } from './utils'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'

export async function processSubscriptionDeleted(
  ctx: PaymentWebhookContext,
  _company: Company,
  event: Stripe.CustomerSubscriptionDeletedEvent,
) {
  await ctx.payments.disableSubscription(
    { externalId: event.data.object.id },
    {
      endedAt: parseStripeDate(event.data.object.ended_at || 0),
      canceledAt: parseStripeDate(event.data.object.canceled_at || 0),
    },
  )

  const customerId = event.data.object.customer as string

  const userId = await ctx.payments.getUserIdForCompanyCustomer(
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
