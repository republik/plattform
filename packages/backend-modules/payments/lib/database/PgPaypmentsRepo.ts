import { PgDb } from 'pogi'
import {
  OrderRepoArgs,
  PaymentServiceRepo,
  WebhookArgs,
  WebhookUpdateArgs,
} from './repo'
import {
  Company,
  Order,
  Subscription,
  SubscriptionArgs,
  SubscriptionUpdateArgs,
  PaymentItemLocator,
  Webhook,
  Invoice,
  ACTIVE_STATUS_TYPES,
  NOT_STARTED_STATUS_TYPES,
  InvoiceRepoArgs,
  SubscriptionStatus,
  STATUS_TYPES,
  ChargeUpdate,
  ChargeInsert,
} from '../types'
import { UserRow } from '@orbiting/backend-modules-types'

export class PgPaymentRepo implements PaymentServiceRepo {
  #pgdb: PgDb

  constructor(pgdb: PgDb) {
    this.#pgdb = pgdb
  }

  insertWebhookEvent<T>(webhook: WebhookArgs<T>): Promise<Webhook<T>> {
    return this.#pgdb.payments.webhooks.insertAndGet({
      sourceId: webhook.sourceId,
      source: webhook.source,
      company: webhook.company,
      payload: webhook.payload,
      processed: false,
    })
  }

  updateWebhookEvent<T>(
    sourceId: string,
    webhook: WebhookUpdateArgs<T>,
  ): Promise<Webhook<T>> {
    return this.#pgdb.payments.webhooks.updateAndGet({ sourceId }, webhook)
  }

  findWebhookEventBySourceId<T>(sourceId: string): Promise<Webhook<T> | null> {
    return this.#pgdb.payments.webhooks.findOne({
      sourceId,
    })
  }

  getWebhookEvent<T>(id: string): Promise<Webhook<T>> {
    return this.#pgdb.payments.webhoook.findOne({
      id,
    })
  }

  getCustomerIdForCompany(
    userId: string,
    company: Company,
  ): Promise<{ customerId: string; company: Company } | null> {
    return this.#pgdb.payments.stripeCustomers.findOne(
      {
        userId,
        company,
      },
      { fields: ['customerId', 'company'] },
    )
  }

  saveCustomerIdForCompany(
    userId: string,
    company: Company,
    customerId: string,
  ): Promise<string> {
    return this.#pgdb.payments.stripeCustomers.insertAndGet(
      {
        userId,
        company,
        customerId,
      },
      { return: ['id'] },
    )
  }

  saveCustomerIds(
    userId: string,
    customerIds: { customerId: string; company: string }[],
  ): Promise<void> {
    const values = customerIds.map((c) => {
      return { userId, company: c.company, customerId: c.customerId }
    })

    return this.#pgdb.payments.stripeCustomers.insert(values)
  }

  getOrder(orderId: string): Promise<Order> {
    return this.#pgdb.payments.orders.findOne({
      id: orderId,
    })
  }

  getUserOrders(userId: string): Promise<Order[]> {
    return this.#pgdb.payments.orders.findWhere({
      userId,
    })
  }

  saveOrder(order: OrderRepoArgs): Promise<Order> {
    return this.#pgdb.payments.orders.insertAndGet(order)
  }

  getSubscription(by: PaymentItemLocator): Promise<Subscription | null> {
    return this.#pgdb.payments.subscriptions.findOne(by)
  }

  getActiveUserSubscription(userId: string): Promise<Subscription | null> {
    return this.#pgdb.payments.subscriptions.findFirst(
      {
        userId,
        status: ACTIVE_STATUS_TYPES,
      },
      { orderBy: { currentPeriodStart: 'asc' } },
    )
  }

  getUserSubscriptions(
    userId: string,
    onlyStatus: SubscriptionStatus[] = STATUS_TYPES,
  ): Promise<Subscription[]> {
    return this.#pgdb.payments.subscriptions.find({
      userId,
      status: onlyStatus,
    })
  }

  addUserSubscriptions(
    userId: string,
    args: SubscriptionArgs,
  ): Promise<Subscription> {
    return this.#pgdb.payments.subscriptions.insertAndGet({
      userId: userId,
      ...args,
    })
  }

  updateSubscription(
    by: PaymentItemLocator,
    args: SubscriptionUpdateArgs,
  ): Promise<Subscription> {
    return this.#pgdb.payments.subscriptions.updateAndGetOne(by, args)
  }

  getInvoice(by: PaymentItemLocator): Promise<Invoice | null> {
    return this.#pgdb.payments.invoices.findOne(by)
  }

  saveInvoice(userId: string, args: InvoiceRepoArgs): Promise<Invoice> {
    return this.#pgdb.payments.invoices.insertAndGet({
      userId,
      ...args,
    })
  }

  updateInvoice(by: PaymentItemLocator, args: any): Promise<Invoice> {
    return this.#pgdb.payments.invoices.updateAndGet(by, {
      ...args,
    })
  }

  getCharge(by: PaymentItemLocator) {
    return this.#pgdb.payments.charges.findOne(by)
  }

  saveCharge(args: ChargeInsert): Promise<any> {
    return this.#pgdb.payments.charges.insert(args)
  }

  updateCharge(
    charge: PaymentItemLocator,
    args: ChargeUpdate,
  ): Promise<any | null> {
    return this.#pgdb.payments.charges.updateAndGet(charge, args)
  }

  async getUser(userId: string): Promise<UserRow> {
    return this.#pgdb.public.users.findOne({ id: userId })
  }

  async isUserFirstTimeSubscriber(
    userId: string,
    subscriptionExternalId: string,
  ): Promise<boolean> {
    const memberships = await this.#pgdb.public.memberships.find({
      userId: userId,
    })
    const subscriptions = await this.#pgdb.payments.subscriptions.find({
      'externalId !=': subscriptionExternalId,
      status: NOT_STARTED_STATUS_TYPES,
    })
    return !(memberships?.length > 0 || subscriptions?.length > 0)
  }
}
