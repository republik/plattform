import { PgDb } from 'pogi'
import {
  CustomerRepo,
  OrderArgs,
  OrderRepo,
  PaymentWebhookRepo,
  SubscriptionRepo,
  WebhookArgs,
} from './repo'
import { Company, Order, Subscription, Webhook } from '../types'

export class PgPaymentRepo
  implements CustomerRepo, OrderRepo, SubscriptionRepo, PaymentWebhookRepo
{
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

  findWebhookEvent<T>(
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

  async getCustomerIdForCompany(
    userId: string,
    company: Company,
  ): Promise<{ companyId: string; company: Company } | null> {
    const row = await this.#pgdb.payments.stripeCustomers.findOne(
      {
        userId,
        company,
      },
      { fields: ['customerId', 'company'] },
    )

    return row
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

  async saveCustomerIds(
    userId: string,
    customerIds: { customerId: string; company: string }[],
  ): Promise<void> {
    const values = customerIds.map((c) => {
      return { userId, company: c.company, customerId: c.customerId }
    })

    await this.#pgdb.payments.stripeCustomers.insert(values)
  }

  getOrder(orderId: string): Promise<Order> {
    return this.#pgdb.payments.orders.findOne({
      id: orderId,
    })
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await this.#pgdb.payments.orders.findWhere({
      userId,
    })
  }

  async saveOrder(userId: string, order: OrderArgs): Promise<Order> {
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

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.#pgdb.payments.subscriptions.findWhere({
      userId,
    })
  }
  async addUserSubscriptions(
    userId: string,
    args: object,
  ): Promise<Subscription> {
    console.log({
      userId,
      args,
    })
    throw new Error('Method not implemented.')
  }
}
