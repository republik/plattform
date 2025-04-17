import { PgDb } from 'pogi'
import { PaymentService } from './PaymentService'
import { Subscription } from '../types'

export type CancalationDetails = {
  category: string
  reason: string
  suppressConfirmation: boolean
  suppressWinback: boolean
  cancelledViaSupport?: boolean
}

export class CancelationService {
  private readonly paymentService: PaymentService
  private readonly db: PgDb

  constructor(paymentService: PaymentService, db: PgDb) {
    this.paymentService = paymentService
    this.db = db
  }

  async cancelSubscription(
    sub: Subscription,
    details: CancalationDetails,
  ): Promise<string> {
    const id = await this.db.payments.subscriptionCancellations.insert({
      subscriptionId: sub.id,
      ...details,
    })

    await this.paymentService.updateSubscription(sub.company, sub.externalId, {
      cancel_at_period_end: true,
    })

    return id
  }

  async revokeCancelation(sub: Subscription): Promise<void> {
    const tx = await this.db.transactionBegin()

    try {
      const cancelation = await tx.payments.subscriptionCancellations.find({
        subscriptionId: sub.id,
      })
      await tx.payments.subscriptionCancellations.delete(cancelation.id)

      await tx.transactionCommit()
    } catch (e) {
      await tx.transactionRollback()
      throw e
    }

    await this.paymentService.updateSubscription(sub.company, sub.externalId, {
      cancel_at_period_end: false,
    })

    return
  }
}
