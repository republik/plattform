import Stripe from 'stripe'
import { PaymentService } from '../../payments'
import { Company } from '../../types'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { NoticeEndedTransactionalWorker } from '../../workers/NoticeEndedTransactionalWorker'
import { SyncMailchimpEndedWorker } from '../../workers/SyncMailchimpEndedWorker'
import {
  getMailSettings,
  REPUBLIK_PAYMENTS_MAIL_SETTINGS_KEY,
} from '../../mail-settings'
import { secondsToMilliseconds } from './utils'
import { REPUBLIK_PAYMENTS_CANCEL_REASON } from '../../shop/gifts'

export async function processSubscriptionDeleted(
  paymentService: PaymentService,
  _company: Company,
  event: Stripe.CustomerSubscriptionDeletedEvent,
) {
  const endTimestamp = secondsToMilliseconds(event.data.object.ended_at || 0)
  const canceledAtTimestamp = secondsToMilliseconds(
    event.data.object.canceled_at || 0,
  )

  await paymentService.disableSubscription(
    { externalId: event.data.object.id },
    {
      endedAt: new Date(endTimestamp),
      canceledAt: new Date(canceledAtTimestamp),
    },
    event.data.object.metadata[REPUBLIK_PAYMENTS_CANCEL_REASON] === 'UPGRADE'
      ? { keepMembership: true }
      : undefined,
  )

  const customerId = event.data.object.customer as string

  const userId = await paymentService.getUserIdForCompanyCustomer(
    _company,
    customerId,
  )
  if (!userId) {
    throw Error(`User for ${customerId} does not exists`)
  }

  const mailSettings = getMailSettings(
    event.data.object.metadata[REPUBLIK_PAYMENTS_MAIL_SETTINGS_KEY],
  )

  if (mailSettings['notice:ended']) {
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
  }

  return
}
