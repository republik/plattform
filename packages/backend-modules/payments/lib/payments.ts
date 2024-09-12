import { PgDb } from 'pogi'
import { OrderArgs, OrderRepoArgs, WebhookArgs } from './database/repo'
import { PaymentProvider } from './providers/provider'
import {
  Company,
  Invoice,
  InvoiceArgs,
  Order,
  Subscription,
  SubscriptionArgs,
  PaymentItemLocator,
  InvoiceUpdateArgs,
  Webhook,
  ACTIVE_STATUS_TYPES,
} from './types'
import { PgPaymentRepo } from './database/PgPaypmentsRepo'
import assert from 'node:assert'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { StripeCustomerCreateWorker } from './workers/StripeCustomerCreateWorker'
import { UserRow } from '@orbiting/backend-modules-types'
import { sendSetupSubscriptionMail } from './transactionals/sendTransactionalMails'
import { enforceSubscriptions } from '@orbiting/backend-modules-mailchimp'

export const Companies: Company[] = ['PROJECT_R', 'REPUBLIK'] as const

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

  async sendSetupSubscriptionTransactionalMail({
    subscriptionExternalId,
    userId,
    orderId,
  }: {
    subscriptionExternalId: string
    userId: string
    orderId: string
  }): Promise<void> {
    const subscription = await this.repo.getSubscription({
      externalId: subscriptionExternalId,
    })

    if (!subscription) {
      throw new Error(
        `Subscription [${subscriptionExternalId}] does not exist in the Database`,
      )
    }

    if (!ACTIVE_STATUS_TYPES.includes(subscription.status)) {
      console.log(
        'not sending transactional for subscription %s with status %s',
        subscriptionExternalId,
        subscription.status,
      )
      // TODO set job to retry?
    }
    const userRow = await this.repo.getUser(userId)

    const order = await this.repo.getOrder(orderId)
    if (!order) {
      throw new Error(`order with id ${orderId} does not exist`)
    }
    // send mail
    await sendSetupSubscriptionMail(
      subscription,
      order,
      userRow.email,
      this.pgdb,
    )
  }

  async syncMailchimp({
    userId,
    subscriptionExternalId,
  }: {
    userId: string
    subscriptionExternalId: string
  }): Promise<void> {
    const subscribeToOnboardingMails =
      await this.repo.isUserFirstTimeSubscriber(userId, subscriptionExternalId)

    // sync to mailchimp
    await enforceSubscriptions({
      userId: userId,
      subscribeToOnboardingMails: subscribeToOnboardingMails,
      subscribeToEditorialNewsletters: true,
      pgdb: this.pgdb,
    })
  }

  getSubscriptionInvoices(subscriptionId: string): Promise<Invoice> {
    return this.pgdb.payments.invoices.find({
      subscriptionId,
    })
  }

  async saveInvoice(userId: string, args: InvoiceArgs): Promise<Invoice> {
    const tx = await this.pgdb.transactionBegin()
    const txRepo = new PgPaymentRepo(tx)
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
        totalBeforeDiscount: args.totalBeforeDiscount,
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

  async getInvoice(by: PaymentItemLocator): Promise<Invoice | null> {
    return await this.repo.getInvoice(by)
  }

  async updateInvoice(
    by: PaymentItemLocator,
    args: InvoiceUpdateArgs,
  ): Promise<Invoice> {
    return await this.repo.updateInvoice(by, args)
  }

  async setupSubscription(
    userId: string,
    args: SubscriptionArgs,
  ): Promise<Subscription> {
    const tx = await this.pgdb.transactionBegin()
    const txRepo = new PgPaymentRepo(tx)

    try {
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
    const cus = await PaymentProvider.forCompany(company).getCustomer(
      customerId,
    )
    if (!cus) {
      return null
    }

    return cus.metadata?.userId
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

  getSubscription(by: PaymentItemLocator): Promise<Subscription | null> {
    return this.repo.getSubscription(by)
  }

  fetchActiveSubscription(userId: string): Promise<Subscription | null> {
    return this.repo.getActiveUserSubscription(userId)
  }

  async updateSubscription(args: SubscriptionArgs): Promise<Subscription> {
    const sub = await this.repo.updateSubscription(
      { externalId: args.externalId },
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

    return sub
  }

  async disableSubscription(
    locator: PaymentItemLocator,
    args: any,
  ): Promise<Subscription> {
    const tx = await this.pgdb.transactionBegin()
    const txRepo = new PgPaymentRepo(tx)

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

      await tx.query(
        `SELECT public.remove_user_from_role(:userId, 'member');`,
        {
          userId: sub.userId,
        },
      )

      await tx.transactionCommit()

      return sub
    } catch (e) {
      console.error(e)
      await tx.transactionRollback()
      throw e
    }
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

    await this.repo.saveCustomerIdForCompany(user.id, company, customerId)

    if (!oldCustomerData || oldCustomerData?.customerId === null) {
      // backfill into lagacy table to prevent new customers from beeing created if the old checkout is used
      // get rid of this as soon as posible...
      try {
        const { id: lagacyCompanyId } =
          await this.pgdb.public.companies.findOne({
            name: company,
          })
        await this.pgdb.public.stripeCustomers.insert({
          id: customerId,
          userId: userId,
          companyId: lagacyCompanyId,
        })
      } catch (e) {
        console.error(e)
      }
    }

    return customerId
  }

  async saveOrder(userId: string, order: OrderArgs): Promise<Order> {
    if (!userId) {
      throw Error('unable to find customer')
    }

    const args: OrderRepoArgs = {
      userId: userId,
      company: order.company,
      externalId: order.externalId,
      items: order.items,
      paymentStatus: order.paymentStatus,
      total: order.total,
      totalBeforeDiscount: order.totalBeforeDiscount,
    }

    if (order.invoiceExternalId) {
      const invoice = await this.repo.getInvoice({
        externalId: order.invoiceExternalId,
      })
      args.invoiceId = invoice?.id
    }

    if (order.subscriptionExternalId) {
      const sub = await this.repo.getSubscription({
        externalId: order.subscriptionExternalId,
      })
      args.subscriptionId = sub?.id
    }

    return await this.repo.saveOrder(args)
  }

  async updateUserName(
    userId: string,
    firstName: string,
    lastName: string,
  ): Promise<UserRow> {
    console.table({
      userId,
      firstName,
      lastName,
    })

    const tx = await this.pgdb.transactionBegin()
    try {
      const user = await tx.public.users.updateAndGet(
        { id: userId },
        {
          firstName,
          lastName,
        },
      )

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

  verifyWebhookForCompany<T>(company: string, req: any): T {
    let whsec
    switch (company) {
      case 'PROJECT_R':
        whsec = process.env.STRIPE_PLATFORM_ENDPOINT_SECRET
        break
      case 'REPUBLIK':
        whsec = process.env.STRIPE_CONNECTED_ENDPOINT_SECRET
        break
      default:
        throw Error(`Unsupported company ${company}`)
    }

    assert(
      typeof whsec === 'string',
      `Webhook secret for ${company} is not configured`,
    )

    const event = PaymentProvider.forCompany(company).verifyWebhook<T>(
      req,
      whsec,
    )

    return event
  }

  logWebhookEvent<T>(webhook: WebhookArgs<T>): Promise<Webhook<T>> {
    return this.repo.insertWebhookEvent(webhook)
  }
  findWebhookEventBySourceId<T>(sourceId: string): Promise<Webhook<T> | null> {
    return this.repo.findWebhookEventBySourceId(sourceId)
  }
  markWebhookAsProcessed<T>(sourceId: string): Promise<Webhook<T>> {
    return this.repo.updateWebhookEvent(sourceId, { processed: true })
  }
}

/*
 * Payment Service public Interface
 */
export interface PaymentService {
  listSubscriptions(userId: string): Promise<Subscription[]>
  fetchActiveSubscription(userId: string): Promise<Subscription | null>
  setupSubscription(
    userId: string,
    args: SubscriptionArgs,
  ): Promise<Subscription>
  getSubscription(by: PaymentItemLocator): Promise<Subscription | null>
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
  getUserIdForCompanyCustomer(
    comany: Company,
    customerId: string,
  ): Promise<string | null>
  ensureUserHasCustomerIds(userId: string): Promise<void>
  createCustomer(company: Company, userId: string): any
  listUserOrders(userId: string): Promise<Order[]>
  getOrder(id: string): Promise<Order>
  saveOrder(userId: string, order: OrderArgs): Promise<Order>
  getSubscriptionInvoices(subscriptionId: string): Promise<Invoice>
  getInvoice(by: PaymentItemLocator): Promise<Invoice | null>
  saveInvoice(userId: string, args: InvoiceArgs): Promise<Invoice>
  updateInvoice(
    by: PaymentItemLocator,
    args: InvoiceUpdateArgs,
  ): Promise<Invoice>
  verifyWebhookForCompany<T>(company: string, req: any): T
  logWebhookEvent<T>(webhook: WebhookArgs<T>): Promise<Webhook<T>>
  findWebhookEventBySourceId<T>(sourceId: string): Promise<Webhook<T> | null>
  markWebhookAsProcessed<T>(sourceId: string): Promise<Webhook<T>>
  updateUserName(
    userId: string,
    firstName: string,
    lastName: string,
  ): Promise<UserRow>
  sendSetupSubscriptionTransactionalMail({
    subscriptionExternalId,
    userId,
    orderId,
  }: {
    subscriptionExternalId: string
    userId: string
    orderId: string
  }): Promise<void>
  syncMailchimp({
    userId,
    subscriptionExternalId,
  }: {
    userId: string
    subscriptionExternalId: string
  }): Promise<void>
}
