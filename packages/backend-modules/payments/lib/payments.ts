import { PgDb } from 'pogi'
import { OrderArgs } from './database/repo'
import { PaymentGateway } from './gateway/gateway'
import { ProjectRStripe, RepublikAGStripe } from './gateway/stripe'
import {
  Company,
  Invoice,
  InvoiceArgs,
  Order,
  Subscription,
  SubscriptionArgs,
  PaymentItemLocator,
  InvoiceUpdateArgs,
} from './types'
import { PgPaymentRepo } from './database/PgPaypmentsRepo'
import assert from 'node:assert'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { StripeCustomerCreateWorker } from './workers/StripeCustomerCreateWorker'

const Gateway = new PaymentGateway({
  PROJECT_R: ProjectRStripe,
  REPUBLIK_AG: RepublikAGStripe,
})

export const Companies: Company[] = ['PROJECT_R', 'REPUBLIK_AG'] as const

/*
 * Payment Service public Interface
 */
export interface PaymentService {
  listSubscriptions(userId: string): Promise<Subscription[]>
  fetchActiveSubscription(userId: string): Promise<Subscription | null>
  listActiveSubscriptions(userId: string): Promise<Subscription[]>
  setupSubscription(
    args: SubscriptionArgs & { customerId: string },
  ): Promise<Subscription>
  updateSubscription(args: SubscriptionArgs): Promise<Subscription>
  disableSubscription(
    by: PaymentItemLocator,
    args: {
      endedAt: Date
      canceledAt: Date
    },
  ): Promise<Subscription>
  getCustomerIdForCompany(
    userId: string,
    company: Company,
  ): Promise<{ customerId: string; company: string }>
  ensureUserHasCustomerIds(userId: string): Promise<void>
  createCustomer(company: Company, userId: string): any
  listUserOrders(userId: string): Promise<Order[]>
  getOrder(id: string): Promise<Order>
  saveOrder(order: OrderArgs): Promise<Order>
  getSubscriptionInvoices(subscriptionId: string): Promise<Invoice>
  saveInvoice(customerId: string, args: InvoiceArgs): Promise<Invoice>
  updateInvoice(
    by: PaymentItemLocator,
    args: InvoiceUpdateArgs,
  ): Promise<Invoice>
}

export class Payments implements PaymentService {
  static #instance: PaymentService
  protected pgdb: PgDb
  protected repo: PgPaymentRepo

  static start(pgdb: PgDb) {
    if (this.#instance) {
      console.log('Payment Service is already running')
      return
    }
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

  getSubscriptionInvoices(subscriptionId: string): Promise<Invoice> {
    return this.pgdb.payments.invoices.find({
      subscriptionId,
    })
  }

  async saveInvoice(customerId: string, args: InvoiceArgs): Promise<Invoice> {
    const tx = await this.pgdb.transactionBegin()
    const txRepo = new PgPaymentRepo(tx)
    try {
      let userId = await txRepo.getUserIdByCustomerId(customerId)
      if (!userId) {
        const row = await tx.public.stripeCustomers.findOne(
          {
            customerId,
          },
          { fields: ['userId'] },
        )

        userId = row.userId
      }

      if (!userId) {
        throw Error(`CustomerId ${customerId} is not associated with a user`)
      }

      let dbSubId = undefined
      if (args.subscriptionId) {
        const sub = await txRepo.getSubscription({
          gatewayId: args.subscriptionId,
        })

        dbSubId = sub.id
      }

      const sub = await txRepo.saveInvoice(userId, {
        gatewayId: args.gatewayId,
        items: args.items,
        company: args.company,
        status: args.status,
        metadata: args.metadata,
        periodStart: args.periodStart,
        periodEnd: args.periodEnd,
        total: args.total,
        totalBeforeDiscount: args.totalBeforeDiscount,
        discounts: args.discounts,
        subscriptionId: dbSubId,
      })

      await tx.transactionCommit()
      return sub
    } catch (e) {
      console.log(e)
      await tx.transactionRollback()

      throw e
    }
  }

  async updateInvoice(
    by: PaymentItemLocator,
    args: InvoiceUpdateArgs,
  ): Promise<Invoice> {
    return await this.repo.updateInvoice(by, args)
  }

  async setupSubscription({
    customerId,
    ...args
  }: { customerId: string } & SubscriptionArgs): Promise<Subscription> {
    const tx = await this.pgdb.transactionBegin()
    const txRepo = new PgPaymentRepo(tx)

    try {
      let userId = await txRepo.getUserIdByCustomerId(customerId)
      if (!userId) {
        const row = await tx.public.stripeCustomers.findOne(
          {
            customerId,
          },
          { fields: ['userId'] },
        )

        userId = row.userId
      }

      if (!userId) {
        throw Error(`CustomerId ${customerId} is not associated with a user`)
      }

      const sub = await txRepo.addUserSubscriptions(userId, args)
      await tx.query(`SELECT public.add_user_to_role(:userId, 'member');`, {
        userId: userId,
      })

      await tx.transactionCommit()
      return sub
    } catch (e) {
      console.log(e)
      await tx.transactionRollback()

      throw e
    }
  }

  async getCustomerIdForCompany(
    userId: string,
    company: Company,
  ): Promise<any> {
    const customerInfo = await this.repo.getCustomerIdForCompany(
      userId,
      company,
    )
    if (!customerInfo) {
      // lookup strip customerIds in the old stripeCustomer table
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
        console.log(`No stripe customer for ${userId} and ${company}`)
        return null
      }

      return { customerId: row.customerId, company }
    }
    return customerInfo
  }

  listUserOrders(userId: string): Promise<Order[]> {
    return this.repo.getUserOrders(userId)
  }

  getOrder(id: string): Promise<Order> {
    return this.repo.getOrder(id)
  }

  listSubscriptions(userId: string): Promise<Subscription[]> {
    return this.repo.getUserSubscriptions(userId)
  }

  fetchActiveSubscription(userId: string): Promise<Subscription | null> {
    return this.repo.getActiveUserSubscription(userId)
  }

  listActiveSubscriptions(userId: string): Promise<Subscription[]> {
    return this.repo.getActiveUserSubscriptions(userId)
  }

  async updateSubscription(args: SubscriptionArgs): Promise<Subscription> {
    return this.repo.updateSubscription(
      { gatewayId: args.gatewayId },
      {
        status: args.status,
        cancelAt: args.cancelAt,
        canceledAt: args.canceledAt,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        endedAt: args.endedAt,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
      },
    )
  }

  async disableSubscription(
    locator: PaymentItemLocator,
    args: any,
  ): Promise<Subscription> {
    const sub = await this.repo.updateSubscription(locator, {
      status: 'canceled',
      endedAt: args.endedAt,
      canceledAt: args.canceledAt,
    })

    return sub
  }

  async ensureUserHasCustomerIds(userId: string): Promise<void> {
    const tasks = Companies.map(async (company) => {
      const customer = await this.pgdb.payments.stripeCustomers.findOne({
        userId,
        company,
      })

      if (!customer) {
        await Queue.getInstance().send<StripeCustomerCreateWorker>(
          'payments:stripe:customer:create',
          {
            $version: 'v1',
            userId,
            company,
          },
          {
            singletonKey: `stripe:customer:create:for:${userId}:${company}`,
          },
        )
      }
    })

    await Promise.all(tasks)
  }

  async createCustomer(company: Company, userId: string) {
    const user = await this.pgdb.public.users.findOne(
      { id: userId },
      { fields: ['email', 'id'] },
    )

    const oldCustomerData = await this.pgdb.queryOne(
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

    let customerId
    if (!oldCustomerData || oldCustomerData?.customerId === null) {
      customerId = await Gateway.forCompany(company).createCustomer(
        user.email,
        user.id,
      )
    } else {
      customerId = oldCustomerData.customerId
    }

    await this.repo.saveCustomerIdForCompany(user.id, company, customerId)

    return customerId
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
