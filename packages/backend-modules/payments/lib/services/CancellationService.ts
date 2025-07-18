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

export type CancallationDetails = {
  category: string
  reason?: string
  suppressConfirmation?: boolean
  suppressWinback?: boolean
  cancelledViaSupport?: boolean
}

export type DBCancallationDetails = CancallationDetails & {
  id: string
  revokedAt: Date | null
  subscriptionId: string
  createdAt: Date
  updatedAt: Date
}

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
    const dbDetails =
      await this.db.payments.subscriptionCancellations.insertAndGet({
        subscriptionId: sub.id,
        ...filterUndefined(details),
      })

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
          updatedStripeSubscription.current_period_start,
        ),
        currentPeriodEnd: parseStripeDate(
          updatedStripeSubscription.current_period_end,
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
    const tx = await this.db.transactionBegin()

    let dbDetails: DBCancallationDetails | undefined

    try {
      const cancelation = await tx.payments.subscriptionCancellations.findFirst(
        {
          subscriptionId: sub.id,
          revokedAt: null,
        },
      )

      if (cancelation) {
        const [data] = await tx.payments.subscriptionCancellations.updateAndGet(
          { id: cancelation.id },
          {
            revokedAt: new Date(),
            updatedAt: new Date(),
          },
        )
        dbDetails = data
      }

      await tx.transactionCommit()
    } catch (e) {
      await tx.transactionRollback()
      throw e
    }

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
          updatedStripeSubscription.current_period_start,
        ),
        currentPeriodEnd: parseStripeDate(
          updatedStripeSubscription.current_period_end,
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

function filterUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>
}
