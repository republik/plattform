import { PgDb } from 'pogi'
import { PaymentProvider } from './providers/provider'
import {
  Company,
  Invoice,
  InvoiceArgs,
  Order,
  Subscription,
  SubscriptionArgs,
  SelectCriteria,
  InvoiceUpdateArgs,
  SubscriptionStatus,
  ChargeUpdate,
  ChargeInsert,
} from './types'
import assert from 'node:assert'
import { ConnectionContext, UserRow } from '@orbiting/backend-modules-types'
import { CustomerRepo, PaymentCustomerRepo } from './database/CutomerRepo'
import {
  BillingRepo,
  OrderArgs,
  PaymentBillingRepo,
} from './database/BillingRepo'
import { UserDataRepo } from './database/UserRepo'
import { CustomerInfoService } from './services/CustomerInfoService'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { UserEvents } = require('@orbiting/backend-modules-auth')

export const Companies: readonly Company[] = ['PROJECT_R', 'REPUBLIK'] as const

export function setupPaymentUserEventHooks(context: ConnectionContext) {
  const cs = new CustomerInfoService(context.pgdb)

  UserEvents.onSignedIn(async ({ userId }: { userId: string }) => {
    if (process.env.PAYMENTS_CREATE_CUSTOMERS_ON_LOGIN === 'true') {
      await cs.ensureUserHasCustomerIds(userId)
    }
  })

  UserEvents.onEmailUpdated(
    async (args: { userId: string; newEmail: string }) => {
      await Promise.all(
        Companies.map((c) =>
          cs.updateCustomerEmail(c, args.userId, args.newEmail),
        ),
      )
    },
  )
}

export class Payments implements PaymentService {
  static #instance: PaymentService
  protected pgdb: PgDb
  protected customers: PaymentCustomerRepo
  protected billing: PaymentBillingRepo
  protected users: UserDataRepo

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
    this.customers = new CustomerRepo(pgdb)
    this.billing = new BillingRepo(pgdb)
    this.users = new UserDataRepo(pgdb)
  }

  getSubscriptionInvoices(subscriptionId: string): Promise<Invoice> {
    return this.pgdb.payments.invoices.find({
      subscriptionId,
    })
  }

  async saveInvoice(userId: string, args: InvoiceArgs): Promise<Invoice> {
    const tx = await this.pgdb.transactionBegin()
    const txRepo = new BillingRepo(tx)
    try {
      let subId: string | undefined = undefined
      if (args.externalSubscriptionId) {
        const sub = await txRepo.getSubscription({
          externalId: args.externalSubscriptionId,
        })

        if (!sub) {
          throw Error('Subscription not found')
        }

        subId = sub.id
      }

      const sub = await txRepo.saveInvoice(userId, {
        externalId: args.externalId,
        items: args.items,
        company: args.company,
        status: args.status,
        metadata: args.metadata,
        periodStart: args.periodStart,
        periodEnd: args.periodEnd,
        total: args.total,
        totalDiscountAmount: args.totalDiscountAmount,
        totalBeforeDiscount: args.totalBeforeDiscount,
        totalDiscountAmounts: args.totalDiscountAmounts,
        totalExcludingTax: args.totalExcludingTax,
        totalTaxAmount: args.totalTaxAmount,
        totalTaxAmounts: args.totalTaxAmounts,
        discounts: args.discounts,
        subscriptionId: subId,
      })

      await tx.transactionCommit()
      return sub
    } catch (e) {
      console.log(e)
      await tx.transactionRollback()

      throw e
    }
  }

  async getCharge(by: SelectCriteria) {
    return await this.billing.getCharge(by)
  }

  async saveCharge(args: ChargeInsert): Promise<any> {
    return await this.billing.saveCharge(args)
  }

  async updateCharge(by: SelectCriteria, args: ChargeUpdate): Promise<any> {
    return this.billing.updateCharge(by, args)
  }

  async getInvoice(by: SelectCriteria): Promise<Invoice | null> {
    return await this.billing.getInvoice(by)
  }

  async updateInvoice(
    by: SelectCriteria,
    args: InvoiceUpdateArgs,
  ): Promise<Invoice> {
    return await this.billing.updateInvoice(by, args)
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
      console.log(e)
      await tx.transactionRollback()

      throw e
    }
  }

  async getCustomerIdForCompany(
    userId: string,
    company: Company,
  ): Promise<{ company: Company; customerId: string } | null> {
    const customerInfo = await this.customers.getCustomerIdForCompany(
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
          company: company,
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

  async getUserIdForCompanyCustomer(
    company: Company,
    customerId: string,
  ): Promise<string | null> {
    const customerInfo = await this.customers.getUserIdForCompanyCustomer(
      company,
      customerId,
    )
    if (!customerInfo) {
      // lookup strip customerIds in the old stripeCustomer table
      const row = await this.pgdb.queryOne(
        `SELECT
        s."userId" as "userId"
        from "stripeCustomers" s
        JOIN companies c ON s."companyId" = c.id
        WHERE
        s."id" = :customerId AND
        c.name = :company`,
        {
          customerId,
          company: company,
        },
      )
      if (!row) {
        console.log(`No user for ${customerId} and ${company}`)
        return null
      }

      return row.userId
    }
    return customerInfo.userId
  }

  listUserOrders(userId: string): Promise<Order[]> {
    return this.billing.getUserOrders(userId)
  }

  getOrder(id: string): Promise<Order | null> {
    return this.billing.getOrder(id)
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
          `subscription for ${locator.externalId || locator.id} dose not exist`,
        )
      }

      await tx.query(`SELECT public.refresh_member_role(:userId);`, {
        userId: sub.userId,
      })

      await tx.transactionCommit()

      return sub
    } catch (e) {
      console.error(e)
      await tx.transactionRollback()
      throw e
    }
  }

  async createCustomer(company: Company, userId: string): Promise<string> {
    const user = await this.users.findUserById(userId)

    if (!user) {
      throw Error(`User ${userId} does not exist`)
    }

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
        company: company,
      },
    )

    let customerId
    if (!oldCustomerData || oldCustomerData?.customerId === null) {
      customerId = await PaymentProvider.forCompany(company).createCustomer(
        user.email,
        user.id,
      )
    } else {
      customerId = oldCustomerData.customerId
    }

    await this.customers.saveCustomerIdForCompany(user.id, company, customerId)

    if (!oldCustomerData || oldCustomerData?.customerId === null) {
      // backfill into legacy table to prevent new customers from being created if the old checkout is used
      // get rid of this as soon as possible...
      try {
        const { id: legacyCompanyId } =
          await this.pgdb.public.companies.findOne({
            name: company,
          })
        await this.pgdb.public.stripeCustomers.insert({
          id: customerId,
          userId: userId,
          companyId: legacyCompanyId,
        })
      } catch (e) {
        console.error(e)
      }
    }

    return customerId
  }

  async saveOrder(order: OrderArgs): Promise<Order> {
    return await this.billing.saveOrder(order)
  }

  async updateUserName(
    userId: string,
    firstName: string,
    lastName: string,
  ): Promise<UserRow> {
    const tx = await this.pgdb.transactionBegin()
    const txUserRepo = new UserDataRepo(tx)
    try {
      const user = await txUserRepo.updateUser(userId, {
        firstName,
        lastName,
      })

      tx.transactionCommit()
      return user
    } catch (e) {
      console.log(e)
      await tx.transactionRollback()
      throw e
    }
  }

  static getInstance(): PaymentService {
    this.assertRunning()
    return this.#instance
  }
}

/*
 * Payment Service public Interface
 */
export interface PaymentService {
  listSubscriptions(
    userId: string,
    only?: SubscriptionStatus[],
  ): Promise<Subscription[]>
  fetchActiveSubscription(userId: string): Promise<Subscription | null>
  setupSubscription(
    userId: string,
    args: SubscriptionArgs,
  ): Promise<Subscription>
  getSubscription(by: SelectCriteria): Promise<Subscription | null>
  updateSubscription(args: SubscriptionArgs): Promise<Subscription>
  disableSubscription(
    by: SelectCriteria,
    args: {
      endedAt: Date
      canceledAt: Date
    },
  ): Promise<Subscription>
  getCustomerIdForCompany(
    userId: string,
    company: Company,
  ): Promise<{ customerId: string; company: Company } | null>
  getUserIdForCompanyCustomer(
    copmany: Company,
    customerId: string,
  ): Promise<string | null>
  createCustomer(company: Company, userId: string): Promise<string>
  listUserOrders(userId: string): Promise<Order[]>
  getOrder(id: string): Promise<Order | null>
  saveOrder(order: OrderArgs): Promise<Order>
  getSubscriptionInvoices(subscriptionId: string): Promise<Invoice>
  getInvoice(by: SelectCriteria): Promise<Invoice | null>
  saveInvoice(userId: string, args: InvoiceArgs): Promise<Invoice>
  getCharge(by: SelectCriteria): Promise<any>
  saveCharge(args: ChargeInsert): Promise<any>
  updateCharge(by: SelectCriteria, args: ChargeUpdate): Promise<any>
  updateInvoice(by: SelectCriteria, args: InvoiceUpdateArgs): Promise<Invoice>
  updateUserName(
    userId: string,
    firstName: string,
    lastName: string,
  ): Promise<UserRow>
}
