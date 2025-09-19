import { PgDb } from 'pogi'

export type Upgrade = {
  id: string
  userId: string
  subscriptionId: string
  externalId: string
  status: string
  scheduledStart: Date
  createdAt: Date
  updatedAt: Date
}

export class SubscriptionUpgradeRepo {
  private pgdb: PgDb

  public constructor(pgdb: PgDb) {
    this.pgdb = pgdb
  }

  async getUnresolvedSubscriptionUpgrades(
    subscriptionId: string,
  ): Promise<Upgrade[]> {
    const records = await this.pgdb.payments.subscription_upgrades.find({
      subscription_id: subscriptionId,
      'status <>': ['resolved', 'canceled'], // not in
    })

    return records.map(this.camelCaseKeys) as Upgrade[]
  }

  async getSupbscriptionUpgradesForUser(userId: string) {
    const records = await this.pgdb.payments.subscription_upgrades.find({
      user_id: userId,
    })

    records.map(this.camelCaseKeys) as Upgrade[]
  }

  async saveSubscriptionUpgrade(
    args: Partial<{
      userId: string
      subscriptionId: string
      externalId: string
      status: string
      scheduledStart: Date
    }>,
  ): Promise<Upgrade> {
    const insert = this.filterUndefined({
      user_id: args.userId,
      subscription_id: args.subscriptionId,
      external_id: args.externalId,
      status: args.status,
      scheduled_start: args.scheduledStart,
    })

    const rec = await this.pgdb.payments.subscription_upgrades.insertAndGet(
      insert,
    )

    return this.camelCaseKeys(rec) as Upgrade
  }

  async updateSubscriptionUpgrade(
    upgradeId: string,
    args: Partial<{
      userId: string
      subscriptionId: string
      externalId: string
      status: string
      scheduledStart: Date
    }>,
  ) {
    const update = this.filterUndefined({
      user_id: args.userId,
      subscription_id: args.subscriptionId,
      external_id: args.externalId,
      status: args.status,
      scheduled_start: args.scheduledStart,
    })

    const [res] = await this.pgdb.payments.subscription_upgrades.updateAndGet(
      { id: upgradeId },
      {
        ...update,
        updated_at: new Date(),
      },
    )

    return this.camelCaseKeys(res) as Upgrade
  }

  private camelCaseKeys(record: Record<string, any>): Record<string, any> {
    const n: Record<string, any> = {}

    Object.keys(record).forEach((k) => {
      n[toCamel(k)] = record[k]
    })

    return n
  }

  private filterUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== undefined),
    ) as Partial<T>
  }
}

function toCamel(s: string): string {
  return s.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '')
  })
}
