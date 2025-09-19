import { PgDb } from 'pogi'
import { PaymentService } from './PaymentService'
import { Subscription } from '../types'
import { BillingRepo } from '../database/BillingRepo'
import { parseStripeDate } from '../handlers/stripe/utils'
import { User } from '@orbiting/backend-modules-types'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { SubscriptionType } from '../types'
import { SlackNotifierWorker } from '../workers/SlackNotifer'
import { t } from '@orbiting/backend-modules-translate'
import {
  CancallationDetails,
  CancelationRepo,
  DBCancallationDetails,
} from '../database/CancelationRepo'

export type CancellationAction = 'cancelSubscription' | 'reactivateSubscription'

interface SubscriptionCancelationStatusNotifier {
  notify(
    action: CancellationAction,
    actor: User,
    user: User,
    sub: Subscription,
    details?: DBCancallationDetails,
  ): Promise<void>
}

export class CancellationService {
  private readonly paymentService: PaymentService
  private billingRepo: BillingRepo
  private cancelationRepo: CancelationRepo
  private readonly db: PgDb
  private readonly notifiers: SubscriptionCancelationStatusNotifier[]

  constructor(
    paymentService: PaymentService,
    db: PgDb,
    notifiers: SubscriptionCancelationStatusNotifier[] = [
      new CancallationSlackNotifier(),
    ],
  ) {
    this.paymentService = paymentService
    this.billingRepo = new BillingRepo(db)
    this.cancelationRepo = new CancelationRepo(db)
    this.db = db
    this.notifiers = notifiers
  }

  async getCancellationDetails(
    sub: Subscription,
  ): Promise<CancallationDetails> {
    const cancelation =
      await this.db.payments.subscriptionCancellations.findFirst(
        {
          subscriptionId: sub.id,
        },
        {
          orderBy: {
            createdAt: 'desc',
          },
        },
      )
    return cancelation
  }

  async cancelSubscription(
    actor: User,
    owner: User,
    sub: Subscription,
    details: CancallationDetails,
    immediately: boolean = false,
  ): Promise<Subscription> {
    const dbDetails = await this.cancelationRepo.insertCancelation(
      sub.id,
      details,
    )

    const updatedStripeSubscription = immediately
      ? await this.paymentService.deleteSubscription(
          sub.company,
          sub.externalId,
        )
      : await this.paymentService.updateSubscription(
          sub.company,
          sub.externalId,
          {
            cancel_at_period_end: true,
          },
        )

    const updatedSubscription = await this.billingRepo.updateSubscription(
      { id: sub.id },
      {
        currentPeriodStart: parseStripeDate(
          updatedStripeSubscription.items.data[0].current_period_start,
        ),
        currentPeriodEnd: parseStripeDate(
          updatedStripeSubscription.items.data[0].current_period_end,
        ),
        status: updatedStripeSubscription.status,
        cancelAt: parseStripeDate(updatedStripeSubscription.cancel_at),
        canceledAt: parseStripeDate(updatedStripeSubscription.canceled_at),
        cancelAtPeriodEnd: updatedStripeSubscription.cancel_at_period_end,
        endedAt: parseStripeDate(updatedStripeSubscription.ended_at),
      },
    )

    await Promise.all(
      this.notifiers.map((n) =>
        n.notify(
          'cancelSubscription',
          actor,
          owner,
          updatedSubscription,
          dbDetails,
        ),
      ),
    )

    return updatedSubscription
  }

  async revokeCancellation(
    actor: User,
    user: User,
    sub: Subscription,
  ): Promise<Subscription> {
    const dbDetails = await this.cancelationRepo.revokeLatestCancelation(sub.id)

    const updatedStripeSubscription =
      await this.paymentService.updateSubscription(
        sub.company,
        sub.externalId,
        {
          cancel_at_period_end: false,
        },
      )

    const updatedSubscrption = await this.billingRepo.updateSubscription(
      { id: sub.id },
      {
        currentPeriodStart: parseStripeDate(
          updatedStripeSubscription.items.data[0].current_period_start,
        ),
        currentPeriodEnd: parseStripeDate(
          updatedStripeSubscription.items.data[0].current_period_end,
        ),
        status: updatedStripeSubscription.status,
        cancelAt: parseStripeDate(updatedStripeSubscription.cancel_at),
        canceledAt: parseStripeDate(updatedStripeSubscription.canceled_at),
        cancelAtPeriodEnd: updatedStripeSubscription.cancel_at_period_end,
        endedAt: parseStripeDate(updatedStripeSubscription.ended_at),
      },
    )

    if (dbDetails) {
      await Promise.all(
        this.notifiers.map((n) =>
          n.notify(
            'reactivateSubscription',
            actor,
            user,
            updatedSubscrption,
            dbDetails,
          ),
        ),
      )
    }

    return updatedSubscrption
  }
}

export class CancallationSlackNotifier
  implements SubscriptionCancelationStatusNotifier
{
  private readonly queue: Queue
  private readonly adminBaseUrl?: string
  private readonly channel?: string

  constructor() {
    this.queue = Queue.getInstance()
    this.adminBaseUrl = process.env.ADMIN_FRONTEND_BASE_URL
    this.channel = process.env.SLACK_CHANNEL_ADMIN
  }

  async notify(
    action: CancellationAction,
    actor: User,
    user: User,
    subscription: Subscription,
    details: DBCancallationDetails,
  ): Promise<void> {
    if (!this.channel?.length || !this.adminBaseUrl?.length) {
      console.error(
        'Can not send slack message, missing channel or adminBaseUrl',
      )
      return
    }

    this.queue.send<SlackNotifierWorker>('slack:noifier', {
      $version: 'v1',
      channel: this.channel,
      message: this.formatMessage(
        action,
        actor,
        user,
        subscription.type,
        details,
      ),
    })
    return
  }

  formatMessage(
    action: 'cancelSubscription' | 'reactivateSubscription',
    actor: User,
    user: User,
    subscriptionType: SubscriptionType,
    details?: DBCancallationDetails,
  ): string {
    switch (action) {
      case 'cancelSubscription':
        return `*${user.name}* (${user.email}): ${
          user.id !== actor.id ? `${action} (support)` : `${action}`
        } (${subscriptionType}) ${[
          details?.category &&
            `Category: ${t(
              `api/membership/cancel/category/${details.category}`,
            )}`,
          details?.reason,
        ]
          .filter(Boolean)
          .join('\n')}

${this.adminBaseUrl}/users/${user.id}
`
      case 'reactivateSubscription':
        return `*${user.name}* (${user.email}): ${
          user.id !== actor.id ? `${action} (support)` : `${action}`
        } (${subscriptionType})
${this.adminBaseUrl}/users/${user.id}
`
    }
  }
}
