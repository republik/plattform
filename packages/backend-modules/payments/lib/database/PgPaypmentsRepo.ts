import { PgDb } from 'pogi'
import {
  CustomerRepo,
  OrderArgs,
  OrderRepo,
  PaymentWebhookRepo,
  SubscriptionRepo,
  WebhookArgs,
} from './repo'
import { getConfig } from '../config'
import { Company, Order, Subscription, Webhook } from '../types'

export class PgPaymentRepo
  implements CustomerRepo, OrderRepo, SubscriptionRepo, PaymentWebhookRepo
{
  #pgdb: PgDb
  #schemaName: string

  constructor(pgdb: PgDb) {
    this.#pgdb = pgdb
    this.#schemaName = getConfig().schemaName
  }

  logWebhookEvent<T>(webhook: WebhookArgs<T>): Promise<Webhook<T>> {
    return this.#pgdb.payments.webhooks.insertAndGet({
      sourceId: webhook.sourceId,
      source: webhook.source,
      payload: webhook.payload,
    })
  }

  findWebhookEvent<T>(sourceId: string): Promise<Webhook<T>> {
    return this.#pgdb.payments.webhoook.findOne({
      sourceId,
    })
  }

  getCustomerIdForCompany(userId: string, company: Company): Promise<string> {
    console.log({ userId, company })
    throw new Error('Method not implemented.')
  }

  saveCustomerIdForCompany(
    userId: string,
    company: Company,
    customerId: string,
  ): Promise<string> {
    console.log({
      userId,
      company,
      customerId,
    })
    throw new Error('Method not implemented.')
  }

  async getOrders(userId: string): Promise<Order> {
    console.log(userId)
    throw new Error('Method not implemented.')
  }

  async saveOrder(userId: string, order: OrderArgs): Promise<Order> {
    console.log({ userId, order })
    throw new Error('Method not implemented.')
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const query = `select id, "hrId", kind, status, "userId", gateway, "gatewayId", "createdAt", "updatedAt" from ${
      this.#schemaName
    }.subscriptions where "userId" = :userId`
    const rows = await this.#pgdb.query(query, {
      userId,
    })

    return rows
    // return rows.map(transformRowToSubscription)
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
