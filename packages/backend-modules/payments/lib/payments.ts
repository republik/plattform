import { PgDb } from 'pogi'
import { OrderArgs } from './database/repo'
import { PaymentGateway } from './gateway/gateway'
import { ProjectRStripe, RepublikAGStripe } from './gateway/stripe'
import { Company, Order, Subscription } from './types'
import { PgPaymentRepo } from './database/PgPaypmentsRepo'
import assert from 'node:assert'

const Gateway = new PaymentGateway({
  PROJECT_R: ProjectRStripe,
  REPUBLIK_AG: RepublikAGStripe,
})

const Companies: Company[] = ['PROJECT_R', 'REPUBLIK_AG']

export interface PaymentService {
  listSubscriptions(userId: string): Promise<Subscription[]>
  createCustomer(email: string, userId: string): any
  saveOrder(userId: string, order: OrderArgs): Promise<Order>
}

export class Payments implements PaymentService {
  static instance: PaymentService
  protected pgdb: PgDb
  protected repo: PgPaymentRepo

  static start(pgdb: PgDb) {
    this.instance = new this(pgdb)
  }

  static assertRunning() {
    assert(this.instance !== null, 'PaymentService has not been stared')
  }

  constructor(pgdb: PgDb) {
    this.pgdb = pgdb
    this.repo = new PgPaymentRepo(pgdb)
  }

  async listSubscriptions(userId: string): Promise<Subscription[]> {
    return this.repo.getUserSubscriptions(userId)
  }

  async createCustomer(email: string, userId: string) {
    const tasks = Companies.map(async (c) => {
      const id = await Gateway.forCompany(c).createCustomer(email, userId)
      return { customerId: id, company: c }
    })
    const results = await Promise.allSettled(tasks)

    const ids = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => {
        return (
          r as PromiseFulfilledResult<{
            customerId: string
            company: Company
          }>
        ).value
      })

    await this.repo.saveCustomerIds(userId, ids)

    return ids
  }

  async saveOrder(userId: string, order: OrderArgs): Promise<Order> {
    return this.repo.saveOrder(userId, order)
  }

  static createCustomer(email: string, userId: string) {
    this.assertRunning()

    return this.instance.createCustomer(email, userId)
  }

  static saveOrder(userId: string, order: OrderArgs): Promise<Order> {
    this.assertRunning()

    return this.instance.saveOrder(userId, order)
  }

  static listSubscriptions(userId: string) {
    this.assertRunning()

    return this.instance.listSubscriptions(userId)
  }
}
