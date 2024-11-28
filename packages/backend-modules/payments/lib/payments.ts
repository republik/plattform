import { PgDb } from 'pogi'
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
  SubscriptionStatus,
  Address,
  ChargeUpdate,
  ChargeInsert,
  NOT_STARTED_STATUS_TYPES,
} from './types'
import assert from 'node:assert'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { StripeCustomerCreateWorker } from './workers/StripeCustomerCreateWorker'
import { UserRow } from '@orbiting/backend-modules-types'
import {
  sendCancelConfirmationMail,
  sendEndedNoticeMail,
  sendPaymentFailedNoticeMail,
  sendRevokeCancellationConfirmationMail,
  sendSetupSubscriptionMail,
} from './transactionals/sendTransactionalMails'
import { enforceSubscriptions } from '@orbiting/backend-modules-mailchimp'
import { getConfig } from './config'
import {
  PaymentWebhookRepo,
  WebhookArgs,
  WebhookRepo,
} from './database/WebhookRepo'
import { CustomerRepo, PaymentCustomerRepo } from './database/CutomerRepo'
import {
  BillingRepo,
  OrderArgs,
  OrderRepoArgs,
  PaymentBillingRepo,
} from './database/BillingRepo'
import { UserDataRepo } from './database/UserRepo'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { UserEvents } = require('@orbiting/backend-modules-auth')

export const Companies: readonly Company[] = ['PROJECT_R', 'REPUBLIK'] as const

const RegionNames = new Intl.DisplayNames(['de-CH'], { type: 'region' })

export class Payments implements PaymentService {
  static #instance: PaymentService
  protected pgdb: PgDb
  protected webhooks: PaymentWebhookRepo
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
    this.webhooks = new WebhookRepo(pgdb)
    this.customers = new CustomerRepo(pgdb)
    this.billing = new BillingRepo(pgdb)
    this.users = new UserDataRepo(pgdb)

    UserEvents.onSignedIn(async ({ userId }: { userId: string }) => {
      if (process.env.PAYMENTS_CREATE_CUSTOMERS_ON_LOGIN === 'true') {
        await this.ensureUserHasCustomerIds(userId)
      }
    })
    UserEvents.onEmailUpdated(
      async (args: { userId: string; newEmail: string }) => {
        await Promise.all(
          Companies.map((c) =>
            this.updateCustomerEmail(c, args.userId, args.newEmail),
          ),
        )
      },
    )
  }

  async sendSetupSubscriptionTransactionalMail({
    subscriptionExternalId,
    userId,
    invoiceId,
  }: {
    subscriptionExternalId: string
    userId: string
    invoiceId: string
  }): Promise<void> {
    const subscription = await this.billing.getSubscription({
      externalId: subscriptionExternalId,
    })

    if (!subscription) {
      throw new Error(
        `Subscription [${subscriptionExternalId}] does not exist in the Database`,
      )
    }

    if (!ACTIVE_STATUS_TYPES.includes(subscription.status)) {
      throw new Error(
        `not sending transactional for subscription ${subscriptionExternalId} with status ${subscription.status}`,
      )
    }
    const userRow = await this.getUser(userId)

    const invoice = await this.billing.getInvoice({ id: invoiceId })
    if (!invoice) {
      throw new Error(
        `Invoice ${invoiceId} does not exist in the database, not able to send subscription setup confirmation transactional mail.`,
      )
    }
    // send mail
    await sendSetupSubscriptionMail(
      { subscription, invoice, email: userRow.email },
      this.pgdb,
    )
  }

  async sendCancelConfirmationTransactionalMail({
    subscriptionExternalId,
    userId,
  }: {
    subscriptionExternalId: string
    userId: string
  }): Promise<void> {
    const subscription = await this.billing.getSubscription({
      externalId: subscriptionExternalId,
    })

    const userRow = await this.users.findUserById(userId)

    if (!subscription) {
      throw new Error(
        `Subscription [${subscriptionExternalId}] does not exist in the Database`,
      )
    }

    if (!ACTIVE_STATUS_TYPES.includes(subscription.status)) {
      throw new Error(
        `not sending cancellation confirmation transactional for subscription ${subscriptionExternalId} with status ${subscription.status}`,
      )
    }

    if (!subscription.cancelAt || !subscription.canceledAt) {
      throw new Error(
        `Subscription ${subscriptionExternalId} is not cancelled, not sending cancellation confirmation transactional`,
      )
    }

    if (!userRow?.email) {
      throw new Error(
        `Could not find email for user with id ${userId}, not sending cancellation confirmation transactional`,
      )
    }

    await sendCancelConfirmationMail(
      {
        endDate: subscription.cancelAt,
        cancellationDate: subscription.canceledAt,
        type: subscription.type,
        userId: userId,
        email: userRow.email,
      },
      this.pgdb,
    )
  }

  async sendRevokeCancellationConfirmationTransactionalMail({
    subscriptionExternalId,
    userId,
    revokedCancellationDate,
  }: {
    subscriptionExternalId: string
    userId: string
    revokedCancellationDate: Date
  }): Promise<void> {
    const subscription = await this.billing.getSubscription({
      externalId: subscriptionExternalId,
    })

    const userRow = await this.getUser(userId)

    if (!subscription) {
      throw new Error(
        `Subscription [${subscriptionExternalId}] does not exist in the Database`,
      )
    }

    if (subscription.cancelAt) {
      throw new Error(
        `Subscription ${subscriptionExternalId} is still cancelled, not sending revoke cancellation confirmation transactional`,
      )
    }

    if (!userRow.email) {
      throw new Error(
        `Could not find email for user with id ${userId}, not sending revoke cancellation confirmation transactional`,
      )
    }

    await sendRevokeCancellationConfirmationMail(
      {
        currentEndDate: subscription.currentPeriodEnd,
        revokedCancellationDate,
        type: subscription.type,
        userId,
        email: userRow.email,
      },
      this.pgdb,
    )
  }

  async sendSubscriptionEndedNoticeTransactionalMail({
    userId,
    subscriptionExternalId,
    cancellationReason,
  }: {
    userId: string
    subscriptionExternalId: string
    cancellationReason?: string
  }): Promise<void> {
    const subscription = await this.billing.getSubscription({
      externalId: subscriptionExternalId,
    })

    const userRow = await this.users.findUserById(userId)

    if (!subscription) {
      throw new Error(
        `Subscription [${subscriptionExternalId}] does not exist in the Database`,
      )
    }

    if (ACTIVE_STATUS_TYPES.includes(subscription.status)) {
      throw new Error(
        `not sending ended notice transactional for subscription ${subscriptionExternalId} with status ${subscription.status}`,
      )
    }

    if (!subscription.endedAt) {
      throw new Error(
        `Subscription ${subscriptionExternalId} has not ended, not sending ended notice transactional`,
      )
    }

    if (!userRow?.email) {
      throw new Error(
        `Could not find email for user with id ${userId}, not sending ended notice transactional`,
      )
    }

    await sendEndedNoticeMail(
      { subscription, cancellationReason, email: userRow.email },
      this.pgdb,
    )
  }

  async sendNoticePaymentFailedTransactionalMail({
    userId,
    subscriptionExternalId,
    invoiceExternalId,
  }: {
    userId: string
    subscriptionExternalId: string
    invoiceExternalId: string
  }): Promise<void> {
    const subscription = await this.billing.getSubscription({
      externalId: subscriptionExternalId,
    })

    const invoice = await this.billing.getInvoice({
      externalId: invoiceExternalId,
    })

    const userRow = await this.users.findUserById(userId)

    if (!subscription) {
      throw new Error(
        `Subscription [${subscriptionExternalId}] does not exist in the Database`,
      )
    }

    if (!invoice) {
      throw new Error(
        `Invoice ${invoiceExternalId} does not exist in the Database`,
      )
    }

    if (!ACTIVE_STATUS_TYPES.includes(subscription.status)) {
      throw new Error(
        `not sending payment failed notice transactional for subscription ${subscriptionExternalId} with status ${subscription.status}`,
      )
    }

    if (invoice.status !== 'open') {
      throw new Error(
        `not sending payment failed notice transactional for subscription ${subscriptionExternalId}, invoice ${invoiceExternalId} is not in state open but ${invoice.status}`,
      )
    }

    if (subscription.endedAt) {
      throw new Error(
        `Subscription ${subscriptionExternalId} has ended, not sending failed payment notice transactional`,
      )
    }

    if (!userRow?.email) {
      throw new Error(
        `Could not find email for user with id ${userId}, not sending failed payment notice transactional`,
      )
    }

    await sendPaymentFailedNoticeMail(
      { subscription, invoice, email: userRow.email },
      this.pgdb,
    )
  }

  async syncMailchimpSetupSubscription({
    userId,
    subscriptionExternalId,
  }: {
    userId: string
    subscriptionExternalId: string
  }): Promise<void> {
    const subscribeToOnboardingMails = await this.isUserFirstTimeSubscriber(
      userId,
      subscriptionExternalId,
    )

    // sync to mailchimp
    await enforceSubscriptions({
      userId: userId,
      subscribeToOnboardingMails: subscribeToOnboardingMails,
      subscribeToEditorialNewsletters: true,
      pgdb: this.pgdb,
    })
  }

  async syncMailchimpUpdateSubscription({
    userId,
  }: {
    userId: string
    subscriptionExternalId: string
  }): Promise<void> {
    // sync to mailchimp
    await enforceSubscriptions({
      userId: userId,
      subscribeToOnboardingMails: false,
      subscribeToEditorialNewsletters: false,
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

  async getCharge(by: PaymentItemLocator) {
    return await this.billing.getCharge(by)
  }

  async saveCharge(args: ChargeInsert): Promise<any> {
    return await this.billing.saveCharge(args)
  }

  async updateCharge(by: PaymentItemLocator, args: ChargeUpdate): Promise<any> {
    return this.billing.updateCharge(by, args)
  }

  async getInvoice(by: PaymentItemLocator): Promise<Invoice | null> {
    return await this.billing.getInvoice(by)
  }

  async updateInvoice(
    by: PaymentItemLocator,
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

  getSubscription(by: PaymentItemLocator): Promise<Subscription | null> {
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
    locator: PaymentItemLocator,
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
            priority: 1000,
            singletonKey: `stripe:customer:create:for:${userId}:${company}`,
            singletonHours: 1,
            retryLimit: 5,
            retryDelay: 500,
          },
        )
      }
    })

    await Promise.all(tasks)
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

  async updateCustomerEmail(company: Company, userId: string, email: string) {
    const customer = await this.customers.getCustomerIdForCompany(
      userId,
      company,
    )
    if (!customer) {
      return null
    }

    PaymentProvider.forCompany(company).updateCustomerEmail(
      customer.customerId,
      email,
    )
  }

  async saveOrder(userId: string, order: OrderArgs): Promise<Order> {
    const args: OrderRepoArgs = {
      userId: userId,
      company: order.company,
      externalId: order.externalId,
      status: order.status,
      invoiceId: order.invoiceId,
      subscriptionId: order.subscriptionId,
    }
    return await this.billing.saveOrder(args)
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

  async updateUserAddress(
    userId: string,
    addressData: Address,
  ): Promise<UserRow> {
    const tx = await this.pgdb.transactionBegin()
    const txUserRepo = new UserDataRepo(tx)
    try {
      const user = await txUserRepo.findUserById(userId)
      if (!user) {
        throw Error(`User ${userId} does not exist`)
      }

      const args = {
        name: `${user.firstName} ${user.lastName}`,
        city: addressData.city,
        line1: addressData.line1,
        line2: addressData.line2,
        postalCode: addressData.postal_code,
        country: RegionNames.of(addressData.country!),
      }

      if (user.addressId) {
        await tx.public.addresses.update({ id: user.addressId }, args)
      } else {
        const address = await txUserRepo.insertAddress(args)

        await txUserRepo.updateUser(user.id, {
          addressId: address.id,
        })
      }

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
        whsec = getConfig().PROJECT_R_STRIPE_ENDPOINT_SECRET
        break
      case 'REPUBLIK':
        whsec = getConfig().REPUBLIK_STRIPE_ENDPOINT_SECRET
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
    return this.webhooks.insertWebhookEvent(webhook)
  }
  findWebhookEventBySourceId<T>(sourceId: string): Promise<Webhook<T> | null> {
    return this.webhooks.findWebhookEventBySourceId(sourceId)
  }
  markWebhookAsProcessed<T>(sourceId: string): Promise<Webhook<T>> {
    return this.webhooks.updateWebhookEvent(sourceId, { processed: true })
  }

  private async getUser(userId: string): Promise<UserRow> {
    return this.pgdb.public.users.findOne({ id: userId })
  }

  private async isUserFirstTimeSubscriber(
    userId: string,
    subscriptionExternalId: string,
  ): Promise<boolean> {
    const memberships = await this.pgdb.public.memberships.find({
      userId: userId,
    })
    const subscriptions = await this.pgdb.payments.subscriptions.find({
      'externalId !=': subscriptionExternalId,
      status: NOT_STARTED_STATUS_TYPES,
    })
    return !(memberships?.length > 0 || subscriptions?.length > 0)
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
  ): Promise<{ customerId: string; company: Company } | null>
  getUserIdForCompanyCustomer(
    copmany: Company,
    customerId: string,
  ): Promise<string | null>
  ensureUserHasCustomerIds(userId: string): Promise<void>
  createCustomer(company: Company, userId: string): Promise<string>
  updateCustomerEmail(company: Company, userId: string, email: string): any
  listUserOrders(userId: string): Promise<Order[]>
  getOrder(id: string): Promise<Order | null>
  saveOrder(userId: string, order: OrderArgs): Promise<Order>
  getSubscriptionInvoices(subscriptionId: string): Promise<Invoice>
  getInvoice(by: PaymentItemLocator): Promise<Invoice | null>
  saveInvoice(userId: string, args: InvoiceArgs): Promise<Invoice>
  getCharge(by: PaymentItemLocator): Promise<any>
  saveCharge(args: ChargeInsert): Promise<any>
  updateCharge(by: PaymentItemLocator, args: ChargeUpdate): Promise<any>
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
  updateUserAddress(userId: string, addressData: Address): Promise<UserRow>
  sendSetupSubscriptionTransactionalMail({
    subscriptionExternalId,
    userId,
    invoiceId,
  }: {
    subscriptionExternalId: string
    userId: string
    invoiceId: string
  }): Promise<void>
  sendCancelConfirmationTransactionalMail({
    subscriptionExternalId,
    userId,
  }: {
    subscriptionExternalId: string
    userId: string
  }): Promise<void>
  syncMailchimpSetupSubscription({
    userId,
    subscriptionExternalId,
  }: {
    userId: string
    subscriptionExternalId: string
  }): Promise<void>
  syncMailchimpUpdateSubscription({ userId }: { userId: string }): Promise<void>
  sendSubscriptionEndedNoticeTransactionalMail({
    userId,
    subscriptionExternalId,
    cancellationReason,
  }: {
    userId: string
    subscriptionExternalId: string
    cancellationReason?: string
  }): Promise<void>
  sendNoticePaymentFailedTransactionalMail({
    userId,
    subscriptionExternalId,
    invoiceExternalId,
  }: {
    userId: string
    subscriptionExternalId: string
    invoiceExternalId: string
  }): Promise<void>
  sendRevokeCancellationConfirmationTransactionalMail({
    subscriptionExternalId,
    userId,
    revokedCancellationDate,
  }: {
    subscriptionExternalId: string
    userId: string
    revokedCancellationDate: Date
  }): Promise<void>
}
