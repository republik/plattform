import { PgDb } from 'pogi'
import { PaymentService } from './PaymentService'
import { Subscription } from '../types'
import { BillingRepo } from '../database/BillingRepo'
import { parseStripeDate } from '../handlers/stripe/utils'

export type CancallationDetails = {
  category: string
  reason?: string
  suppressConfirmation?: boolean
  suppressWinback?: boolean
  cancelledViaSupport?: boolean
}

export class CancellationService {
  private readonly paymentService: PaymentService
  private billingRepo: BillingRepo
  private readonly db: PgDb

  constructor(paymentService: PaymentService, db: PgDb) {
    this.paymentService = paymentService
    this.billingRepo = new BillingRepo(db)
    this.db = db
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
    sub: Subscription,
    details: CancallationDetails,
    immediately: boolean = false,
  ): Promise<Subscription> {
    await this.db.payments.subscriptionCancellations.insert({
      subscriptionId: sub.id,
      ...filterUndefined(details),
    })

    const newSub = immediately
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

    return await this.billingRepo.updateSubscription(
      { id: sub.id },
      {
        currentPeriodStart: parseStripeDate(newSub.current_period_start),
        currentPeriodEnd: parseStripeDate(newSub.current_period_end),
        status: newSub.status,
        cancelAt: parseStripeDate(newSub.cancel_at),
        canceledAt: parseStripeDate(newSub.canceled_at),
        cancelAtPeriodEnd: newSub.cancel_at_period_end,
        endedAt: parseStripeDate(newSub.ended_at),
      },
    )
  }

  async revokeCancellation(sub: Subscription): Promise<Subscription> {
    const tx = await this.db.transactionBegin()

    try {
      const cancelation = await tx.payments.subscriptionCancellations.findFirst(
        {
          subscriptionId: sub.id,
          revokedAt: null,
        },
      )

      if (cancelation) {
        await tx.payments.subscriptionCancellations.update(
          { id: cancelation.id },
          {
            revokedAt: new Date(),
          },
        )
      }

      await tx.transactionCommit()
    } catch (e) {
      await tx.transactionRollback()
      throw e
    }

    const newSub = await this.paymentService.updateSubscription(
      sub.company,
      sub.externalId,
      {
        cancel_at_period_end: false,
      },
    )

    return this.billingRepo.updateSubscription(
      { id: sub.id },
      {
        currentPeriodStart: parseStripeDate(newSub.current_period_start),
        currentPeriodEnd: parseStripeDate(newSub.current_period_end),
        status: newSub.status,
        cancelAt: parseStripeDate(newSub.cancel_at),
        canceledAt: parseStripeDate(newSub.canceled_at),
        cancelAtPeriodEnd: newSub.cancel_at_period_end,
        endedAt: parseStripeDate(newSub.ended_at),
      },
    )
  }
}

function filterUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>
}
