import { PgDb } from 'pogi'
import {
  OrderArgs,
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
  InvoiceArgs,
  Invoice,
  ACTIVE_STATUS_TYPES,
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
  ): Promise<{ companyId: string; company: Company } | null> {
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

  saveOrder(userId: string, order: OrderArgs): Promise<Order> {
    return this.#pgdb.payments.orders.insert({
      userId,
      externalId: order.externalId,
      company: order.company,
      items: order.items,
      paymentStatus: order.paymentStatus,
      total: order.total,
      totalBeforeDiscount: order.totalBeforeDiscount,
    })
  }

  getSubscription(by: PaymentItemLocator): Promise<Subscription> {
    return this.#pgdb.payments.subscriptions.findOne(by)
  }

  getActiveUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.#pgdb.payments.subscriptions.find({
      userId,
      'status !=': 'ended',
    })
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

  getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.#pgdb.payments.subscriptions.find({
      userId,
    })
  }

  addUserSubscriptions(
    userId: string,
    args: SubscriptionArgs,
  ): Promise<Subscription> {
    return this.#pgdb.payments.subscriptions.insert({
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

  saveInvoice(userId: string, args: InvoiceArgs): Promise<any> {
    return this.#pgdb.payments.invoices.insert({
      userId,
      ...args,
    })
  }

  updateInvoice(by: PaymentItemLocator, args: any): Promise<Invoice> {
    return this.#pgdb.payments.invoices.update(by, {
      ...args,
    })
  }

  async getUser(userId: string): Promise<UserRow> {
    return this.#pgdb.public.users.findOne({id: userId})
  }
}
