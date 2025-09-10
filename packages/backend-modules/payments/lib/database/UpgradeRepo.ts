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

export class UpgradeRepo {
  private pgdb: PgDb

  public constructor(pgdb: PgDb) {
    this.pgdb = pgdb
  }

  async getUnresolvedUpgrades(userId: string) {
    const records = await this.pgdb.payments.subscription_upgrades.getAll({
      user_id: userId,
    })

    records.map(this.camelCaseKeys) as Upgrade[]
  }

  async getUpgradesForUser(userId: string) {
    const records = await this.pgdb.payments.subscription_upgrades.getAll({
      user_id: userId,
    })

    records.map(this.camelCaseKeys) as Upgrade[]
  }

  async saveUpgrade(
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

  async updateUpgrade(
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

    console.log(res)

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
