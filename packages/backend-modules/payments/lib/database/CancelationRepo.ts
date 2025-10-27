import { PgDb } from 'pogi'

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

export class CancelationRepo {
  private db: PgDb

  public constructor(pgdb: PgDb) {
    this.db = pgdb
  }

  public async insertCancelation(
    subId: string,
    details: CancallationDetails,
  ): Promise<DBCancallationDetails> {
    const dbDetails =
      await this.db.payments.subscriptionCancellations.insertAndGet({
        subscriptionId: subId,
        ...this.filterUndefined(details),
      })

    return dbDetails
  }

  public async getOne(
    select: Partial<DBCancallationDetails>,
    options?: string | string[] | { [fieldName: string]: 'asc' | 'desc' },
  ): Promise<DBCancallationDetails | null> {
    return this.db.payments.subscriptionCancellations.findFirst(select, options)
  }

  public async updateCancelation(
    id: string,
    args: Partial<CancallationDetails & { revokedAt?: Date }>,
  ): Promise<DBCancallationDetails | null> {
    const [data] =
      await this.db.payments.subscriptionCancellations.updateAndGet(
        { id: id },
        this.filterUndefined({ ...args, updatedAt: new Date() }),
      )

    return data
  }

  public async revokeLatestCancelation(
    subId: string,
  ): Promise<DBCancallationDetails | undefined> {
    const tx = await this.db.transactionBegin()

    let dbDetails: DBCancallationDetails | undefined

    try {
      const cancelation = await tx.payments.subscriptionCancellations.findFirst(
        {
          subscriptionId: subId,
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

    return dbDetails
  }

  private filterUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== undefined),
    ) as Partial<T>
  }
}
