import { PgDb } from 'pogi'
import { OrderArgs } from './database/repo'
import { PaymentGateway } from './gateway/gateway'
import { ProjectRStripe, RepublikAGStripe } from './gateway/stripe'
import { Company, Order, Subscription, SubscriptionArgs } from './types'
import { PgPaymentRepo } from './database/PgPaypmentsRepo'
import assert from 'node:assert'

const Gateway = new PaymentGateway({
  PROJECT_R: ProjectRStripe,
  REPUBLIK_AG: RepublikAGStripe,
})

const Companies: Company[] = ['PROJECT_R', 'REPUBLIK_AG'] as const

/*
 * Payment Service public Interface
 */
export interface PaymentService {
  listSubscriptions(userId: string): Promise<Subscription[]>
  setupSubscription(args: any): Promise<Subscription>
  updateSubscription(args: any): Promise<Subscription>
  disableSubscription(args: any): Promise<Subscription>
  getCustomerIdForCompany(userId: string, company: Company): Promise<any>
  createCustomer(email: string, userId: string): any
  listUserOrders(userId: string): Promise<Order[]>
  getOrder(id: string): Promise<Order>
  saveOrder(order: OrderArgs): Promise<Order>
}

export class Payments implements PaymentService {
  static #instance: PaymentService
  protected pgdb: PgDb
  protected repo: PgPaymentRepo

  static start(pgdb: PgDb) {
    this.#instance = new this(pgdb)
  }

  static assertRunning() {
    assert(
      this.#instance !== undefined || this.#instance !== null,
      'PaymentService has not been stared',
    )
  }

  constructor(pgdb: PgDb) {
    this.pgdb = pgdb
    this.repo = new PgPaymentRepo(pgdb)
  }

  async setupSubscription(
    args: SubscriptionArgs & { customerId: string },
  ): Promise<Subscription> {
    const tx = await this.pgdb.transactionBegin()
    const txRepo = new PgPaymentRepo(tx)

    try {
      const userId = await txRepo.getUserIdByCustomerId(args.customerId)
      if (!userId) {
        throw Error(
          `CustomerId ${args.customerId} is not associated with a user`,
        )
      }

      const sub = await txRepo.addUserSubscriptions(userId, args)
      await tx.query(`PERFORM public.add_user_to_role(:userId, 'member')`, {
        userId: userId,
      })

      await tx.transactionCommit()
      return sub
    } catch (e) {
      await tx.transactionRollback()

      throw e
    }
  }

  async getCustomerIdForCompany(
    userId: string,
    company: Company,
  ): Promise<any> {
    const customer = await this.repo.getCustomerIdForCompany(userId, company)
    if (!customer) {
      console.log('legecy lookup')
      const row = await this.pgdb.queryOne(
        `SELECT
        s.id as "customerId"
        from "stripeCustomers" s
        JOIN companies c ON s."companyId" = c.id
        WHERE
        "userId" = :userId AND
        c.name = :company`,
        {
          userId,
          company: company === 'REPUBLIK_AG' ? 'REPUBLIK' : company,
        },
      )
      if (!row) {
        return null
      }

      return { customerId: row.customerId, company }
    }
    return customer
  }

  async listUserOrders(userId: string): Promise<Order[]> {
    return await this.repo.getUserOrders(userId)
  }

  async getOrder(id: string): Promise<Order> {
    return await this.repo.getOrder(id)
  }

  async listSubscriptions(userId: string): Promise<Subscription[]> {
    return this.repo.getUserSubscriptions(userId)
  }

  async updateSubscription(args: any): Promise<Subscription> {
    console.log(args)
    throw new Error('Method not implemented.')
  }

  async disableSubscription(args: any): Promise<Subscription> {
    console.log(args)
    throw new Error('Method not implemented.')
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

  async saveOrder(order: OrderArgs): Promise<Order> {
    const userId = await this.repo.getUserIdByCustomerId(order.customerId)
    if (!userId) {
      throw Error('unable to find customer')
    }

    return this.repo.saveOrder(userId, order)
  }

  static getInstance(): PaymentService {
    this.assertRunning()
    return this.#instance
  }
}
