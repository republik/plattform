import { PgDb } from 'pogi'
import {
  Subscription,
  SubscriptionArgs,
  SubscriptionStatus,
  SelectCriteria,
} from '../types'
import { BillingRepo, PaymentBillingRepo } from '../database/BillingRepo'

export class SubscriptionService {
  protected pgdb: PgDb
  protected billing: PaymentBillingRepo

  constructor(pgdb: PgDb) {
    this.pgdb = pgdb
    this.billing = new BillingRepo(pgdb)
  }

  async setupSubscription(
    userId: string,
    args: SubscriptionArgs,
  ): Promise<Subscription> {
    const tx = await this.pgdb.transactionBegin()
    const txRepo = new BillingRepo(tx)

    try {
      const sub = await txRepo.saveSubscriptions(userId, args)
      await tx.query(`SELECT public.add_user_to_role(:userId, 'member');`, {
        userId: userId,
      })
      await tx.transactionCommit()
      return sub
    } catch (e) {
      await tx.transactionRollback()
      throw e
    }
  }

  listSubscriptions(
    userId: string,
    only?: SubscriptionStatus[],
  ): Promise<Subscription[]> {
    return this.billing.getUserSubscriptions(userId, only)
  }

  getSubscription(by: SelectCriteria): Promise<Subscription | null> {
    return this.billing.getSubscription(by)
  }

  fetchActiveSubscription(userId: string): Promise<Subscription | null> {
    return this.billing.getActiveUserSubscription(userId)
  }

  async updateSubscription(args: SubscriptionArgs): Promise<Subscription> {
    const sub = await this.billing.updateSubscription(
      { externalId: args.externalId },
      {
        status: args.status,
        cancelAt: args.cancelAt,
        canceledAt: args.canceledAt,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        cancellationReason: args.cancellationReason,
        cancellationFeedback: args.cancellationFeedback,
        cancellationComment: args.cancellationComment,
        endedAt: args.endedAt,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
      },
    )
    return sub
  }

  async disableSubscription(
    locator: SelectCriteria,
    args: any,
  ): Promise<Subscription> {
    const tx = await this.pgdb.transactionBegin()
    const txRepo = new BillingRepo(tx)

    try {
      const sub = await txRepo.updateSubscription(locator, {
        status: 'canceled',
        endedAt: args.endedAt,
        canceledAt: args.canceledAt,
      })

      if (!sub) {
        throw new Error(
          `subscription for ${locator.externalId || locator.id} does not exist`,
        )
      }

      await tx.query(`SELECT public.refresh_member_role(:userId);`, {
        userId: sub.userId,
      })
      await tx.transactionCommit()
      return sub
    } catch (e) {
      await tx.transactionRollback()
      throw e
    }
  }
}
