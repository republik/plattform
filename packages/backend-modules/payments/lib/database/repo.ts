import { UserRow } from '@orbiting/backend-modules-types'
import type {
  Company,
  Order,
  Subscription,
  SubscriptionArgs,
  PaymentItemLocator,
  SubscriptionUpdateArgs,
  Webhook,
  WebhookSource,
} from '../types'

export type WebhookArgs<T> = {
  source: WebhookSource
  company: Company
  sourceId: string
  payload: T
}

export type WebhookUpdateArgs<T> = {
  company?: Company
  sourceId?: string
  processed?: boolean
  payload?: T
}

export interface PaymentWebhookRepo {
  insertWebhookEvent<T>(webhook: WebhookArgs<T>): Promise<Webhook<T>>
  findWebhookEventBySourceId<T>(sourceId: string): Promise<Webhook<T> | null>
  updateWebhookEvent<T>(
    eventId: string,
    webhook: WebhookUpdateArgs<T>,
  ): Promise<Webhook<T>>
}

export interface CustomerRepo {
  getCustomerIdForCompany(
    userId: string,
    company: Company,
  ): Promise<{ companyId: string; company: Company } | null>
  saveCustomerIdForCompany(
    userId: string,
    company: Company,
    customerId: string,
  ): Promise<string>
  saveCustomerIds(
    userId: string,
    customerIds: { customerId: string; company: string }[],
  ): Promise<void>
}

export interface SubscriptionRepo {
  getSubscription(by: PaymentItemLocator): Promise<Subscription>
  getUserSubscriptions(userId: string): Promise<Subscription[]>
  addUserSubscriptions(
    userId: string,
    args: SubscriptionArgs,
  ): Promise<Subscription>
  updateSubscription(
    by: PaymentItemLocator,
    args: SubscriptionUpdateArgs,
  ): Promise<Subscription>
}

export type OrderArgs = {
  total: number
  totalBeforeDiscount: number
  company: Company
  paymentStatus: 'paid' | 'unpaid'
  items: any
  externalId: string
  invocieExternalId?: string
  subscriptionExternalId?: string
}

export interface OrderRepo {
  getUserOrders(userId: string): Promise<Order[]>
  getOrder(orderId: string): Promise<Order>
  saveOrder(userId: string, order: OrderArgs): Promise<Order>
  saveInvoice(userId: string, args: any): Promise<any>
  updateInvoice(by: PaymentItemLocator, args: any): Promise<any>
}

export interface TransactionalRepo {
  getUser(userId: string): Promise<UserRow>
  getOrderBySubscription(subscriptionId: string): Promise<Order>
}

export interface PaymentServiceRepo
  extends CustomerRepo,
    OrderRepo,
    SubscriptionRepo,
    PaymentWebhookRepo {}
