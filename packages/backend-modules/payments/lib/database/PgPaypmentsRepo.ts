import { PgDb } from 'pogi'
import { OrderArgs, PaymentServiceRepo, WebhookArgs } from './repo'
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
} from '../types'

export class PgPaymentRepo implements PaymentServiceRepo {
  #pgdb: PgDb

  constructor(pgdb: PgDb) {
    this.#pgdb = pgdb
  }

  logWebhookEvent<T>(webhook: WebhookArgs<T>): Promise<Webhook<T>> {
    return this.#pgdb.payments.webhooks.insertAndGet({
      sourceId: webhook.sourceId,
      source: webhook.source,
      payload: webhook.payload,
      processed: false,
    })
  }

  findWebhookEventBySourceId<T>(
    sourceId: string,
    processed?: boolean,
  ): Promise<Webhook<T> | null> {
    return this.#pgdb.payments.webhoook.findOne({
      sourceId,
      processed,
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

  async getUserIdByCustomerId(customerId: string): Promise<string | null> {
    const row = await this.#pgdb.payments.stripeCustomers.findOne({
      customerId,
    })

    return row?.userId
  }

  saveCustomerIdForCompany(
    userId: string,
    company: Company,
    customerId: string,
  ): Promise<string> {
    return this.#pgdb.payments.stipeCustomers.insertAndGet(
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
      gatewayId: order.gatewayId,
      company: order.customerId,
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
    return this.#pgdb.payments.subscriptions.updateAndGet(by, args)
  }

  saveInvoice(userId: string, args: InvoiceArgs): Promise<any> {
    return this.#pgdb.payments.invoices.insert({
      userId,
      ...args,
    })
  }

  async updateInvoice(by: PaymentItemLocator, args: any): Promise<Invoice> {
    return this.#pgdb.payments.invoices.update(by, {
      ...args,
    })
  }
}
